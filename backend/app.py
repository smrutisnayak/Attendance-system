from flask import Flask, jsonify, request, session
from flask_cors import CORS

from config import Config
import os
import smtplib
from email.message import EmailMessage
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models import Class, Student, Teacher, Subject, Attendance, Comment
from google_sheet import get_students_from_sheet


app = Flask(__name__)
app.config.from_object(Config)

# Allow the React frontend to use Flask session cookies.
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ]
)

# Used to securely sign the login session cookie.
app.secret_key = os.getenv(
    "SECRET_KEY",
    "presenza-development-secret"
)

db.init_app(app)


# --------------------------------------------------
# USER AUTHENTICATION
# --------------------------------------------------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="teacher")


# --------------------------------------------------
# EMAIL NOTIFICATION
# --------------------------------------------------

def send_attendance_email(student, subject, date, status):
    """
    Send an attendance update email to one student.

    SMTP settings are read from .env:
    EMAIL_ADDRESS
    EMAIL_APP_PASSWORD
    SMTP_SERVER
    SMTP_PORT
    """

    sender = os.getenv("EMAIL_ADDRESS", "").strip()
    app_password = os.getenv("EMAIL_APP_PASSWORD", "").strip()
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not sender or not app_password:
        return False, "Email settings are not configured"

    # Calculate the student's updated attendance for this subject.
    records = Attendance.query.filter_by(
        student_id=student.id,
        subject_id=subject.id
    ).all()

    total_classes = len(records)

    attended = sum(
        1
        for record in records
        if record.status == "PRESENT"
    )

    absent = sum(
        1
        for record in records
        if record.status == "ABSENT"
    )

    percentage = (
        (attended / total_classes) * 100
        if total_classes > 0
        else 0
    )

    percentage = round(percentage, 2)

    if percentage >= 90:
        comment = "Excellent attendance"
    elif percentage >= 75:
        comment = "Good attendance"
    elif percentage >= 65:
        comment = "Warning: attendance is below 75%"
    else:
        comment = "Critical: attendance is very low"

    if status == "PRESENT":
        status_text = "PRESENT"
    else:
        status_text = "ABSENT"

    message = EmailMessage()

    message["Subject"] = (
        f"Attendance Update - {subject.subject_name}"
    )
    message["From"] = sender
    message["To"] = student.email

    message.set_content(
        f"""Hello {student.name},

Your attendance has been updated.

Subject: {subject.subject_name}
Date: {date}
Status: {status_text}

Your current attendance:
Total Classes: {total_classes}
Attended: {attended}
Absent: {absent}
Attendance Percentage: {percentage}%

Comment: {comment}

Regards,
Attendance Management System
CSE • E1G2
"""
    )

    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=20) as server:
            server.starttls()
            server.login(sender, app_password)
            server.send_message(message)

        return True, "Email sent successfully"

    except Exception as e:
        print(f"EMAIL ERROR for {student.email}: {e}")
        return False, str(e)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/")
def home():
    return "Attendance Management System API is running!"


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    session.clear()
    session["user_id"] = user.id
    session["user_email"] = user.email
    session["user_role"] = user.role

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200


# --------------------------------------------------
# CURRENT LOGGED-IN USER
# --------------------------------------------------

@app.route("/api/auth/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "authenticated": False
        }), 401

    user = db.session.get(User, user_id)

    if not user:
        session.clear()
        return jsonify({
            "authenticated": False
        }), 401

    return jsonify({
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "message": "Logged out successfully"
    }), 200


# --------------------------------------------------
# GET ALL STUDENTS
# --------------------------------------------------

@app.route("/api/students", methods=["GET"])
def get_students():

    students = Student.query.order_by(Student.roll_no).all()

    result = []

    for student in students:

        result.append({
            "id": student.id,
            "roll_no": student.roll_no,
            "name": student.name,
            "email": student.email,
            "class_id": student.class_id
        })

    return jsonify(result)


# --------------------------------------------------
# ADD STUDENT
# --------------------------------------------------

@app.route("/api/students", methods=["POST"])
def add_student():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data provided"
        }), 400

    roll_no = str(data.get("roll_no", "")).strip()
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    class_id = data.get("class_id")

    if not roll_no or not name or not email or not class_id:

        return jsonify({
            "error": "roll_no, name, email and class_id are required"
        }), 400

    # Check roll number
    existing_student = Student.query.filter_by(
        roll_no=roll_no
    ).first()

    if existing_student:

        return jsonify({
            "error": "Student with this roll number already exists"
        }), 409

    # Check email
    existing_email = Student.query.filter_by(
        email=email
    ).first()

    if existing_email:

        return jsonify({
            "error": "Student with this email already exists"
        }), 409

    # Check class
    class_info = Class.query.get(class_id)

    if not class_info:

        return jsonify({
            "error": "Class not found"
        }), 404

    # Create student
    student = Student(
        roll_no=roll_no,
        name=name,
        email=email,
        class_id=class_id
    )

    db.session.add(student)
    db.session.commit()

    return jsonify({

        "message": "Student added successfully",

        "student": {
            "id": student.id,
            "roll_no": student.roll_no,
            "name": student.name,
            "email": student.email,
            "class_id": student.class_id
        }

    }), 201


# --------------------------------------------------
# EDIT STUDENT
# --------------------------------------------------

@app.route("/api/students/<int:student_id>", methods=["PUT"])
def edit_student(student_id):

    student = Student.query.get(student_id)

    if not student:

        return jsonify({
            "error": "Student not found"
        }), 404

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "No data provided"
        }), 400

    roll_no = str(
        data.get("roll_no", student.roll_no)
    ).strip()

    name = str(
        data.get("name", student.name)
    ).strip()

    email = str(
        data.get("email", student.email)
    ).strip()

    class_id = data.get(
        "class_id",
        student.class_id
    )


    # Check required fields

    if not roll_no or not name or not email or not class_id:

        return jsonify({
            "error": "roll_no, name, email and class_id are required"
        }), 400


    # Check roll number belongs to another student

    existing_roll = Student.query.filter(
        Student.roll_no == roll_no,
        Student.id != student_id
    ).first()

    if existing_roll:

        return jsonify({
            "error": "Another student already has this roll number"
        }), 409


    # Check email belongs to another student

    existing_email = Student.query.filter(
        Student.email == email,
        Student.id != student_id
    ).first()

    if existing_email:

        return jsonify({
            "error": "Another student already has this email"
        }), 409


    # Check class

    class_info = Class.query.get(class_id)

    if not class_info:

        return jsonify({
            "error": "Class not found"
        }), 404


    # Update student

    student.roll_no = roll_no
    student.name = name
    student.email = email
    student.class_id = class_id

    db.session.commit()


    return jsonify({

        "message": "Student updated successfully",

        "student": {
            "id": student.id,
            "roll_no": student.roll_no,
            "name": student.name,
            "email": student.email,
            "class_id": student.class_id
        }

    }), 200


# --------------------------------------------------
# DELETE STUDENT
# --------------------------------------------------

@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    student = Student.query.get(student_id)

    if not student:

        return jsonify({
            "error": "Student not found"
        }), 404


    try:

        # Delete the student.
        #
        # Because the Student model has cascade
        # relationships, the student's attendance
        # and comments will also be removed.

        db.session.delete(student)

        db.session.commit()


        return jsonify({

            "message": "Student deleted successfully"

        }), 200


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error": str(e)

        }), 500


# --------------------------------------------------
# IMPORT STUDENTS FROM GOOGLE SHEET
# --------------------------------------------------

@app.route("/api/import-students", methods=["POST"])
def import_students():

    try:

        # ------------------------------------------
        # 1. Get the CSE E1G2 class
        # ------------------------------------------

        class_info = Class.query.filter_by(
            class_name="CSE",
            section="E1G2"
        ).first()


        # ------------------------------------------
        # 2. Create class if it doesn't exist
        # ------------------------------------------

        if not class_info:

            class_info = Class(
                class_name="CSE",
                section="E1G2"
            )

            db.session.add(class_info)
            db.session.commit()


        # ------------------------------------------
        # 3. Read Google Sheet
        # ------------------------------------------

        sheet_students = get_students_from_sheet()

        imported = []
        updated = []
        skipped = []


        # ------------------------------------------
        # 4. Process every student
        # ------------------------------------------

        for student_data in sheet_students:

            name = student_data["name"].strip()
            email = student_data["email"].strip()
            roll_no = student_data["roll_no"].strip()


            # --------------------------------------
            # Ignore empty data
            # --------------------------------------

            if not name or not email or not roll_no:

                skipped.append({
                    "name": name,
                    "roll_no": roll_no,
                    "reason": "Missing name, email or roll number"
                })

                continue


            # --------------------------------------
            # Only accept numeric roll numbers
            # --------------------------------------

            if not roll_no.isdigit():

                skipped.append({
                    "name": name,
                    "roll_no": roll_no,
                    "reason": "Invalid roll number"
                })

                continue


            # Convert 02 -> 2

            roll_no = str(int(roll_no))


            # --------------------------------------
            # Find student by roll number
            # --------------------------------------

            student = Student.query.filter_by(
                roll_no=roll_no
            ).first()


            # --------------------------------------
            # Student already exists
            # --------------------------------------

            if student:

                student.name = name
                student.email = email
                student.class_id = class_info.id

                updated.append({
                    "name": name,
                    "roll_no": roll_no,
                    "email": email
                })


            # --------------------------------------
            # New student
            # --------------------------------------

            else:

                # Check whether email is already used

                email_student = Student.query.filter_by(
                    email=email
                ).first()


                if email_student:

                    skipped.append({
                        "name": name,
                        "roll_no": roll_no,
                        "reason": "Email already belongs to another student"
                    })

                    continue


                new_student = Student(
                    name=name,
                    roll_no=roll_no,
                    email=email,
                    class_id=class_info.id
                )

                db.session.add(new_student)

                imported.append({
                    "name": name,
                    "roll_no": roll_no,
                    "email": email
                })


        # ------------------------------------------
        # Save everything
        # ------------------------------------------

        db.session.commit()


        return jsonify({

            "message": "Students imported successfully",

            "class": {
                "name": class_info.class_name,
                "section": class_info.section,
                "id": class_info.id
            },

            "imported_count": len(imported),

            "updated_count": len(updated),

            "skipped_count": len(skipped),

            "imported": imported,

            "updated": updated,

            "skipped": skipped

        }), 200


    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# ATTENDANCE SUMMARY FOR A STUDENT
# --------------------------------------------------

@app.route(
    "/api/students/<int:student_id>/attendance-summary",
    methods=["GET"]
)
def attendance_summary(student_id):

    # Find student

    student = Student.query.get(student_id)

    if not student:

        return jsonify({
            "error": "Student not found"
        }), 404


    # Get all subjects for this student's class

    subjects = Subject.query.filter_by(
        class_id=student.class_id
    ).order_by(Subject.id).all()

    result = []


    for subject in subjects:

        # Get attendance records

        records = Attendance.query.filter_by(
            student_id=student.id,
            subject_id=subject.id
        ).all()


        total_classes = len(records)


        attended = sum(
            1
            for record in records
            if record.status == "PRESENT"
        )


        absent = sum(
            1
            for record in records
            if record.status == "ABSENT"
        )


        # Calculate percentage

        if total_classes > 0:

            percentage = (
                attended / total_classes
            ) * 100

        else:

            percentage = 0


        # Calculate classes needed for 75%

        if percentage >= 75:

            classes_needed = 0

        elif total_classes == 0:

            classes_needed = 0

        else:

            classes_needed = max(
                0,
                (3 * total_classes) - (4 * attended)
            )


        result.append({

            "subject_id": subject.id,

            "subject_name":
                subject.subject_name,

            "total_classes":
                total_classes,

            "attended":
                attended,

            "absent":
                absent,

            "percentage":
                round(percentage, 2),

            "classes_needed_for_75":
                classes_needed

        })


    return jsonify({

        "student": {

            "id":
                student.id,

            "name":
                student.name,

            "roll_no":
                student.roll_no,

            "email":
                student.email

        },

        "subjects":
            result

    })


# --------------------------------------------------
# MARK ATTENDANCE
# --------------------------------------------------

@app.route("/api/attendance", methods=["POST"])
def mark_attendance():

    data = request.get_json()


    if not data:

        return jsonify({
            "error": "No data provided"
        }), 400


    student_id = data.get("student_id")

    subject_id = data.get("subject_id")

    date = data.get("date")

    status = data.get("status")


    # Check required fields

    if not student_id or not subject_id or not date or not status:

        return jsonify({
            "error":
                "student_id, subject_id, date and status are required"
        }), 400


    # Only allow Present or Absent

    status = status.upper()


    if status not in ["PRESENT", "ABSENT"]:

        return jsonify({
            "error":
                "Status must be PRESENT or ABSENT"
        }), 400


    # Check student

    student = Student.query.get(student_id)


    if not student:

        return jsonify({
            "error": "Student not found"
        }), 404


    # Check subject

    subject = Subject.query.get(subject_id)


    if not subject:

        return jsonify({
            "error": "Subject not found"
        }), 404


    # Make sure subject belongs to student's class

    if subject.class_id != student.class_id:

        return jsonify({
            "error":
                "Subject does not belong to this student's class"
        }), 400


    # Check whether attendance already exists

    existing_attendance = Attendance.query.filter_by(

        student_id=student_id,

        subject_id=subject_id,

        date=date

    ).first()


    # ------------------------------------------
    # Update existing attendance
    # ------------------------------------------

    if existing_attendance:

        existing_attendance.status = status

        db.session.commit()

        email_sent, email_error = send_attendance_email(
            student,
            subject,
            date,
            status
        )

        return jsonify({

            "message":
                "Attendance updated successfully",

            "email_sent":
                email_sent,

            "email_message":
                email_error,

            "attendance": {

                "id":
                    existing_attendance.id,

                "student_id":
                    student_id,

                "subject_id":
                    subject_id,

                "date":
                    date,

                "status":
                    status

            }

        }), 200


    # ------------------------------------------
    # Create new attendance
    # ------------------------------------------

    attendance = Attendance(

        student_id=student_id,

        subject_id=subject_id,

        date=date,

        status=status

    )


    db.session.add(attendance)

    db.session.commit()

    email_sent, email_error = send_attendance_email(
        student,
        subject,
        date,
        status
    )


    return jsonify({

        "message":
            "Attendance marked successfully",

        "email_sent":
            email_sent,

        "email_message":
            email_error,

        "attendance": {

            "id":
                attendance.id,

            "student_id":
                student_id,

            "subject_id":
                subject_id,

            "date":
                date,

            "status":
                status

        }

    }), 201


# --------------------------------------------------
# GET ATTENDANCE
# --------------------------------------------------

@app.route("/api/attendance", methods=["GET"])
def get_attendance():

    student_id = request.args.get("student_id")

    subject_id = request.args.get("subject_id")


    query = Attendance.query


    if student_id:

        query = query.filter_by(
            student_id=student_id
        )


    if subject_id:

        query = query.filter_by(
            subject_id=subject_id
        )


    attendance_records = query.order_by(
        Attendance.date.desc()
    ).all()


    result = []


    for record in attendance_records:

        result.append({

            "id":
                record.id,

            "student_id":
                record.student_id,

            "subject_id":
                record.subject_id,

            "date":
                record.date.isoformat(),

            "status":
                record.status

        })


    return jsonify(result)


# --------------------------------------------------
# GET ALL SUBJECTS
# --------------------------------------------------

@app.route("/api/subjects", methods=["GET"])
def get_subjects():

    subjects = Subject.query.filter_by(
        class_id=1
    ).all()


    result = []


    for subject in subjects:

        result.append({

            "id":
                subject.id,

            "subject_name":
                subject.subject_name,

            "class_id":
                subject.class_id

        })


    return jsonify(result)


# --------------------------------------------------
# ADD SUBJECT
# --------------------------------------------------

@app.route("/api/subjects", methods=["POST"])
def add_subject():

    data = request.get_json()


    if not data:

        return jsonify({
            "error": "No data provided"
        }), 400


    subject_name = str(
        data.get("subject_name", "")
    ).strip()


    if not subject_name:

        return jsonify({
            "error": "Subject name is required"
        }), 400


    # Find CSE E1G2 class

    class_info = Class.query.filter_by(

        class_name="CSE",

        section="E1G2"

    ).first()


    if not class_info:

        return jsonify({
            "error":
                "CSE E1G2 class not found"
        }), 404


    # Check duplicate subject

    existing_subject = Subject.query.filter_by(

        subject_name=subject_name,

        class_id=class_info.id

    ).first()


    if existing_subject:

        return jsonify({
            "error":
                "This subject already exists"
        }), 409


    subject = Subject(

        subject_name=subject_name,

        class_id=class_info.id

    )


    db.session.add(subject)

    db.session.commit()


    return jsonify({

        "message":
            "Subject added successfully",

        "subject": {

            "id":
                subject.id,

            "subject_name":
                subject.subject_name,

            "class_id":
                subject.class_id

        }

    }), 201


# --------------------------------------------------
# DATABASE TABLE CREATION
# --------------------------------------------------

with app.app_context():
    db.create_all()

    # Development account for testing login.
    # Registration can replace this later.
    demo_email = "admin@presenza.com"
    demo_password = "admin123"

    demo_user = User.query.filter_by(
        email=demo_email
    ).first()

    if not demo_user:
        demo_user = User(
            email=demo_email,
            password_hash=generate_password_hash(demo_password, method="pbkdf2:sha256"),
            role="teacher"
        )

        db.session.add(demo_user)
        db.session.commit()



# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )