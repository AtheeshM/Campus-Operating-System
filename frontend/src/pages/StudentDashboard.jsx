import { useEffect, useState } from "react";
import "./StudentDashboard.css";
import {
  getCourses,
  getStudentAssignments,
  getAssignmentSubmission,
} from "../services/api";
import Courses from "./Courses";
import LearningHub from "./LearningHub";

function StudentDashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [learningInsights, setLearningInsights] = useState([]);
const [insightsLoading, setInsightsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [assignmentError, setAssignmentError] =
    useState("");

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
        err.message
          .toLowerCase()
          .includes("authentication")
      ) {
        localStorage.removeItem("campusos_token");
        localStorage.removeItem("campusos_role");
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
  try {
    setAssignmentsLoading(true);
    setAssignmentError("");

    const data = await getStudentAssignments();

    const assignmentList =
      data.assignments || [];

    setAssignments(assignmentList);

    loadLearningInsights(assignmentList);
  } catch (err) {
    setAssignmentError(err.message);
  } finally {
    setAssignmentsLoading(false);
  }
};

 const loadLearningInsights = async (assignmentList) => {
  try {
    setInsightsLoading(true);

    // First create insights directly from existing assignments.
    // This guarantees that pending assignments are also shown.
    const baseInsights = assignmentList.map((assignment) => ({
      assignmentId: assignment._id,
      course:
        assignment.course?.code ||
        assignment.course?.name ||
        "Course",
      courseName:
        assignment.course?.name ||
        "Course",
      marks: null,
      feedback: "",
      submitted: false,
      title: assignment.title,
    }));

    setLearningInsights(baseInsights);

    // Then try to fetch each student's submission.
    const enrichedInsights = await Promise.all(
      baseInsights.map(async (item) => {
        try {
          const data = await getAssignmentSubmission(
            item.assignmentId
          );

          const submission =
            data.submission || null;

          if (!submission) {
            return item;
          }

          return {
            ...item,
            submitted: true,
            marks:
              submission.marks !== null &&
              submission.marks !== undefined
                ? Number(submission.marks)
                : null,
            feedback:
              submission.feedback || "",
          };
        } catch {
          // No submission yet.
          return item;
        }
      })
    );

    setLearningInsights(enrichedInsights);
  } finally {
    setInsightsLoading(false);
  }
};

  useEffect(() => {
    loadCourses();
    loadAssignments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campusos_token");
    localStorage.removeItem("campusos_role");

    window.location.reload();
  };

  const totalCredits = courses.reduce(
    (total, course) =>
      total + (course.credits || 0),
    0
  );

  /*
   * Learning Insights
   *
   * These insights are intentionally calculated
   * from existing assignment data.
   *
   * Later, Ollama can use the same data for
   * intelligent recommendations.
   */

  const totalAssignments = assignments.length;

  const submittedAssignments = assignments.filter(
    (assignment) =>
      assignment.submission ||
      assignment.submitted ||
      assignment.status === "SUBMITTED" ||
      assignment.submissionStatus === "SUBMITTED" ||
      assignment.submissionStatus === "REVIEWED"
  ).length;

  const evaluatedAssignments = assignments.filter(
    (assignment) =>
      assignment.marks !== null &&
      assignment.marks !== undefined
  );

  const averageMarks =
    evaluatedAssignments.length > 0
      ? Math.round(
          evaluatedAssignments.reduce(
            (total, assignment) =>
              total + Number(assignment.marks || 0),
            0
          ) / evaluatedAssignments.length
        )
      : null;

  const submissionProgress =
    totalAssignments > 0
      ? Math.round(
          (submittedAssignments /
            totalAssignments) *
            100
        )
      : 0;

  const evaluationProgress =
    totalAssignments > 0
      ? Math.round(
          (evaluatedAssignments.length /
            totalAssignments) *
            100
        )
      : 0;

  const learningProgress =
    totalAssignments > 0
      ? Math.round(
          (submissionProgress +
            evaluationProgress) /
            2
        )
      : 0;

  let learningStatus = "Getting Started";
  let learningStatusClass = "neutral";

  if (averageMarks !== null) {
    if (averageMarks >= 80) {
      learningStatus = "Strong";
      learningStatusClass = "strong";
    } else if (averageMarks >= 60) {
      learningStatus = "Needs Practice";
      learningStatusClass = "practice";
    } else {
      learningStatus = "Needs Attention";
      learningStatusClass = "weak";
    }
  } else if (submittedAssignments > 0) {
    learningStatus = "In Progress";
    learningStatusClass = "practice";
  }

  let recommendedAction =
    "Start completing your assignments to build your learning progress.";

  if (
    totalAssignments > 0 &&
    submittedAssignments < totalAssignments
  ) {
    recommendedAction =
      "Complete your pending assignments and keep your learning progress moving.";
  } else if (
    averageMarks !== null &&
    averageMarks < 60
  ) {
    recommendedAction =
      "Review your course materials and revisit topics where you scored lower.";
  } else if (
    averageMarks !== null &&
    averageMarks < 80
  ) {
    recommendedAction =
      "Review faculty feedback and practise the topics where you can improve.";
  } else if (
    averageMarks !== null &&
    averageMarks >= 80
  ) {
    recommendedAction =
      "Great progress. Continue practising and challenge yourself with deeper concepts.";
  }

  return (
    <div className="student-app">
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-logo">
            C
          </div>

          <div>
            <h1>CampusOS</h1>
            <span>Student Platform</span>
          </div>
        </div>

        <nav className="student-navigation">
          <button
            className={
              activePage === "dashboard"
                ? "student-nav-item active"
                : "student-nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "courses"
                ? "student-nav-item active"
                : "student-nav-item"
            }
            onClick={() =>
              setActivePage("courses")
            }
          >
            <span>▣</span>
            Courses
          </button>

          <button className="student-nav-item">
            <span>◷</span>
            Timetable
          </button>

          <button className="student-nav-item">
            <span>✓</span>
            Attendance
          </button>

          <button className="student-nav-item">
            <span>□</span>
            Exams
          </button>

          <button className="student-nav-item">
            <span>▤</span>
            Results
          </button>

          <button
            className={
              activePage === "learning"
                ? "student-nav-item active"
                : "student-nav-item"
            }
            onClick={() =>
              setActivePage("learning")
            }
          >
            <span>◉</span>
            Learning
          </button>

          <button
            className="student-nav-item"
            onClick={() =>
              window.dispatchEvent(
                new Event("campusos:open-panda")
              )
            }
          >
            <span>✦</span>
            panDA
          </button>
        </nav>

        <div className="student-sidebar-bottom">
          <button
            className="student-nav-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="student-main-content">
        <header className="student-topbar">
          <div>
            <p className="student-page-label">
              {activePage === "courses"
                ? "ACADEMICS"
                : activePage === "learning"
                ? "SMART EDUCATION"
                : "STUDENT"}
            </p>

            <h2>
              {activePage === "courses"
                ? "Courses"
                : activePage === "learning"
                ? "Learning Hub"
                : "Dashboard"}
            </h2>
          </div>

          <div className="student-profile">
            <div className="student-notification">
              ●
            </div>

            <div className="student-avatar">
              S
            </div>

            <div className="student-profile-info">
              <strong>Student</strong>
              <span>CampusOS</span>
            </div>
          </div>
        </header>

        {activePage === "dashboard" && (
          <>
            <section className="student-welcome-section">
              <div>
                <p className="student-eyebrow">
                  WELCOME BACK
                </p>

                <h3>
                  Your learning journey starts here.
                </h3>

                <p className="student-welcome-text">
                  Learn, track and manage your academic
                  progress from one place.
                </p>
              </div>
            </section>

            <section className="student-stats-grid">
              <div className="student-stat-card">
                <span className="student-stat-label">
                  Courses
                </span>

                <strong>
                  {loading
                    ? "..."
                    : courses.length}
                </strong>

                <p>Available courses</p>
              </div>

              <div className="student-stat-card">
                <span className="student-stat-label">
                  Attendance
                </span>

                <strong>--</strong>

                <p>Overall attendance</p>
              </div>

              <div className="student-stat-card">
                <span className="student-stat-label">
                  Credits
                </span>

                <strong>
                  {loading
                    ? "..."
                    : totalCredits}
                </strong>

                <p>Available credits</p>
              </div>

              <div className="student-stat-card">
                <span className="student-stat-label">
                  Learning
                </span>

                <strong>
                  {assignmentsLoading
                    ? "..."
                    : `${learningProgress}%`}
                </strong>

                <p>Learning progress</p>
              </div>
            </section>

            <section className="student-dashboard-grid">
              <div className="student-panel">
                <div className="student-panel-header">
                  <div>
                    <p className="student-panel-label">
                      ACADEMICS
                    </p>

                    <h4>My Courses</h4>
                  </div>

                  <button
                    className="student-text-button"
                    onClick={() =>
                      setActivePage("courses")
                    }
                  >
                    View all →
                  </button>
                </div>

                {loading && (
                  <div className="student-empty-state">
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
                  <div className="student-empty-state">
                    <h5>
                      Unable to load courses
                    </h5>

                    <p>{error}</p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  courses.length === 0 && (
                    <div className="student-empty-state">
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
                    <div className="student-course-list">
                      {courses
                        .slice(0, 6)
                        .map((course) => (
                          <div
                            className="student-course-row"
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

                            <div className="student-course-credit">
                              {course.credits} Cr
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
              </div>

              <div className="student-panel student-learning-panel">
                <div className="student-panel-header">
                  <div>
                    <p className="student-panel-label">
                      SMART LEARNING
                    </p>

                    <h4>
                      Continue Learning
                    </h4>
                  </div>
                </div>

                <div className="student-learning-content">
                  <div className="student-learning-icon">
                    ✦
                  </div>

                  <h5>
                    Your learning space is ready.
                  </h5>

                  <p>
                    Learning resources, progress
                    tracking and personalized
                    assistance are available here.
                  </p>

                  <button
                    className="student-learning-button"
                    onClick={() =>
                      setActivePage("learning")
                    }
                  >
                    Start Learning →
                  </button>
                </div>
              </div>
            </section>

            <section className="student-insights-panel">
  <div className="student-panel-header">
    <div>
      <p className="student-panel-label">
        SMART EDUCATION
      </p>

      <h4>Learning Insights</h4>
    </div>

    <span className="student-insight-status neutral">
      {insightsLoading
        ? "Analysing..."
        : "Personalized"}
    </span>
  </div>

  {insightsLoading ? (
    <div className="student-insights-loading">
      Analysing your learning activity...
    </div>
  ) : learningInsights.length === 0 ? (
    <div className="student-insights-loading">
      Complete assignments to generate personalized
      learning insights.
    </div>
  ) : (
    <>
      <div className="student-insight-metrics">
        <div className="student-insight-metric">
          <span>Assignments</span>
          <strong>
            {learningInsights.length}
          </strong>
        </div>

        <div className="student-insight-metric">
          <span>Submitted</span>
          <strong>
            {
              learningInsights.filter(
                (item) => item.submitted
              ).length
            }
          </strong>
        </div>

        <div className="student-insight-metric">
          <span>Evaluated</span>
          <strong>
            {
              learningInsights.filter(
                (item) => item.marks !== null
              ).length
            }
          </strong>
        </div>

        <div className="student-insight-metric">
          <span>Average Marks</span>
          <strong>
            {(() => {
              const evaluated =
                learningInsights.filter(
                  (item) => item.marks !== null
                );

              if (!evaluated.length) return "--";

              const average =
                evaluated.reduce(
                  (sum, item) =>
                    sum + item.marks,
                  0
                ) / evaluated.length;

              return `${Math.round(average)}%`;
            })()}
          </strong>
        </div>
      </div>

      <div className="student-course-insights">
        {learningInsights.map((item) => {
          let status = "Pending";
          let statusClass = "neutral";

          if (item.marks !== null) {
            if (item.marks >= 80) {
              status = "Strong";
              statusClass = "strong";
            } else if (item.marks >= 60) {
              status = "Needs Practice";
              statusClass = "practice";
            } else {
              status = "Needs Attention";
              statusClass = "weak";
            }
          } else if (item.submitted) {
            status = "Awaiting Evaluation";
            statusClass = "practice";
          }

          return (
            <div
              className="student-course-insight-row"
              key={item.assignmentId}
            >
              <div>
                <strong>{item.course}</strong>

                <span>{item.courseName}</span>

                <small>{item.title}</small>
              </div>

              <div className="student-course-insight-result">
                {item.marks !== null && (
                  <strong>
                    {item.marks}%
                  </strong>
                )}

                <span
                  className={`student-insight-status ${statusClass}`}
                >
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="student-insight-recommendation">
        <span>
          RECOMMENDED NEXT STEP
        </span>

        <h5>
          {learningInsights.some(
            (item) =>
              item.marks !== null &&
              item.marks < 60
          )
            ? "Focus on your weaker areas"
            : learningInsights.some(
                (item) => !item.submitted
              )
            ? "Complete your pending assignments"
            : learningInsights.some(
                (item) =>
                  item.marks !== null &&
                  item.marks < 80
              )
            ? "Practise and review faculty feedback"
            : "Great progress — keep learning"}
        </h5>

        <p>
          {learningInsights.some(
            (item) =>
              item.marks !== null &&
              item.marks < 60
          )
            ? "Review the related learning materials and practise those concepts again."
            : learningInsights.some(
                (item) => !item.submitted
              )
            ? "Completing pending work will improve your learning progress."
            : "Continue practising and use faculty feedback to strengthen your understanding."}
        </p>
      </div>
    </>
  )}
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

        {activePage === "learning" && (
          <LearningHub
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

export default StudentDashboard;