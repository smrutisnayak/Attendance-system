import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:5000/api";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app">

      {page === "home" && (
        <Home setPage={setPage} />
      )}

      {page === "student" && (
        <StudentPortal setPage={setPage} />
      )}

      {page === "teacher" && (
        <TeacherPortal setPage={setPage} />
      )}

    </div>
  );
}


/* =====================================================
   HOME PAGE
===================================================== */

function Home({ setPage }) {

  return (
    <div className="home-page">

      <header className="main-header">

        <div>
          <h1>Attendance Management System</h1>
          <p>CSE • E1G2</p>
        </div>

      </header>


      <main className="home-content">

        <h2>Welcome 👋</h2>

        <p className="home-subtitle">
          Select a portal to continue
        </p>


        <div className="portal-container">

          {/* STUDENT PORTAL */}

          <div className="portal-card">

            <div className="portal-icon">
              🎓
            </div>

            <h3>Student Portal</h3>

            <p>
              View attendance subject-wise,
              percentage, absences and the number
              of classes needed to reach 75%.
            </p>

            <button
              className="red-button"
              onClick={() => setPage("student")}
            >
              Enter Student Portal
            </button>

          </div>


          {/* TEACHER PORTAL */}

          <div className="portal-card">

            <div className="portal-icon">
              👨‍🏫
            </div>

            <h3>Teacher Portal</h3>

            <p>
              Mark and manage attendance for all
              students and subjects.
            </p>

            <button
              className="green-button"
              onClick={() => setPage("teacher")}
            >
              Enter Teacher Portal
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =====================================================
   STUDENT PORTAL
===================================================== */

function StudentPortal({ setPage }) {

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [studentInfo, setStudentInfo] =
    useState(null);

  const [summary, setSummary] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /* LOAD STUDENTS */

  useEffect(() => {

    const loadStudents = async () => {

      try {

        const response =
          await axios.get(`${API}/students`);

        setStudents(response.data);

      } catch (err) {

        console.error(err);

        setError(
          "Could not connect to the backend."
        );

      }

    };

    loadStudents();

  }, []);


  /* SELECT STUDENT */

  const handleStudentChange = async (studentId) => {

    setSelectedStudent(studentId);

    setStudentInfo(null);
    setSummary([]);
    setError("");

    if (!studentId) {
      return;
    }


    try {

      setLoading(true);


      const student =
        students.find(
          (item) =>
            item.id === Number(studentId)
        );


      setStudentInfo(student);


      const response =
        await axios.get(
          `${API}/students/${studentId}/attendance-summary`
        );


      setSummary(
        response.data.subjects || []
      );


    } catch (err) {

      console.error(err);

      setError(
        "Could not load attendance."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="portal-page">

      {/* HEADER */}

      <header className="portal-header">

        <div>

          <h1>Student Portal</h1>

          <p>
            CSE • E1G2
          </p>

        </div>


        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Home
        </button>

      </header>


      <main className="portal-content">


        {/* SELECT STUDENT */}

        <div className="selection-box">

          <label>
            Select Student
          </label>

          <select
            value={selectedStudent}
            onChange={(e) =>
              handleStudentChange(
                e.target.value
              )
            }
          >

            <option value="">
              -- Select Student --
            </option>


            {students
              .slice()
              .sort(
                (a, b) =>
                  Number(a.roll_no) -
                  Number(b.roll_no)
              )
              .map((student) => (

                <option
                  key={student.id}
                  value={student.id}
                >
                  Roll {student.roll_no} -{" "}
                  {student.name}
                </option>

              ))}

          </select>

        </div>


        {/* ERROR */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* LOADING */}

        {loading && (

          <div className="loading">
            Loading attendance...
          </div>

        )}


        {/* STUDENT DETAILS */}

        {studentInfo && !loading && (

          <>

            <div className="student-info">

              <div>

                <span>
                  Name
                </span>

                <strong>
                  {studentInfo.name}
                </strong>

              </div>


              <div>

                <span>
                  Roll Number
                </span>

                <strong>
                  {studentInfo.roll_no}
                </strong>

              </div>


              <div>

                <span>
                  Email
                </span>

                <strong>
                  {studentInfo.email}
                </strong>

              </div>

            </div>


            <h2 className="section-title">
              Attendance Summary
            </h2>


            {summary.length === 0 ? (

              <div className="no-data">
                No attendance has been marked yet.
              </div>

            ) : (

              <div className="attendance-grid">

                {summary.map((subject) => {

                  const percentage =
                    Number(subject.percentage);


                  return (

                    <div
                      className="attendance-card"
                      key={subject.subject_id}
                    >

                      <div className="subject-header">

                        <h3>
                          {subject.subject_name}
                        </h3>


                        <span
                          className={
                            percentage < 75
                              ? "percentage red"
                              : "percentage green"
                          }
                        >
                          {percentage}%
                        </span>

                      </div>


                      <div className="attendance-stats">

                        <div>

                          <span>
                            Total Classes
                          </span>

                          <strong>
                            {subject.total_classes}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Attended
                          </span>

                          <strong className="green-text">
                            {subject.attended}
                          </strong>

                        </div>


                        <div>

                          <span>
                            Absent
                          </span>

                          <strong className="red-text">
                            {subject.absent}
                          </strong>

                        </div>

                      </div>


                      {percentage < 75 ? (

                        <div className="status-box danger">

                          ⚠️ You need to attend{" "}

                          <strong>
                            {subject.classes_needed_for_75}
                          </strong>

                          {" "}more consecutive classes
                          to reach 75%.

                        </div>

                      ) : (

                        <div className="status-box success">

                          ✓ Attendance is at or above
                          the 75% requirement.

                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            )}

          </>

        )}

      </main>

    </div>

  );
}


/* =====================================================
   TEACHER PORTAL
===================================================== */

function TeacherPortal({ setPage }) {

  const [students, setStudents] =
    useState([]);

  const [subjects, setSubjects] =
    useState([]);

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [attendance, setAttendance] =
    useState({});

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // Student management
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    roll_no: "",
    email: ""
  });
  const [studentMessage, setStudentMessage] = useState("");
  const [studentError, setStudentError] = useState("");
  const [studentSaving, setStudentSaving] = useState(false);

  // Attendance report + comments
  const [reportSubject, setReportSubject] = useState("");
  const [report, setReport] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportMessage, setReportMessage] = useState("");


  /* LOAD STUDENTS + SUBJECTS */

  useEffect(() => {

    const loadData = async () => {

      try {

        const [studentResponse, subjectResponse] =
          await Promise.all([

            axios.get(
              `${API}/students`
            ),

            axios.get(
              `${API}/subjects`
            )

          ]);


        const sortedStudents =
          studentResponse.data
            .slice()
            .sort(
              (a, b) =>
                Number(a.roll_no) -
                Number(b.roll_no)
            );


        setStudents(sortedStudents);

        setSubjects(
          subjectResponse.data
        );


      } catch (err) {

        console.error(err);

        setError(
          "Could not load students or subjects."
        );

      }

    };


    loadData();

  }, []);


  /* =====================================================
     STUDENT MANAGEMENT
  ===================================================== */

  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({ name: "", roll_no: "", email: "" });
    setStudentMessage("");
    setStudentError("");
    setShowStudentForm(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      roll_no: student.roll_no,
      email: student.email
    });
    setStudentMessage("");
    setStudentError("");
    setShowStudentForm(true);
  };

  const closeStudentForm = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
    setStudentForm({ name: "", roll_no: "", email: "" });
    setStudentMessage("");
    setStudentError("");
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    setStudentMessage("");
    setStudentError("");

    const name = studentForm.name.trim();
    const rollNo = studentForm.roll_no.trim();
    const email = studentForm.email.trim();

    if (!name || !rollNo || !email) {
      setStudentError("Please fill in name, roll number and email.");
      return;
    }

    try {
      setStudentSaving(true);

      if (editingStudent) {
        const response = await axios.put(
          `${API}/students/${editingStudent.id}`,
          {
            name,
            roll_no: rollNo,
            email,
            class_id: editingStudent.class_id || 1
          }
        );

        const updatedStudent = response.data.student;

        setStudents((previous) =>
          previous
            .map((student) =>
              student.id === editingStudent.id
                ? updatedStudent
                : student
            )
            .sort((a, b) => Number(a.roll_no) - Number(b.roll_no))
        );

        setStudentMessage("✓ Student updated successfully!");
      } else {
        const response = await axios.post(
          `${API}/students`,
          {
            name,
            roll_no: rollNo,
            email,
            class_id: 1
          }
        );

        const newStudent = response.data.student;

        setStudents((previous) =>
          [...previous, newStudent].sort(
            (a, b) => Number(a.roll_no) - Number(b.roll_no)
          )
        );

        setStudentMessage("✓ Student added successfully!");
      }

      setStudentForm({ name: "", roll_no: "", email: "" });
      setEditingStudent(null);
      setShowStudentForm(false);

    } catch (err) {
      console.error(err);
      setStudentError(
        err.response?.data?.error || "Could not save student."
      );
    } finally {
      setStudentSaving(false);
    }
  };

  const deleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Delete Roll ${student.roll_no} - ${student.name}?\n\nThis will also delete this student's attendance records.`
    );

    if (!confirmed) {
      return;
    }

    setStudentMessage("");
    setStudentError("");

    try {
      await axios.delete(`${API}/students/${student.id}`);

      setStudents((previous) =>
        previous.filter((item) => item.id !== student.id)
      );

      setAttendance((previous) => {
        const updated = { ...previous };
        delete updated[student.id];
        return updated;
      });

      setStudentMessage("✓ Student deleted successfully!");

    } catch (err) {
      console.error(err);
      setStudentError(
        err.response?.data?.error || "Could not delete student."
      );
    }
  };


  /* =====================================================
     ATTENDANCE REPORT + COMMENTS
  ===================================================== */

  const getAttendanceComment = (percentage) => {
    if (percentage >= 90) {
      return "Excellent attendance";
    }

    if (percentage >= 75) {
      return "Good attendance";
    }

    if (percentage >= 65) {
      return "Warning: attendance is below 75%";
    }

    return "Critical: attendance is very low";
  };

  const generateReport = async () => {
    setReport([]);
    setReportError("");
    setReportMessage("");

    if (!reportSubject) {
      setReportError("Please select a subject for the report.");
      return;
    }

    try {
      setReportLoading(true);

      const subject = subjects.find(
        (item) => item.id === Number(reportSubject)
      );

      const responses = await Promise.all(
        students.map((student) =>
          axios.get(
            `${API}/students/${student.id}/attendance-summary`
          )
        )
      );

      const reportRows = students.map((student, index) => {
        const subjectsForStudent =
          responses[index].data.subjects || [];

        const subjectData = subjectsForStudent.find(
          (item) => item.subject_id === Number(reportSubject)
        );

        const total = Number(subjectData?.total_classes || 0);
        const attended = Number(subjectData?.attended || 0);
        const absent = Number(subjectData?.absent || 0);

        const percentage =
          total > 0
            ? Number(((attended / total) * 100).toFixed(2))
            : 0;

        return {
          student_id: student.id,
          roll_no: student.roll_no,
          name: student.name,
          email: student.email,
          total_classes: total,
          attended,
          absent,
          percentage,
          comment: getAttendanceComment(percentage)
        };
      });

      setReport(reportRows);
      setReportMessage(
        `✓ ${subject?.subject_name || "Subject"} report generated successfully.`
      );

    } catch (err) {
      console.error(err);
      setReportError("Could not generate the attendance report.");
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReportCSV = () => {
    if (report.length === 0) {
      setReportError("Generate the report first.");
      return;
    }

    const subject = subjects.find(
      (item) => item.id === Number(reportSubject)
    );

    const headers = [
      "Roll No.",
      "Student Name",
      "Email",
      "Total Classes",
      "Attended",
      "Absent",
      "Percentage",
      "Comment"
    ];

    const rows = report.map((student) => [
      student.roll_no,
      `"${String(student.name).replace(/"/g, '""')}"`,
      `"${String(student.email).replace(/"/g, '""')}"`,
      student.total_classes,
      student.attended,
      student.absent,
      `${student.percentage}%`,
      `"${student.comment.replace(/"/g, '""')}"`
    ]);

    const csv = [
      [`Subject: ${subject?.subject_name || ""}`],
      [],
      headers,
      ...rows
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `${subject?.subject_name || "attendance"}_report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  /* MARK ONE STUDENT */

  const handleStatusChange =
    (studentId, status) => {

      /*
        Safety check:
        Do not allow attendance marking
        if no subject is selected.
      */

      if (!selectedSubject) {
        return;
      }


      setAttendance(
        (previous) => ({

          ...previous,

          [studentId]: status

        })
      );


      setMessage("");
      setError("");

    };


  /* MARK EVERYONE PRESENT */

  const markAllPresent = () => {

    if (!selectedSubject) {
      return;
    }


    const newAttendance = {};

    students.forEach((student) => {

      newAttendance[student.id] =
        "PRESENT";

    });


    setAttendance(newAttendance);

    setMessage("");
    setError("");

  };


  /* MARK EVERYONE ABSENT */

  const markAllAbsent = () => {

    if (!selectedSubject) {
      return;
    }


    const newAttendance = {};

    students.forEach((student) => {

      newAttendance[student.id] =
        "ABSENT";

    });


    setAttendance(newAttendance);

    setMessage("");
    setError("");

  };


  /* SAVE ATTENDANCE */

  const saveAttendance = async () => {

    setMessage("");
    setError("");


    /* SUBJECT REQUIRED */

    if (!selectedSubject) {

      setError(
        "Please select a subject first."
      );

      return;

    }


    /* DATE REQUIRED */

    if (!selectedDate) {

      setError(
        "Please select a date."
      );

      return;

    }


    /*
      SAVE ONLY MARKED STUDENTS

      Unmarked students are left completely
      unchanged. This allows the teacher to
      update one student or several students
      without marking the whole class.
    */

    const markedStudents =
      students.filter(
        (student) =>
          attendance[student.id]
      );


    if (markedStudents.length === 0) {

      setError(
        "Please mark attendance for at least one student."
      );

      return;

    }


    try {

      /*
        Each marked student is saved separately.

        The backend then sends the notification
        to that student's email stored in MySQL.
      */

      const requests =
        markedStudents.map((student) =>

          axios.post(
            `${API}/attendance`,
            {
              student_id:
                student.id,

              subject_id:
                Number(selectedSubject),

              date:
                selectedDate,

              status:
                attendance[student.id]

            }
          )

        );


      const results =
        await Promise.all(requests);


      const emailCount =
        results.filter(
          (result) =>
            result.data &&
            result.data.email_sent
        ).length;


      setMessage(
        `✓ Attendance updated for ${markedStudents.length} student(s). ${emailCount} notification(s) sent.`
      );


    } catch (err) {

      console.error(err);

      const serverMessage =
        err?.response?.data?.error;


      setError(
        serverMessage ||
        "Could not save attendance."
      );

    }

  };


  return (

    <div className="portal-page">

      {/* HEADER */}

      <header className="portal-header">

        <div>

          <h1>
            Teacher Portal
          </h1>

          <p>
            CSE • E1G2
          </p>

        </div>


        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Home
        </button>

      </header>


      <main className="portal-content">


        <div className="student-management-card">

          <div className="student-management-header">
            <div>
              <h2>Student Management</h2>
              <p>Add, edit or delete students from the class.</p>
            </div>

            <button
              className="green-button add-student-button"
              onClick={openAddStudent}
            >
              + Add Student
            </button>
          </div>

          {studentError && (
            <div className="error-message">
              {studentError}
            </div>
          )}

          {studentMessage && (
            <div className="success-message">
              {studentMessage}
            </div>
          )}

          {showStudentForm && (
            <div className="student-modal-overlay">
              <div className="student-modal">

                <div className="student-modal-header">
                  <h3>
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </h3>

                  <button
                    type="button"
                    className="student-modal-close"
                    onClick={closeStudentForm}
                    disabled={studentSaving}
                  >
                    ×
                  </button>
                </div>

                <form
                  className="student-form"
                  onSubmit={saveStudent}
                  style={{
                    marginBottom: "6px"
                  }}
                >

                  <div className="student-form-grid">

                    <div className="control">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={studentForm.name}
                        onChange={handleStudentFormChange}
                        placeholder="Student name"
                        autoFocus
                      />
                    </div>

                    <div className="control">
                      <label>Roll Number</label>
                      <input
                        type="text"
                        name="roll_no"
                        value={studentForm.roll_no}
                        onChange={handleStudentFormChange}
                        placeholder="Roll number"
                      />
                    </div>

                    {!editingStudent && (
                      <div className="control">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={studentForm.email}
                          onChange={handleStudentFormChange}
                          placeholder="student@example.com"
                        />
                      </div>
                    )}

                  </div>

                  {studentError && (
                    <div className="error-message">
                      {studentError}
                    </div>
                  )}

                  <div
                    className="student-form-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginTop: "4px",
                      marginBottom: "4px"
                    }}
                  >

                    {editingStudent && (
                      <button
                        type="button"
                        className="delete-student-button"
                        onClick={() => deleteStudent(editingStudent.id)}
                        disabled={studentSaving}
                        style={{
                          background: "#f4d6d6",
                          color: "#8f3f3f",
                          border: "1px solid #d8aaaa",
                          borderRadius: "8px",
                          padding: "10px 16px",
                          minHeight: "42px",
                          cursor: studentSaving ? "not-allowed" : "pointer",
                          opacity: 1,
                          fontWeight: "600"
                        }}
                      >
                        Delete This Student
                      </button>
                    )}

                    <button
                      type="submit"
                      className="green-button"
                      disabled={studentSaving}
                      style={{
                        background: "#d9ead9",
                        color: "#3f7043",
                        border: "1px solid #a9c6a9",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        minHeight: "42px",
                        cursor: studentSaving ? "not-allowed" : "pointer",
                        opacity: 1,
                        fontWeight: "600"
                      }}
                    >
                      {studentSaving
                        ? "Saving..."
                        : editingStudent
                          ? "Update Student"
                          : "Add Student"}
                    </button>

                    <button
                      type="button"
                      className="back-button form-cancel-button"
                      onClick={closeStudentForm}
                      disabled={studentSaving}
                      style={{
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #999999",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        minHeight: "42px",
                        cursor: studentSaving ? "not-allowed" : "pointer",
                        opacity: 1,
                        fontWeight: "600"
                      }}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            </div>
          )}

        </div>


        {/* SUBJECT + DATE */}

        <div className="teacher-controls">

          <div className="control">

            <label>
              Subject
            </label>


            <select
              value={selectedSubject}
              onChange={(e) => {

                setSelectedSubject(
                  e.target.value
                );

                /*
                  Clear old attendance when
                  changing the subject.
                */

                setAttendance({});

                setMessage("");
                setError("");

              }}
            >

              <option value="">
                -- Select Subject --
              </option>


              {subjects.map((subject) => (

                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {subject.subject_name}
                </option>

              ))}

            </select>

          </div>


          <div className="control">

            <label>
              Date
            </label>


            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {

                setSelectedDate(
                  e.target.value
                );

                /*
                  Clear attendance when
                  changing the date.
                */

                setAttendance({});

                setMessage("");
                setError("");

              }}
            />

          </div>

        </div>


        {/* TOOLBAR */}

        <div className="attendance-toolbar">

          <h2>
            Mark Attendance
          </h2>


          <div>

            <button
              className="small-green-button"
              disabled={!selectedSubject}
              onClick={markAllPresent}
            >
              Mark All Present
            </button>


            <button
              className="small-red-button"
              disabled={!selectedSubject}
              onClick={markAllAbsent}
            >
              Mark All Absent
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="error-message">
            {error}
          </div>

        )}


        {/* SUCCESS */}

        {message && (

          <div className="success-message">
            {message}
          </div>

        )}


        {/* STUDENT TABLE */}

        <div className="teacher-table">

          <div className="table-header">

            <div>
              Roll No.
            </div>

            <div>
              Student Name
            </div>

            <div>
              Present
            </div>

            <div>
              Absent
            </div>

            <div>
              Status
            </div>

            <div>
              Edit
            </div>

          </div>


          {students.map((student) => {

            const status =
              attendance[student.id];


            /*
              Buttons are disabled when
              no subject has been selected.
            */

            const disabled =
              !selectedSubject;


            return (

              <div
                className="table-row"
                key={student.id}
              >

                <div className="roll">
                  {student.roll_no}
                </div>


                <div className="student-name">
                  {student.name}
                </div>


                {/* PRESENT */}

                <div>

                  <button
                    className={
                      status === "PRESENT"
                        ? "present-button active"
                        : "present-button"
                    }

                    disabled={disabled}

                    onClick={() =>
                      handleStatusChange(
                        student.id,
                        "PRESENT"
                      )
                    }
                  >
                    ✓ Present
                  </button>

                </div>


                {/* ABSENT */}

                <div>

                  <button
                    className={
                      status === "ABSENT"
                        ? "absent-button active"
                        : "absent-button"
                    }

                    disabled={disabled}

                    onClick={() =>
                      handleStatusChange(
                        student.id,
                        "ABSENT"
                      )
                    }
                  >
                    ✕ Absent
                  </button>

                </div>


                {/* STATUS */}

                <div>

                  {status === "PRESENT" && (

                    <span className="status-present">
                      PRESENT
                    </span>

                  )}


                  {status === "ABSENT" && (

                    <span className="status-absent">
                      ABSENT
                    </span>

                  )}


                  {!status && (

                    <span className="status-not-marked">
                      Not marked
                    </span>

                  )}

                </div>

                {/* EDIT STUDENT */}

                <div>
                  <button
                    type="button"
                    className="edit-student-button attendance-edit-button"
                    onClick={() => openEditStudent(student)}
                    style={{
                      background: "#ffffff",
                      color: "#000000",
                      border: "1px solid #a9c6a9",
                      borderRadius: "8px",
                      cursor: "pointer",
                      opacity: 1,
                      fontWeight: "600",
                      padding: "8px 14px"
                    }}
                  >
                    Edit
                  </button>
                </div>

              </div>

            );

          })}

        </div>


        {/* SAVE */}

        <div className="save-container">

          <button
            className="save-button"
            disabled={!selectedSubject}
            onClick={saveAttendance}
          >
            Save Attendance
          </button>

        </div>


        {/* =====================================================
           ATTENDANCE REPORT
        ===================================================== */}

        <div className="student-management-card attendance-report-card">

          <div className="student-management-header">

            <div>
              <h2>Attendance Report</h2>
              <p>
                Generate a subject-wise report with attendance comments.
              </p>
            </div>

          </div>


          <div className="teacher-controls report-controls">

            <div className="control">

              <label>
                Report Subject
              </label>

              <select
                value={reportSubject}
                onChange={(e) => {
                  setReportSubject(e.target.value);
                  setReport([]);
                  setReportError("");
                  setReportMessage("");
                }}
              >

                <option value="">
                  -- Select Subject --
                </option>

                {subjects.map((subject) => (

                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.subject_name}
                  </option>

                ))}

              </select>

            </div>


            <div className="report-buttons">

              <button
                className="green-button"
                onClick={generateReport}
                disabled={!reportSubject || reportLoading}
              >
                {reportLoading
                  ? "Generating..."
                  : "Generate Report"}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={downloadReportCSV}
                disabled={report.length === 0}
              >
                Download CSV
              </button>

            </div>

          </div>


          {reportError && (
            <div className="error-message">
              {reportError}
            </div>
          )}

          {reportMessage && (
            <div className="success-message">
              {reportMessage}
            </div>
          )}


          {reportLoading && (
            <div className="loading">
              Generating attendance report...
            </div>
          )}


          {report.length > 0 && !reportLoading && (

            <div className="report-table-wrapper">

              <div className="report-table">

                <div className="report-row report-header">

                  <div>Student</div>
                  <div>Attendance Percentage</div>
                  <div>Comment</div>

                </div>


                {report.map((student) => (

                  <div
                    className="report-row"
                    key={student.student_id}
                  >

                    <div className="student-name">
                      {student.name}
                    </div>

                    <div
                      className={
                        student.percentage < 75
                          ? "red"
                          : "green"
                      }
                    >
                      <strong>
                        {student.percentage}%
                      </strong>
                    </div>

                    <div
                      className={
                        student.percentage < 75
                          ? "report-comment warning"
                          : "report-comment good"
                      }
                    >
                      {student.comment}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>


      </main>

    </div>

  );
}


export default App;