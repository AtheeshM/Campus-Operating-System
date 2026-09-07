import { useState } from "react";
import "./AdminDashboard.css";

import AdminEnrollUser from "./AdminEnrollUser";
import AdminFaculty from "./AdminFaculty";
import AdminClasses from "./AdminClasses";
import AdminAcademicMapping from "./AdminAcademicMapping";
import AdminCourses from "./AdminCourses";

function AdminDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("campusos_token");
    localStorage.removeItem("campusos_role");

    window.location.reload();
  };

  return (
    <div className="admin-page">
      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-brand">
          <div className="admin-brand-logo">C</div>

          <div>
            <h1>CampusOS</h1>
            <span>Administration</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-navigation">
          {/* Dashboard */}
          <button
            className={
              activeModule === "dashboard"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveModule("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* Courses */}
          <button
            className={
              activeModule === "courses"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveModule("courses")}
          >
            <span>▣</span>
            Courses
          </button>

          {/* Faculty */}
          <button
            className={
              activeModule === "faculty"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveModule("faculty")}
          >
            <span>♙</span>
            Faculty
          </button>

          {/* Classes */}
          <button
            className={
              activeModule === "classes"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveModule("classes")}
          >
            <span>□</span>
            Classes
          </button>

          {/* Academic Mapping */}
          <button
            className={
              activeModule === "academic-mapping"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() => setActiveModule("academic-mapping")}
          >
            <span>↔</span>
            Academic Mapping
          </button>
        </nav>

        {/* =========================
            BOTTOM SIDEBAR ACTIONS
        ========================== */}
        <div className="admin-sidebar-bottom">
          {/* Settings */}
          <button className="admin-nav-item">
            <span>⚙</span>
            Settings
          </button>

          {/* Logout */}
          <button
            className="admin-nav-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <p className="admin-page-label">ADMINISTRATION</p>
            <h2>Dashboard</h2>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Administrator</strong>
              <span>CampusOS</span>
            </div>
          </div>
        </header>

        {/* =========================
            MODULE CONTENT
        ========================== */}

        {/* Faculty */}
        {activeModule === "faculty" ? (
          <AdminFaculty />

        /* Classes */
        ) : activeModule === "classes" ? (
          <AdminClasses />

        /* Academic Mapping */
        ) : activeModule === "academic-mapping" ? (
          <AdminAcademicMapping />

        /* Courses */
        ) : activeModule === "courses" ? (
          <AdminCourses />

        /* Enroll User */
        ) : activeModule === "enroll-user" ? (
          <AdminEnrollUser />

        /* Dashboard */
        ) : (
          <>
            {/* Welcome Section */}
            <section className="admin-welcome">
              <p className="admin-eyebrow">CAMPUS MANAGEMENT</p>

              <h3>Manage your campus, centrally.</h3>

              <p>
                Configure courses, faculty, classes and academic relationships
                from one place.
              </p>
            </section>

            {/* Stats */}
            <section className="admin-stats">
              <div className="admin-stat-card">
                <span>COURSES</span>
                <strong>—</strong>
                <p>Academic courses</p>
              </div>

              <div className="admin-stat-card">
                <span>FACULTY</span>
                <strong>—</strong>
                <p>Faculty members</p>
              </div>

              <div className="admin-stat-card">
                <span>CLASSES</span>
                <strong>—</strong>
                <p>Active classes</p>
              </div>

              <div className="admin-stat-card">
                <span>STUDENTS</span>
                <strong>—</strong>
                <p>Enrolled students</p>
              </div>
            </section>

            {/* Administration Modules */}
            {activeModule === "dashboard" && (
              <section className="admin-actions">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <p>ACADEMIC SETUP</p>
                      <h4>Administration Modules</h4>
                    </div>
                  </div>

                  <div className="admin-module-grid">
                    {/* Enroll Users */}
                    <button
                      className="admin-module-card"
                      onClick={() => setActiveModule("enroll-user")}
                    >
                      <span>♙</span>

                      <strong>Enroll Users</strong>

                      <p>
                        Enroll students and faculty members.
                      </p>
                    </button>

                    {/* Courses */}
                    <button
                      className="admin-module-card"
                      onClick={() => setActiveModule("courses")}
                    >
                      <span>▣</span>

                      <strong>Courses</strong>

                      <p>
                        Manage the academic course catalogue.
                      </p>
                    </button>

                    {/* Classes */}
                    <button
                      className="admin-module-card"
                      onClick={() => setActiveModule("classes")}
                    >
                      <span>□</span>

                      <strong>Classes</strong>

                      <p>
                        Manage classes and student groups.
                      </p>
                    </button>

                    {/* Academic Mapping */}
                    <button
                      className="admin-module-card"
                      onClick={() =>
                        setActiveModule("academic-mapping")
                      }
                    >
                      <span>↔</span>

                      <strong>Academic Mapping</strong>

                      <p>
                        Connect courses, faculty and classes.
                      </p>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;