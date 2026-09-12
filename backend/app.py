from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests

from config import Config
from database import db
from models import Class, Student, Teacher, Subject, Attendance, Comment
from google_sheet import get_students_from_sheet


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)


# --------------------------------------------------
# SEND ATTENDANCE EMAIL THROUGH GOOGLE APPS SCRIPT
# --------------------------------------------------

def send_attendance_email(student, subject, date, status):
    script_url = os.getenv("GOOGLE_APPS_SCRIPT_URL", "").strip()

    if not script_url:
        return False, "Google Apps Script URL is not configured"

    records = Attendance.query.filter_by(
        student_id=student.id,
        subject_id=subject.id
    ).all()

    total_classes = len(records)

    attended = sum(
        1 for record in records
        if record.status == "PRESENT"
    )

    absent = sum(
        1 for record in records
        if record.status == "ABSENT"
    )

    percentage = (
        (attended / total_classes) * 100
        if total_classes > 0
        else 0
    )

    percentage = round(percentage, 2)

    data = {
        "email": student.email,
        "student_name": student.name,
        "subject": subject.subject_name,
        "date": date,
        "status": status,
        "total_classes": total_classes,
        "attended": attended,
        "absent": absent,
        "percentage": percentage
    }

    try:
        response = requests.post(
            script_url,
            json=data,
            timeout=30
        )

        response.raise_for_status()
        result = response.json()

        if result.get("success"):
            return True, "Email sent successfully"

        return False, result.get(
            "message",
            "Email could not be sent"
        )

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

        email_sent, email_message = send_attendance_email(
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
                email_message,

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

    email_sent, email_message = send_attendance_email(
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
            email_message,

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


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )