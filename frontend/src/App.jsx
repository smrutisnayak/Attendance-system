import { useEffect, useState } from "react";
import axios from "axios";
import {
  Sparkles,
  Settings,
  Target,
  Mail,
  BarChart3,
  Info,
  Rocket,
  GraduationCap,
  Users,
  CircleHelp,
  Check,
  ArrowRight,
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  UserRound,
  LogOut,
  Plus,
  CalendarCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:5000/api";

function App() {
  const [page, setPageState] = useState("home");
  const [pageHistory, setPageHistory] = useState([]);

  // Navigate forward while remembering the page we came from.
  const setPage = (nextPage) => {
    if (nextPage === page) return;

    setPageHistory((history) => [...history, page]);
    setPageState(nextPage);
  };

  // Go back to the actual previous page.
  const goBack = () => {
    setPageHistory((history) => {
      if (history.length === 0) {
        setPageState("home");
        return [];
      }

      const nextHistory = [...history];
      const previousPage = nextHistory.pop();
      setPageState(previousPage);
      return nextHistory;
    });
  };

  // Logout should completely leave the authenticated area.
  const goHome = () => {
    setPageHistory([]);
    setPageState("home");
  };

  return (
    <div className="app">

      {page === "home" && (
        <Home setPage={setPage} />
      )}

      {page === "login" && (
        <Login setPage={setPage} goBack={goBack} />
      )}

      {page === "dashboard" && (
        <Dashboard setPage={setPage} goBack={goBack} goHome={goHome} />
      )}

      {page === "student" && (
        <StudentOverview goBack={goBack} />
      )}

      {page === "student-manage" && (
        <StudentPortal setPage={setPage} goBack={goBack} autoOpen />
      )}

      {page === "teacher" && (
        <TeacherPortal setPage={setPage} goBack={goBack} />
      )}

      {page === "reports" && (
        <ReportsPortal goBack={goBack} />
      )}

    </div>
  );
}


/* =====================================================
   HOME PAGE
===================================================== */

function Home({ setPage }) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-brand">
          <img
            src="/presenza-logo.png"
            alt="Presenza"
            className="presenza-logo"
          />
        </div>

        <nav className="landing-nav">
          <button
            className="landing-nav-link active"
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <div
            className="landing-dropdown"
            onMouseEnter={() => setShowFeatures(true)}
            onMouseLeave={() => setShowFeatures(false)}
          >
            <button className="landing-nav-link">
              Features <span className="dropdown-arrow">⌄</span>
            </button>

            {showFeatures && (
              <div className="landing-dropdown-menu">
                <div className="dropdown-title">FEATURES</div>

                <div className="landing-dropdown-item">
                  <span><Users size={16} /></span>
                  <div>
                    <strong>Student Management</strong>
                    <small>Add, edit, delete and search students</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><ClipboardCheck size={16} /></span>
                  <div>
                    <strong>Attendance Management</strong>
                    <small>Mark daily attendance by subject and date</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><Eye size={16} /></span>
                  <div>
                    <strong>Student Overview</strong>
                    <small>View class and attendance information</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><BarChart3 size={16} /></span>
                  <div>
                    <strong>Reports &amp; Analytics</strong>
                    <small>View individual and subject-wise reports</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><FileText size={16} /></span>
                  <div>
                    <strong>CSV Reports</strong>
                    <small>Download attendance reports as CSV</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><Mail size={16} /></span>
                  <div>
                    <strong>Email Notifications</strong>
                    <small>Keep students informed</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><BarChart3 size={16} /></span>
                  <div>
                    <strong>Reports &amp; Analytics</strong>
                    <small>Turn attendance into useful insights</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="landing-dropdown"
            onMouseEnter={() => setShowMore(true)}
            onMouseLeave={() => setShowMore(false)}
          >
            <button className="landing-nav-link">
              More <span className="dropdown-arrow">⌄</span>
            </button>

            {showMore && (
              <div className="landing-dropdown-menu more-dropdown">
                <div className="dropdown-title">MORE</div>

                <div className="landing-dropdown-item">
                  <span><Info size={16} /></span>
                  <div>
                    <strong>About Presenza</strong>
                    <small>Learn about the platform</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><Rocket size={16} /></span>
                  <div>
                    <strong>How It Works</strong>
                    <small>Understand the workflow</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><GraduationCap size={16} /></span>
                  <div>
                    <strong>For Students</strong>
                    <small>Stay on top of attendance</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><Users size={16} /></span>
                  <div>
                    <strong>For Teachers</strong>
                    <small>Manage attendance efficiently</small>
                  </div>
                </div>

                <div className="landing-dropdown-item">
                  <span><CircleHelp size={16} /></span>
                  <div>
                    <strong>Help &amp; Support</strong>
                    <small>Get assistance with Presenza</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="landing-login-button"
            onClick={() => setPage("login")}
          >
            Login
          </button>

        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-left">
            <div className="hero-label">
              <Sparkles size={13} />
              SMART ATTENDANCE MANAGEMENT
            </div>

            <h2>
              Smarter Attendance.
              <br />
              <span>Simpler Campus Management.</span>
            </h2>

            <p>
              Presenza brings student management, attendance tracking and
              powerful reporting together in one simple platform designed
              for modern academic environments.
            </p>

            <div className="hero-actions">

              <button
                className="hero-secondary"
                onClick={() =>
                  document
                    .getElementById("features-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Features
              </button>
            </div>

            <div className="hero-trust">
              <span><Check size={15} /></span>
              <p>Built for smarter academic management</p>
            </div>
          </div>

          <div className="hero-preview">
            <div className="preview-window">
              <div className="preview-topbar">
                <div className="window-controls">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">Presenza Dashboard</div>
              </div>

              <div className="preview-content">
                <div className="preview-heading">
                  <div>
                    <small>ATTENDANCE SUMMARY</small>
                    <h3>Good Progress</h3>
                  </div>
                  <span className="active-badge">Active</span>
                </div>

                <div className="preview-stats">
                  <div className="preview-stat">
                    <span>Attendance</span>
                    <strong>87.5%</strong>
                    <small>Overall</small>
                  </div>
                  <div className="preview-stat">
                    <span>Present</span>
                    <strong>28</strong>
                    <small>Classes</small>
                  </div>
                  <div className="preview-stat">
                    <span>Absent</span>
                    <strong>4</strong>
                    <small>Classes</small>
                  </div>
                </div>

                <div className="preview-progress">
                  <div className="progress-header">
                    <span>Attendance Status</span>
                    <strong>87.5%</strong>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-value" style={{ width: "87.5%" }}></div>
                  </div>
                  <div className="progress-bottom">
                    <span>75% requirement</span>
                    <span>Above requirement</span>
                  </div>
                </div>

                <div className="preview-subjects">
                  <div><span>PPWC</span><strong>92%</strong></div>
                  <div><span>MLC</span><strong>85%</strong></div>
                  <div><span>FMI</span><strong>78%</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-strip">
          <div>
            <strong>One platform. Smarter attendance.</strong>
            <span>Simple • Transparent • Efficient</span>
          </div>
        </section>

        <section id="features-section" className="landing-section">
          <div className="section-heading">
            <span>WHY PRESENZA</span>
            <h2>Everything you need to manage attendance.</h2>
            <p>
              From everyday attendance marking to detailed reports, Presenza
              keeps everything organized and easy to understand.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon red"><Check size={19} /></div>
              <h3>Smart Attendance</h3>
              <p>
                Quickly record and update student attendance without
                unnecessary complexity.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">%</div>
              <h3>75% Monitoring</h3>
              <p>
                Easily understand attendance percentages and know when
                attendance needs attention.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon red"><Mail size={19} /></div>
              <h3>Email Notifications</h3>
              <p>
                Keep students informed when their attendance records are
                updated.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green"><BarChart3 size={19} /></div>
              <h3>Powerful Reports</h3>
              <p>
                Generate class, individual and subject-wise attendance
                reports whenever needed.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-section how-it-works">
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>Attendance made simple.</h2>
            <p>A straightforward workflow for students and teachers.</p>
          </div>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Manage</h3>
              <p>Maintain student information in one organized place.</p>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">02</div>
              <h3>Mark</h3>
              <p>Record daily attendance by subject and date.</p>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">03</div>
              <h3>Track</h3>
              <p>Monitor attendance percentages and performance.</p>
            </div>
            <div className="step-arrow"><ArrowRight size={20} /></div>
            <div className="step">
              <div className="step-number">04</div>
              <h3>Report</h3>
              <p>Generate useful attendance reports and insights.</p>
            </div>
          </div>
        </section>

        <section className="soa-highlight">
          <div className="soa-inner">
            <img
              src="/soa-logo.webp"
              alt="Siksha 'O' Anusandhan"
              className="soa-highlight-logo"
            />
            <div>
              <span>BUILT FOR SOA</span>
              <h2>Designed for a smarter academic experience.</h2>
              <p>
                Presenza provides a simple digital experience for managing
                and understanding academic attendance.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <span>GET STARTED WITH PRESENZA</span>
          <h2>Ready to simplify attendance?</h2>
          <p>
            Create your account and experience a smarter way to manage
            attendance.
          </p>
          <div className="cta-actions">
            <button
              className="hero-secondary"
              onClick={() => setPage("login")}
            >
              Login
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-brand">
          <img src="/presenza-logo.png" alt="Presenza" />
          <div>
            <strong>PRESENZA</strong>
            <span>Making Every Class Count</span>
          </div>
        </div>

        <div className="footer-links">
          <span>Home</span>
          <span>Features</span>
          <span>About</span>
          <span>Help</span>
        </div>

        <div className="footer-copy">
          © 2026 Presenza • Siksha 'O' Anusandhan
        </div>
      </footer>
    </div>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Login({ setPage, goBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password
        },
        {
          withCredentials: true
        }
      );

      if (response.data && response.data.user) {
        setPage("dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.request) {
        setError("Unable to connect to the server. Make sure the backend is running.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background" />

      <button
        className="login-back"
        onClick={goBack}
        type="button"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <div className="login-layout">
        <section className="login-brand-panel">
          <img
            src="/presenza-logo.png"
            alt="Presenza"
            className="login-logo"
          />

          <p className="login-brand-kicker">
            SMART ATTENDANCE MANAGEMENT
          </p>

          <h1>
            Welcome
            <br />
            back.
          </h1>

          <p className="login-brand-text">
            Sign in to access your Presenza workspace and manage
            attendance, students and academic reports in one place.
          </p>

          <div className="login-brand-line" />

          <div className="login-brand-points">
            <div>
              <Check size={17} />
              Simple attendance management
            </div>
            <div>
              <Check size={17} />
              Organized student records
            </div>
            <div>
              <Check size={17} />
              Clear attendance reports
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-heading">
            <div className="login-icon-box">
              <LockKeyhole size={21} />
            </div>

            <div>
              <h2>Sign in</h2>
              <p>Enter your details to continue.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>
            </div>

            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="login-divider">
            <span>Presenza</span>
          </div>

          <p className="login-note">
            Secure sign-in for your Presenza workspace.
          </p>
        </section>
      </div>
    </div>
  );
}


function Dashboard({ setPage, goBack, goHome }) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div className="dashboard-brand" onClick={() => setPage("dashboard")}>
          <img src="/presenza-logo.png" alt="Presenza" />
          <div>
            <strong>PRESENZA</strong>
            <span>Attendance Management</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button className="dashboard-nav-link active" onClick={() => setPage("dashboard")}>
            <LayoutDashboard size={17} />
            Dashboard
          </button>
          <button className="dashboard-nav-link" onClick={() => setPage("student")}>
            <Users size={17} />
            Students Overview
          </button>
        </nav>

        <div className="dashboard-user">
          <div className="dashboard-user-icon"><UserRound size={18} /></div>
          <div className="dashboard-user-text">
            <strong>Teacher</strong>
            <span>SOA University</span>
          </div>
          <button className="dashboard-logout" onClick={goHome} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-banner">
          <div className="welcome-banner-image" />
          <div className="welcome-banner-overlay" />
          <div className="welcome-banner-content">
            <div className="welcome-badge">
              <CalendarCheck size={15} />
              SOA UNIVERSITY
            </div>
            <h1>Welcome to PRESENZA</h1>
            <p>Making Every Class Count</p>
          </div>
        </section>

        <div className="dashboard-page-back">
          <button type="button" onClick={goBack}>
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>

        <section className="dashboard-heading">
          <div>
            <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
            <h2>Manage your classroom with ease.</h2>
            <p>Choose a portal below to get started.</p>
          </div>
        </section>

        <section className="portal-plaque-grid">
          <button className="portal-plaque plaque-students" onClick={() => setPage("student-manage")}>
            <div className="plaque-top">
              <div className="plaque-icon"><Users size={28} /></div>
              <span className="plaque-number">01</span>
            </div>
            <div className="plaque-content">
              <span className="plaque-kicker">STUDENT MANAGEMENT</span>
              <h3>Manage Students</h3>
              <p>Add, edit, search and view individual student attendance records.</p>
            </div>
            <span className="plaque-action">Open Portal <ArrowRight size={18} /></span>
          </button>

          <button className="portal-plaque plaque-attendance" onClick={() => setPage("teacher")}>
            <div className="plaque-top">
              <div className="plaque-icon"><ClipboardCheck size={28} /></div>
              <span className="plaque-number">02</span>
            </div>
            <div className="plaque-content">
              <span className="plaque-kicker">ATTENDANCE MANAGEMENT</span>
              <h3>Mark Attendance</h3>
              <p>Select a subject and date, then quickly record classroom attendance.</p>
            </div>
            <span className="plaque-action">Take Attendance <ArrowRight size={18} /></span>
          </button>

          <button className="portal-plaque plaque-reports" onClick={() => setPage("reports")}>
            <div className="plaque-top">
              <div className="plaque-icon"><BarChart3 size={28} /></div>
              <span className="plaque-number">03</span>
            </div>
            <div className="plaque-content">
              <span className="plaque-kicker">REPORTS &amp; ANALYTICS</span>
              <h3>View Reports</h3>
              <p>Understand class, individual and subject-wise attendance performance.</p>
            </div>
            <span className="plaque-action">View Reports <ArrowRight size={18} /></span>
          </button>
        </section>

        <section className="dashboard-overview">
          <div className="overview-heading">
            <div>
              <span className="dashboard-eyebrow">QUICK OVERVIEW</span>
              <h2>Today's snapshot</h2>
            </div>
            <span className="overview-note">Live data will appear here</span>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon"><Users size={20} /></div>
              <span>Total Students</span>
              <strong>—</strong>
            </div>
            <div className="overview-card">
              <div className="overview-icon"><ClipboardCheck size={20} /></div>
              <span>Today's Attendance</span>
              <strong>—</strong>
            </div>
            <div className="overview-card">
              <div className="overview-icon"><CalendarCheck size={20} /></div>
              <span>Classes Today</span>
              <strong>—</strong>
            </div>
            <div className="overview-card">
              <div className="overview-icon"><BarChart3 size={20} /></div>
              <span>Low Attendance</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

        <section className="quick-actions-section">
          <div>
            <span className="dashboard-eyebrow">QUICK ACTIONS</span>
            <h2>Get things done faster.</h2>
          </div>
          <div className="quick-actions">
            <button onClick={() => setPage("student-manage")}><Plus size={18} /> Add Students</button>
            <button onClick={() => setPage("teacher")}><ClipboardCheck size={18} /> Take Attendance</button>
            <button onClick={() => setPage("reports")}><FileText size={18} /> View Reports</button>
          </div>
        </section>
      </main>
    </div>
  );
}


/* =====================================================
   STUDENTS OVERVIEW
===================================================== */

function StudentOverview({ goBack }) {
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalClasses: 0,
    overallPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const studentResponse = await axios.get(`${API}/students`);
        const sortedStudents = [...studentResponse.data].sort(
          (a, b) => Number(a.roll_no) - Number(b.roll_no)
        );
        setStudents(sortedStudents);

        const summaries = await Promise.all(
          sortedStudents.map((student) =>
            axios.get(`${API}/students/${student.id}/attendance-summary`)
          )
        );

        let totalPresent = 0;
        let totalAbsent = 0;
        let totalClasses = 0;

        summaries.forEach((response) => {
          (response.data.subjects || []).forEach((subject) => {
            totalPresent += Number(subject.attended || 0);
            totalAbsent += Number(subject.absent || 0);
            totalClasses += Number(subject.total_classes || 0);
          });
        });

        const overallPercentage = totalClasses > 0
          ? Number(((totalPresent / totalClasses) * 100).toFixed(1))
          : 0;

        setAttendanceStats({
          totalPresent,
          totalAbsent,
          totalClasses,
          overallPercentage
        });
      } catch (err) {
        console.error(err);
        setError("Could not load the student overview.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const totalStudents = students.length;

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <span className="dashboard-eyebrow">STUDENTS OVERVIEW</span>
          <h1>Student Overview</h1>
          <p>View class strength, section details and overall attendance.</p>
        </div>

        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      <main className="overview-content">
        {error && <div className="error-message">{error}</div>}

        <section className="overview-identity-card">
          <div className="overview-identity-main">
            <div className="overview-large-icon"><Users size={30} /></div>
            <div>
              <span className="reports-eyebrow">CLASS INFORMATION</span>
              <h2>CSE</h2>
              <p>Section E1G2</p>
            </div>
          </div>
        </section>

        <section className="overview-stats-grid">
          <div className="overview-stat-card red-accent">
            <div className="overview-stat-icon"><Users size={21} /></div>
            <span>Total Students</span>
            <strong>{loading ? "—" : totalStudents}</strong>
            <small>Students in CSE E1G2</small>
          </div>

          <div className="overview-stat-card green-accent">
            <div className="overview-stat-icon"><Check size={21} /></div>
            <span>Total Present</span>
            <strong>{loading ? "—" : attendanceStats.totalPresent}</strong>
            <small>Recorded present entries</small>
          </div>

          <div className="overview-stat-card red-accent">
            <div className="overview-stat-icon"><CalendarCheck size={21} /></div>
            <span>Total Absent</span>
            <strong>{loading ? "—" : attendanceStats.totalAbsent}</strong>
            <small>Recorded absent entries</small>
          </div>

          <div className="overview-stat-card green-accent">
            <div className="overview-stat-icon"><BarChart3 size={21} /></div>
            <span>Overall Attendance</span>
            <strong>{loading ? "—" : `${attendanceStats.overallPercentage}%`}</strong>
            <small>Across recorded classes</small>
          </div>
        </section>

        <section className="overview-attendance-card">
          <div className="overview-card-heading">
            <div>
              <span className="reports-eyebrow">ATTENDANCE SUMMARY</span>
              <h2>Overall class attendance</h2>
              <p>Attendance recorded for this class.</p>
            </div>
            <div className="overview-percentage">
              {loading ? "—" : `${attendanceStats.overallPercentage}%`}
            </div>
          </div>

          <div className="overview-progress-track">
            <div
              className="overview-progress-value"
              style={{ width: `${Math.min(attendanceStats.overallPercentage, 100)}%` }}
            />
          </div>

          <div className="overview-attendance-details">
            <div><span>Present</span><strong>{loading ? "—" : attendanceStats.totalPresent}</strong></div>
            <div><span>Absent</span><strong>{loading ? "—" : attendanceStats.totalAbsent}</strong></div>
            <div><span>Classes Recorded</span><strong>{loading ? "—" : attendanceStats.totalClasses}</strong></div>
          </div>
        </section>
      </main>
    </div>
  );
}


/* =====================================================
   STUDENT PORTAL
===================================================== */

function StudentPortal({ setPage, goBack, autoOpen = false }) {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [searchTerm, setSearchTerm] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/students`);

      const sortedStudents = [...response.data].sort(
        (a, b) => Number(a.roll_no) - Number(b.roll_no)
      );

      setStudents(sortedStudents);

    } catch (err) {
      console.error(err);
      setStudentError("Could not load students from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (autoOpen) {
      openAddStudent();
    }
  }, [autoOpen]);

  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: "",
      roll_no: "",
      email: ""
    });
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

    setStudentForm({
      name: "",
      roll_no: "",
      email: ""
    });

    setStudentMessage("");
    setStudentError("");
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const saveStudent = async (event) => {
    event.preventDefault();

    setStudentMessage("");
    setStudentError("");

    const name = studentForm.name.trim();
    const rollNo = studentForm.roll_no.trim();
    const email = studentForm.email.trim();

    if (!name || !rollNo || !email) {
      setStudentError(
        "Please fill in the student's name, roll number and email."
      );
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
            .sort(
              (a, b) =>
                Number(a.roll_no) - Number(b.roll_no)
            )
        );

        setStudentMessage("Student information updated successfully.");

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
            (a, b) =>
              Number(a.roll_no) - Number(b.roll_no)
          )
        );

        setStudentMessage("Student added successfully.");
      }

      setShowStudentForm(false);
      setEditingStudent(null);

      setStudentForm({
        name: "",
        roll_no: "",
        email: ""
      });

    } catch (err) {
      console.error(err);

      setStudentError(
        err.response?.data?.error ||
        "Could not save student information."
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
      await axios.delete(
        `${API}/students/${student.id}`
      );

      setStudents((previous) =>
        previous.filter(
          (item) => item.id !== student.id
        )
      );

      setStudentMessage(
        "Student deleted successfully."
      );

    } catch (err) {
      console.error(err);

      setStudentError(
        err.response?.data?.error ||
        "Could not delete student."
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      String(student.roll_no)
        .toLowerCase()
        .includes(query) ||
      String(student.name)
        .toLowerCase()
        .includes(query) ||
      String(student.email)
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="portal-page">

      <header className="portal-header">
        <div>
          <span className="dashboard-eyebrow">
            STUDENT MANAGEMENT
          </span>

          <h1>Manage Students</h1>

          <p>
            CSE • E1G2
          </p>
        </div>

        <button
          className="back-button"
          onClick={goBack}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      <main className="portal-content">

        <section className="student-management-card">

          <div className="student-management-header">
            <div>
              <span className="reports-eyebrow">
                CLASS ROSTER
              </span>

              <h2>Student Information</h2>

              <p>
                Add students, update their information or remove them from the class.
              </p>
            </div>

            <button
              className="green-button add-student-button"
              onClick={openAddStudent}
            >
              <Plus size={17} />
              Add Student
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

          <div className="student-management-toolbar">

            <div className="student-count">
              <strong>{students.length}</strong>
              <span>
                {students.length === 1
                  ? "student"
                  : "students"}
              </span>
            </div>

            <input
              className="student-search-input"
              type="search"
              placeholder="Search by name, roll number or email..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          {showStudentForm && (
            <div className="student-form-card">

              <div className="student-form-card-header">
                <div>
                  <span className="reports-eyebrow">
                    {editingStudent
                      ? "EDIT STUDENT"
                      : "NEW STUDENT"}
                  </span>

                  <h3>
                    {editingStudent
                      ? "Update student information"
                      : "Add a new student"}
                  </h3>
                </div>

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

                </div>

                {studentError && (
                  <div className="error-message">
                    {studentError}
                  </div>
                )}

                <div className="student-form-actions">

                  {editingStudent && (
                    <button
                      type="button"
                      className="delete-student-button"
                      onClick={() =>
                        deleteStudent(editingStudent)
                      }
                      disabled={studentSaving}
                    >
                      Delete Student
                    </button>
                  )}

                  <button
                    type="button"
                    className="back-button form-cancel-button"
                    onClick={closeStudentForm}
                    disabled={studentSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="green-button"
                    disabled={studentSaving}
                  >
                    {studentSaving
                      ? "Saving..."
                      : editingStudent
                        ? "Update Student"
                        : "Add Student"}
                  </button>

                </div>

              </form>
            </div>
          )}

          <div className="managed-students-table">

            <div className="managed-students-header">
              <div>Roll No.</div>
              <div>Student</div>
              <div>Email</div>
              <div>Actions</div>
            </div>

            {loading ? (
              <div className="empty-students-state">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-students-state">
                {searchTerm
                  ? "No students match your search."
                  : "No students found. Add your first student."}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  className="managed-student-row"
                  key={student.id}
                >
                  <div className="managed-roll">
                    {student.roll_no}
                  </div>

                  <div className="managed-student-name">
                    <strong>{student.name}</strong>
                  </div>

                  <div className="managed-student-email">
                    {student.email}
                  </div>

                  <div className="managed-student-actions">
                    <button
                      type="button"
                      className="edit-managed-button"
                      onClick={() =>
                        openEditStudent(student)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-managed-button"
                      onClick={() =>
                        deleteStudent(student)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </main>
    </div>
  );
}


function ReportsPortal({ goBack }) {

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [reportType, setReportType] = useState("individual");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [individualReport, setIndividualReport] = useState(null);
  const [subjectReport, setSubjectReport] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentResponse, subjectResponse] = await Promise.all([
          axios.get(`${API}/students`),
          axios.get(`${API}/subjects`)
        ]);

        const sortedStudents = studentResponse.data
          .slice()
          .sort((a, b) => Number(a.roll_no) - Number(b.roll_no));

        setStudents(sortedStudents);
        setSubjects(subjectResponse.data);
      } catch (err) {
        console.error(err);
        setError("Could not load students or subjects.");
      }
    };

    loadData();
  }, []);

  const clearReports = () => {
    setIndividualReport(null);
    setSubjectReport([]);
    setError("");
    setMessage("");
  };

  const getComment = (percentage) => {
    if (percentage >= 90) return "Excellent attendance";
    if (percentage >= 75) return "Good attendance";
    if (percentage >= 65) return "Warning: attendance is below 75%";
    return "Critical: attendance is very low";
  };

  const generateIndividualReport = async () => {
    clearReports();

    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/students/${selectedStudent}/attendance-summary`
      );

      setIndividualReport(response.data);
      setMessage("Individual student report generated successfully.");
    } catch (err) {
      console.error(err);
      setError("Could not generate the individual student report.");
    } finally {
      setLoading(false);
    }
  };

  const generateSubjectReport = async () => {
    clearReports();

    if (!selectedSubject) {
      setError("Please select a subject first.");
      return;
    }

    try {
      setLoading(true);

      const responses = await Promise.all(
        students.map((student) =>
          axios.get(`${API}/students/${student.id}/attendance-summary`)
        )
      );

      const rows = students.map((student, index) => {
        const subjectData = (responses[index].data.subjects || []).find(
          (item) => item.subject_id === Number(selectedSubject)
        );

        const total = Number(subjectData?.total_classes || 0);
        const attended = Number(subjectData?.attended || 0);
        const absent = Number(subjectData?.absent || 0);
        const percentage = total > 0
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
          comment: getComment(percentage)
        };
      });

      setSubjectReport(rows);
      setMessage("Subject-wise report generated successfully.");
    } catch (err) {
      console.error(err);
      setError("Could not generate the subject-wise report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSubjectCSV = () => {
    if (subjectReport.length === 0) {
      setError("Generate the subject report first.");
      return;
    }

    const subject = subjects.find(
      (item) => item.id === Number(selectedSubject)
    );

    const rows = subjectReport.map((student) => [
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
      ["Roll No.", "Student Name", "Email", "Total Classes", "Attended", "Absent", "Percentage", "Comment"],
      ...rows
    ].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${subject?.subject_name || "subject"}_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadIndividualCSV = () => {
    if (!individualReport) {
      setError("Generate the individual report first.");
      return;
    }

    const rows = (individualReport.subjects || []).map((subject) => [
      `"${String(subject.subject_name).replace(/"/g, '""')}"`,
      subject.total_classes,
      subject.attended,
      subject.absent,
      `${subject.percentage}%`,
      `"${getComment(Number(subject.percentage)).replace(/"/g, '""')}"`
    ]);

    const csv = [
      [`Student: ${individualReport.student?.name || ""}`],
      [`Roll No.: ${individualReport.student?.roll_no || ""}`],
      [],
      ["Subject", "Total Classes", "Attended", "Absent", "Percentage", "Comment"],
      ...rows
    ].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${individualReport.student?.roll_no || "student"}_attendance_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <span className="reports-eyebrow">REPORTS &amp; ANALYTICS</span>
          <h1>Attendance Reports</h1>
          <p>Generate individual student and subject-wise attendance reports.</p>
        </div>

        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </header>

      <main className="reports-content">
        <section className="reports-selector-card">
          <div className="report-type-tabs">
            <button
              className={reportType === "individual" ? "report-type-tab active" : "report-type-tab"}
              onClick={() => {
                setReportType("individual");
                clearReports();
              }}
            >
              <UserRound size={18} />
              Individual Student
            </button>

            <button
              className={reportType === "subject" ? "report-type-tab active" : "report-type-tab"}
              onClick={() => {
                setReportType("subject");
                clearReports();
              }}
            >
              <BarChart3 size={18} />
              Subject-wise Report
            </button>
          </div>

          {reportType === "individual" ? (
            <div className="report-generator">
              <div className="report-generator-heading">
                <div className="report-generator-icon"><UserRound size={22} /></div>
                <div>
                  <h2>Individual Student Report</h2>
                  <p>View attendance across every subject for one student.</p>
                </div>
              </div>

              <div className="report-form-row">
                <div className="control">
                  <label>Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => {
                      setSelectedStudent(e.target.value);
                      clearReports();
                    }}
                  >
                    <option value="">-- Select Student --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.roll_no} — {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="green-button report-generate-button"
                  onClick={generateIndividualReport}
                  disabled={!selectedStudent || loading}
                >
                  {loading ? "Generating..." : "Generate Report"}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="report-generator">
              <div className="report-generator-heading">
                <div className="report-generator-icon subject-icon"><BarChart3 size={22} /></div>
                <div>
                  <h2>Subject-wise Report</h2>
                  <p>Compare attendance for every student in a selected subject.</p>
                </div>
              </div>

              <div className="report-form-row">
                <div className="control">
                  <label>Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      clearReports();
                    }}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="green-button report-generate-button"
                  onClick={generateSubjectReport}
                  disabled={!selectedSubject || loading}
                >
                  {loading ? "Generating..." : "Generate Report"}
                  {!loading && <ArrowRight size={16} />}
                </button>

                <button
                  type="button"
                  className="back-button report-download-button"
                  onClick={downloadSubjectCSV}
                  disabled={subjectReport.length === 0}
                >
                  Download CSV
                </button>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
        </section>

        {reportType === "individual" && individualReport && (
          <section className="generated-report-card">
            <div className="generated-report-header">
              <div>
                <span className="reports-eyebrow">STUDENT REPORT</span>
                <h2>{individualReport.student?.name}</h2>
                <p>
                  Roll No. {individualReport.student?.roll_no} • {individualReport.student?.email}
                </p>
              </div>
              <button className="back-button" onClick={downloadIndividualCSV}>
                Download CSV
              </button>
            </div>

            <div className="individual-report-grid">
              {(individualReport.subjects || []).map((subject) => (
                <div className="individual-subject-card" key={subject.subject_id}>
                  <div className="individual-subject-top">
                    <strong>{subject.subject_name}</strong>
                    <span className={Number(subject.percentage) < 75 ? "report-percent red" : "report-percent green"}>
                      {subject.percentage}%
                    </span>
                  </div>

                  <div className="individual-stats">
                    <span>Total <strong>{subject.total_classes}</strong></span>
                    <span>Present <strong>{subject.attended}</strong></span>
                    <span>Absent <strong>{subject.absent}</strong></span>
                  </div>

                  <div className="report-progress-track">
                    <div
                      className={Number(subject.percentage) < 75 ? "report-progress low" : "report-progress"}
                      style={{ width: `${Math.min(Number(subject.percentage) || 0, 100)}%` }}
                    />
                  </div>

                  <p className={Number(subject.percentage) < 75 ? "report-comment warning" : "report-comment good"}>
                    {getComment(Number(subject.percentage))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {reportType === "subject" && subjectReport.length > 0 && (
          <section className="generated-report-card">
            <div className="generated-report-header">
              <div>
                <span className="reports-eyebrow">SUBJECT REPORT</span>
                <h2>{subjects.find((item) => item.id === Number(selectedSubject))?.subject_name}</h2>
                <p>Attendance performance for the entire class.</p>
              </div>
            </div>

            <div className="reports-table-wrapper">
              <div className="reports-table reports-table-header">
                <div>Roll No.</div>
                <div>Student</div>
                <div>Total</div>
                <div>Present</div>
                <div>Absent</div>
                <div>Attendance</div>
                <div>Comment</div>
              </div>

              {subjectReport.map((student) => (
                <div className="reports-table" key={student.student_id}>
                  <div className="report-roll">{student.roll_no}</div>
                  <div className="report-student-name">{student.name}</div>
                  <div>{student.total_classes}</div>
                  <div>{student.attended}</div>
                  <div>{student.absent}</div>
                  <div className={student.percentage < 75 ? "red" : "green"}>
                    <strong>{student.percentage}%</strong>
                  </div>
                  <div className={student.percentage < 75 ? "report-comment warning" : "report-comment good"}>
                    {student.comment}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}


function TeacherPortal({ setPage, goBack }) {

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {

    const loadData = async () => {
      try {

        const [studentResponse, subjectResponse] =
          await Promise.all([
            axios.get(`${API}/students`),
            axios.get(`${API}/subjects`)
          ]);

        const sortedStudents = [...studentResponse.data].sort(
          (a, b) => Number(a.roll_no) - Number(b.roll_no)
        );

        setStudents(sortedStudents);
        setSubjects(subjectResponse.data);

      } catch (err) {
        console.error(err);
        setError(
          "Could not load students or subjects."
        );
      }
    };

    loadData();

  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status
    }));

    setMessage("");
    setError("");
  };

  const markAllPresent = () => {
    if (!selectedSubject) return;

    const updated = {};

    students.forEach((student) => {
      updated[student.id] = "PRESENT";
    });

    setAttendance(updated);
    setMessage("");
    setError("");
  };

  const markAllAbsent = () => {
    if (!selectedSubject) return;

    const updated = {};

    students.forEach((student) => {
      updated[student.id] = "ABSENT";
    });

    setAttendance(updated);
    setMessage("");
    setError("");
  };

  const saveAttendance = async () => {

    setMessage("");
    setError("");

    if (!selectedSubject) {
      setError("Please select a subject first.");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    const markedStudents = students.filter(
      (student) => attendance[student.id]
    );

    if (markedStudents.length === 0) {
      setError(
        "Please mark attendance for at least one student."
      );
      return;
    }

    try {

      const requests = markedStudents.map((student) =>
        axios.post(`${API}/attendance`, {
          student_id: student.id,
          subject_id: Number(selectedSubject),
          date: selectedDate,
          status: attendance[student.id]
        })
      );

      const results = await Promise.all(requests);

      const emailCount = results.filter(
        (result) =>
          result.data &&
          result.data.email_sent
      ).length;

      setMessage(
        `Attendance updated for ${markedStudents.length} student(s). ${emailCount} notification(s) sent.`
      );

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Could not save attendance."
      );
    }
  };

  return (
    <div className="portal-page">

      <header className="portal-header">

        <div>
          <span className="dashboard-eyebrow">
            ATTENDANCE MANAGEMENT
          </span>

          <h1>Mark Attendance</h1>

          <p>
            CSE • E1G2
          </p>
        </div>

        <button
          className="back-button"
          onClick={goBack}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

      </header>

      <main className="portal-content">

        <div className="teacher-controls">

          <div className="control">

            <label>
              Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(event) => {
                setSelectedSubject(
                  event.target.value
                );

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
              onChange={(event) => {
                setSelectedDate(
                  event.target.value
                );

                setAttendance({});
                setMessage("");
                setError("");
              }}
            />

          </div>

        </div>

        <div className="attendance-toolbar">

          <div>
            <span className="reports-eyebrow">
              DAILY ATTENDANCE
            </span>

            <h2>
              Mark Attendance
            </h2>
          </div>

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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <div className="teacher-table">

          <div className="table-header">
            <div>Roll No.</div>
            <div>Student Name</div>
            <div>Present</div>
            <div>Absent</div>
            <div>Status</div>
          </div>

          {students.map((student) => {

            const status =
              attendance[student.id];

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
                    Present
                  </button>
                </div>

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
                    Absent
                  </button>
                </div>

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

              </div>
            );
          })}

        </div>

        <div className="save-container">

          <button
            className="save-button"
            disabled={!selectedSubject}
            onClick={saveAttendance}
          >
            Save Attendance
          </button>

        </div>

      </main>
    </div>
  );
}


export default App;