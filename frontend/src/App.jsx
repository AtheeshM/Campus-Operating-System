import { useEffect, useState } from "react";
import "./App.css";
import { getCourses, loginUser } from "./services/api";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import StudentDashboard from "./pages/StudentDashboard";
import PandaAI from "./components/PandaAI/PandaAI";
import FacultyDashboard from "./pages/FacultyDashboard";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("campusos_token")
  );
  const [userRole, setUserRole] = useState(
  localStorage.getItem("campusos_role")
);
  const [activePage, setActivePage] = useState("dashboard");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCourses();

      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);

      if (
        err.message.toLowerCase().includes("token") ||
        err.message.toLowerCase().includes("authentication")
      ) {
        localStorage.removeItem("campusos_token");
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadCourses();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setLoginError("");

      const data = await loginUser(email, password);

      const receivedToken = data.token;
      const receivedUser = data.user;

      if (!receivedToken) {
          throw new Error("Login succeeded but no token was returned");
      }

      if (!receivedUser || !receivedUser.role) {
        throw new Error("Login succeeded but user role was not returned");
      }

      localStorage.setItem("campusos_token", receivedToken);
      localStorage.setItem("campusos_role", receivedUser.role);

      setToken(receivedToken);
      setUserRole(receivedUser.role);
      } catch (err) {
          setLoginError(err.message);
      } finally {
          setLoginLoading(false);
     }
    };

  const handleLogout = () => {
    localStorage.removeItem("campusos_token");
     localStorage.removeItem("campusos_role");

    setToken(null);
    setCourses([]);
    setUserRole(null);
    setActivePage("dashboard");
  };

  const totalCredits = courses.reduce(
    (total, course) => total + (course.credits || 0),
    0
  );

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand">
            <div className="brand-logo">C</div>

            <div>
              <h1>CampusOS</h1>
              <span>Student Platform</span>
            </div>
          </div>

          <div className="login-heading">
            <p className="eyebrow">WELCOME BACK</p>

            <h2>Sign in to CampusOS</h2>

            <p>
              Manage your academic life from one place.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="login-form"
          >
            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="student@example.com"
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </label>

            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loginLoading}
            >
              {loginLoading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

 if (userRole === "ADMIN") {
  return (
    <>
      <AdminDashboard />
      <PandaAI />
    </>
  );
}

if (userRole === "STUDENT") {
  return (
    <>
      <StudentDashboard />
      <PandaAI />
    </>
  );
}

if (userRole === "FACULTY") {
  return (
    <>
      <FacultyDashboard />
      <PandaAI />
    </>
  );
}

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">C</div>

          <div>
            <h1>CampusOS</h1>
            <span>Student Platform</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "courses"
                ? "active"
                : ""
            }`}
            onClick={() => setActivePage("courses")}
          >
            <span>▣</span>
            Courses
          </button>

          <button className="nav-item">
            <span>◷</span>
            Timetable
          </button>

          <button className="nav-item">
            <span>✓</span>
            Attendance
          </button>

          <button className="nav-item">
            <span>□</span>
            Exams
          </button>

          <button className="nav-item">
            <span>▤</span>
            Results
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="page-label">
              {activePage === "courses"
                ? "ACADEMICS"
                : "OVERVIEW"}
            </p>

            <h2>
              {activePage === "courses"
                ? "Courses"
                : "Dashboard"}
            </h2>
          </div>

          <div className="profile">
            <div className="notification">
              ●
            </div>

            <div className="avatar">A</div>

            <div className="profile-info">
              <strong>Student</strong>
              <span>CampusOS</span>
            </div>
          </div>
        </header>

        {activePage === "dashboard" && (
          <>
            <section className="welcome-section">
              <div>
                <p className="eyebrow">
                  WELCOME BACK
                </p>

                <h3>
                  Your campus, organized.
                </h3>

                <p className="welcome-text">
                  Manage your academic life from one
                  place.
                </p>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">
                  Courses
                </span>

                <strong>
                  {loading ? "..." : courses.length}
                </strong>

                <p>Available courses</p>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Attendance
                </span>

                <strong>--</strong>

                <p>Overall attendance</p>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Credits
                </span>

                <strong>
                  {loading ? "..." : totalCredits}
                </strong>

                <p>Available credits</p>
              </div>

              <div className="stat-card">
                <span className="stat-label">
                  Upcoming
                </span>

                <strong>--</strong>

                <p>Academic events</p>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-label">
                      ACADEMICS
                    </p>

                    <h4>My Courses</h4>
                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage("courses")
                    }
                  >
                    View all →
                  </button>
                </div>

                {loading && (
                  <div className="empty-state">
                    <h5>
                      Loading courses...
                    </h5>

                    <p>
                      Fetching your courses from
                      CampusOS.
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="empty-state">
                    <h5>
                      Unable to load courses
                    </h5>

                    <p>{error}</p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  courses.length === 0 && (
                    <div className="empty-state">
                      <h5>
                        No courses found
                      </h5>

                      <p>
                        No courses are currently
                        available.
                      </p>
                    </div>
                  )}

                {!loading &&
                  !error &&
                  courses.length > 0 && (
                    <div className="course-list">
                      {courses
                        .slice(0, 6)
                        .map((course) => (
                          <div
                            className="course-row"
                            key={course._id}
                          >
                            <div>
                              <strong>
                                {course.code}
                              </strong>

                              <span>
                                {course.name}
                              </span>
                            </div>

                            <div className="course-credit">
                              {course.credits} Cr
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-label">
                      SCHEDULE
                    </p>

                    <h4>Upcoming</h4>
                  </div>

                  <button className="text-button">
                    Calendar →
                  </button>
                </div>

                <div className="empty-state">
                  <div className="empty-icon">
                    ◷
                  </div>

                  <h5>
                    Nothing scheduled
                  </h5>

                  <p>
                    Your upcoming classes, exams
                    and events will appear here.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {activePage === "courses" && (
          <Courses
            courses={courses}
            loading={loading}
            error={error}
            onRetry={loadCourses}
          />
        )}
      </main>
    </div>
  );
}

export default App;