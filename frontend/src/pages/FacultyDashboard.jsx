import { useEffect, useState } from "react";
import "./FacultyDashboard.css";

import {
  getTutorCourses,
  uploadLearningMaterial,
  createAssignment,
  getFacultyAssignments,
  getFacultyAssignmentSubmissions,
  downloadAssignmentSubmission,
  evaluateAssignmentSubmission,
} from "../services/api";

function FacultyDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // ASSIGNMENT REVIEW STATES
  // =====================================================

  const [facultyAssignments, setFacultyAssignments] =
    useState([]);

  const [selectedReviewAssignment, setSelectedReviewAssignment] =
    useState(null);

  const [assignmentSubmissions, setAssignmentSubmissions] =
    useState([]);

  const [submissionsLoading, setSubmissionsLoading] =
    useState(false);

  const [submissionsError, setSubmissionsError] =
    useState("");

  const [evaluationMarks, setEvaluationMarks] =
    useState({});

  const [evaluationFeedback, setEvaluationFeedback] =
    useState({});

  const [evaluatingSubmission, setEvaluatingSubmission] =
    useState(null);

  const [evaluationMessage, setEvaluationMessage] =
    useState("");

  // =====================================================
  // MATERIAL STATES
  // =====================================================

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [materialTitle, setMaterialTitle] =
    useState("");

  const [materialDescription, setMaterialDescription] =
    useState("");

  const [materialFile, setMaterialFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadMessage, setUploadMessage] =
    useState("");

  // =====================================================
  // ASSIGNMENT CREATION STATES
  // =====================================================

  const [assignmentCourse, setAssignmentCourse] =
    useState(null);

  const [assignmentTitle, setAssignmentTitle] =
    useState("");

  const [assignmentDescription, setAssignmentDescription] =
    useState("");

  const [assignmentDueDate, setAssignmentDueDate] =
    useState("");

  const [creatingAssignment, setCreatingAssignment] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState("");

  // =====================================================
  // LOAD ASSIGNED COURSES
  // =====================================================

  useEffect(() => {
    const loadAssignedCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTutorCourses();

        setCourses(data.courses || []);

        await loadFacultyAssignments();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedCourses();
  }, []);

  // =====================================================
  // LOAD FACULTY ASSIGNMENTS
  // =====================================================

  const loadFacultyAssignments = async () => {
    try {
      const data =
        await getFacultyAssignments();

      setFacultyAssignments(
        data.assignments || []
      );
    } catch (err) {
      console.error(
        "Failed to load faculty assignments:",
        err
      );
    }
  };

  // =====================================================
  // OPEN SUBMISSIONS
  // =====================================================

  const handleOpenSubmissions = async (
    assignment
  ) => {
    try {
      setSelectedReviewAssignment(
        assignment
      );

      setSubmissionsLoading(true);
      setSubmissionsError("");
      setEvaluationMessage("");

      const data =
        await getFacultyAssignmentSubmissions(
          assignment._id
        );

      setAssignmentSubmissions(
        data.submissions || []
      );
    } catch (err) {
      setSubmissionsError(
        err.message
      );
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // =====================================================
  // CLOSE SUBMISSIONS
  // =====================================================

  const handleCloseSubmissions = () => {
    setSelectedReviewAssignment(null);
    setAssignmentSubmissions([]);
    setSubmissionsError("");
    setEvaluationMessage("");
    setEvaluationMarks({});
    setEvaluationFeedback({});
    setEvaluatingSubmission(null);
  };


  // =====================================================
// VIEW STUDENT SUBMISSION
// =====================================================

const handleViewSubmission = async (
  submission
) => {
  try {
    const fileBlob =
      await downloadAssignmentSubmission(
        submission._id
      );

    const fileUrl =
      URL.createObjectURL(fileBlob);

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 60000);
  } catch (err) {
    setSubmissionsError(
      err.message
    );
  }
};


  // =====================================================
  // EVALUATE SUBMISSION
  // =====================================================

  const handleEvaluateSubmission = async (
    submission
  ) => {
    const marks =
      evaluationMarks[submission._id];

    const feedback =
      evaluationFeedback[submission._id] || "";

    if (
      marks === undefined ||
      marks === ""
    ) {
      setEvaluationMessage(
        "Please enter marks before submitting."
      );
      return;
    }

    const numericMarks = Number(marks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > 100
    ) {
      setEvaluationMessage(
        "Marks must be between 0 and 100."
      );
      return;
    }

    try {
      setEvaluatingSubmission(
        submission._id
      );

      setEvaluationMessage("");

      await evaluateAssignmentSubmission(
        submission._id,
        numericMarks,
        feedback
      );

      setEvaluationMessage(
        "Submission evaluated successfully."
      );

      const data =
        await getFacultyAssignmentSubmissions(
          selectedReviewAssignment._id
        );

      setAssignmentSubmissions(
        data.submissions || []
      );

      setEvaluationMarks((previous) => ({
        ...previous,
        [submission._id]: "",
      }));

      setEvaluationFeedback((previous) => ({
        ...previous,
        [submission._id]: "",
      }));
    } catch (err) {
      setEvaluationMessage(
        err.message
      );
    } finally {
      setEvaluatingSubmission(null);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "campusos_token"
    );

    localStorage.removeItem(
      "campusos_role"
    );

    window.location.reload();
  };

  // =====================================================
  // MATERIAL
  // =====================================================

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);

    setMaterialTitle("");
    setMaterialDescription("");
    setMaterialFile(null);
    setUploadMessage("");
  };

  const handleUploadMaterial = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedCourse) {
      setUploadMessage(
        "Please select a course first."
      );
      return;
    }

    if (!materialTitle.trim()) {
      setUploadMessage(
        "Please enter a material title."
      );
      return;
    }

    if (!materialFile) {
      setUploadMessage(
        "Please select a file."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadMessage("");

      await uploadLearningMaterial({
        courseId:
          selectedCourse.course?._id,

        classId:
          selectedCourse.class?._id,

        title:
          materialTitle.trim(),

        description:
          materialDescription.trim(),

        file: materialFile,
      });

      setMaterialTitle("");
      setMaterialDescription("");
      setMaterialFile(null);

      event.target.reset();

      setUploadMessage(
        "Material uploaded successfully."
      );
    } catch (err) {
      setUploadMessage(
        err.message
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // ASSIGNMENT CREATION
  // =====================================================

  const handleSelectAssignmentCourse = (
    course
  ) => {
    setAssignmentCourse(course);

    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    setAssignmentMessage("");
  };

  const handleCreateAssignment = async (
    event
  ) => {
    event.preventDefault();

    if (!assignmentCourse) {
      setAssignmentMessage(
        "Please select a course first."
      );
      return;
    }

    if (!assignmentTitle.trim()) {
      setAssignmentMessage(
        "Please enter an assignment title."
      );
      return;
    }

    if (!assignmentDueDate) {
      setAssignmentMessage(
        "Please select a due date."
      );
      return;
    }

    try {
      setCreatingAssignment(true);
      setAssignmentMessage("");

      await createAssignment({
        courseId:
          assignmentCourse.course?._id,

        classId:
          assignmentCourse.class?._id,

        title:
          assignmentTitle.trim(),

        description:
          assignmentDescription.trim(),

        dueDate:
          assignmentDueDate,
      });

      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueDate("");

      setAssignmentMessage(
        "Assignment created successfully."
      );
    } catch (err) {
      setAssignmentMessage(
        err.message
      );
    } finally {
      setCreatingAssignment(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="faculty-app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="faculty-sidebar">

        <div className="faculty-brand">

          <div className="faculty-brand-logo">
            C
          </div>

          <div>
            <h1>CampusOS</h1>
            <span>Faculty Platform</span>
          </div>

        </div>

        <nav className="faculty-navigation">

          <button
            className="faculty-nav-item active"
            type="button"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="faculty-nav-item"
            type="button"
          >
            <span>▣</span>
            My Courses
          </button>

          <button
            className="faculty-nav-item"
            type="button"
          >
            <span>◉</span>
            Students
          </button>

          <button
            className="faculty-nav-item"
            type="button"
          >
            <span>□</span>
            Study Materials
          </button>

        </nav>

        <div className="faculty-sidebar-bottom">

          <button
            className="faculty-nav-item"
            onClick={handleLogout}
            type="button"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="faculty-main">

        {/* TOPBAR */}

        <header className="faculty-topbar">

          <div>

            <p className="faculty-page-label">
              FACULTY
            </p>

            <h2>
              Faculty Dashboard
            </h2>

          </div>

          <div className="faculty-profile">

            <div className="faculty-avatar">
              F
            </div>

            <div>
              <strong>Faculty</strong>
              <span>CampusOS</span>
            </div>

          </div>

        </header>

        {/* WELCOME */}

        <section className="faculty-welcome">

          <p className="faculty-eyebrow">
            WELCOME BACK
          </p>

          <h3>
            Your academic workspace.
          </h3>

          <p>
            Manage your assigned courses and
            learning resources from one place.
          </p>

        </section>

        {/* STATS */}

        <section className="faculty-stats">

          <div className="faculty-stat-card">

            <span>
              Assigned Courses
            </span>

            <strong>
              {loading
                ? "..."
                : courses.length}
            </strong>

            <p>
              Courses assigned to you
            </p>

          </div>

          <div className="faculty-stat-card">

            <span>
              Role
            </span>

            <strong>
              Tutor
            </strong>

            <p>
              Faculty responsibility
            </p>

          </div>

        </section>

        {/* =====================================================
            ASSIGNED COURSES
        ===================================================== */}

        <section className="faculty-panel">

          <div className="faculty-panel-header">

            <div>

              <p>
                ACADEMICS
              </p>

              <h4>
                My Assigned Courses
              </h4>

            </div>

          </div>

          {loading && (
            <div className="faculty-empty-state">

              <h5>
                Loading courses...
              </h5>

              <p>
                Fetching your assigned
                courses from CampusOS.
              </p>

            </div>
          )}

          {!loading && error && (
            <div className="faculty-empty-state">

              <h5>
                Unable to load courses
              </h5>

              <p>
                {error}
              </p>

            </div>
          )}

          {!loading &&
            !error &&
            courses.length === 0 && (
              <div className="faculty-empty-state">

                <h5>
                  No assigned courses
                </h5>

                <p>
                  No active courses have been
                  assigned to you yet.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            courses.length > 0 && (
              <div className="faculty-course-list">

                {courses.map((item) => (
                  <div
                    className="faculty-course-card"
                    key={item.mappingId}
                  >

                    <div className="faculty-course-info">

                      <span className="faculty-course-code">
                        {item.course?.code}
                      </span>

                      <h5>
                        {item.course?.name}
                      </h5>

                      <p>
                        {item.course?.department ||
                          "Department"}{" "}
                        • Semester{" "}
                        {item.course?.semester ||
                          "--"}
                      </p>

                      <div className="faculty-course-actions">

                        <button
                          type="button"
                          className="faculty-upload-button"
                          onClick={() =>
                            handleSelectCourse(
                              item
                            )
                          }
                        >
                          Upload Material
                        </button>

                        <button
                          type="button"
                          className="faculty-assignment-button"
                          onClick={() =>
                            handleSelectAssignmentCourse(
                              item
                            )
                          }
                        >
                          Create Assignment
                        </button>

                      </div>

                    </div>

                    <div className="faculty-class-info">

                      <span>
                        CLASS
                      </span>

                      <strong>
                        {item.class?.name}
                      </strong>

                      <small>
                        Year{" "}
                        {item.class?.year}{" "}
                        • Section{" "}
                        {item.class?.section}
                      </small>

                    </div>

                  </div>
                ))}

              </div>
            )}

        </section>

        {/* =====================================================
            MATERIAL UPLOAD
        ===================================================== */}

        {selectedCourse && (
          <section className="faculty-upload-panel">

            <div className="faculty-upload-header">

              <div>

                <p>
                  LEARNING MATERIAL
                </p>

                <h4>
                  Upload to{" "}
                  {selectedCourse.course?.name}
                </h4>

                <small>
                  {selectedCourse.class?.name}
                </small>

              </div>

              <button
                type="button"
                className="faculty-close-button"
                onClick={() => {
                  setSelectedCourse(null);
                  setUploadMessage("");
                }}
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={
                handleUploadMaterial
              }
              className="faculty-upload-form"
            >

              <label>

                Material Title

                <input
                  type="text"
                  placeholder="Example: Unit 1 Notes"
                  value={materialTitle}
                  onChange={(event) =>
                    setMaterialTitle(
                      event.target.value
                    )
                  }
                  required
                />

              </label>

              <label>

                Description

                <textarea
                  placeholder="Add a short description..."
                  value={
                    materialDescription
                  }
                  onChange={(event) =>
                    setMaterialDescription(
                      event.target.value
                    )
                  }
                />

              </label>

              <label>

                Select File

                <input
                  type="file"
                  onChange={(event) =>
                    setMaterialFile(
                      event.target.files[0] ||
                        null
                    )
                  }
                  required
                />

              </label>

              {materialFile && (
                <div className="selected-file">

                  <span>
                    📎
                  </span>

                  <div>

                    <strong>
                      {materialFile.name}
                    </strong>

                    <small>
                      {(
                        materialFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </small>

                  </div>

                </div>
              )}

              <button
                type="submit"
                className="faculty-submit-button"
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Upload Material"}
              </button>

              {uploadMessage && (
                <div
                  className={
                    uploadMessage
                      .toLowerCase()
                      .includes("success")
                      ? "faculty-upload-success"
                      : "faculty-upload-error"
                  }
                >
                  {uploadMessage}
                </div>
              )}

            </form>

          </section>
        )}

        {/* =====================================================
            ASSIGNMENT CREATION
        ===================================================== */}

        {assignmentCourse && (
          <section className="faculty-assignment-panel">

            <div className="faculty-assignment-header">

              <div>

                <p>
                  ASSIGNMENT
                </p>

                <h4>
                  Create Assignment
                </h4>

                <small>
                  {assignmentCourse.course?.name}
                  {" • "}
                  {assignmentCourse.class?.name}
                </small>

              </div>

              <button
                type="button"
                className="faculty-close-button"
                onClick={() => {
                  setAssignmentCourse(null);
                  setAssignmentMessage("");
                }}
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={
                handleCreateAssignment
              }
              className="faculty-assignment-form"
            >

              <label>

                Assignment Title

                <input
                  type="text"
                  placeholder="Example: Unit 1 Assignment"
                  value={assignmentTitle}
                  onChange={(event) =>
                    setAssignmentTitle(
                      event.target.value
                    )
                  }
                  required
                />

              </label>

              <label>

                Description

                <textarea
                  placeholder="Describe the assignment..."
                  value={
                    assignmentDescription
                  }
                  onChange={(event) =>
                    setAssignmentDescription(
                      event.target.value
                    )
                  }
                />

              </label>

              <label>

                Due Date

                <input
                  type="datetime-local"
                  value={assignmentDueDate}
                  onChange={(event) =>
                    setAssignmentDueDate(
                      event.target.value
                    )
                  }
                  required
                />

              </label>

              <button
                type="submit"
                className="faculty-assignment-submit"
                disabled={
                  creatingAssignment
                }
              >
                {creatingAssignment
                  ? "Creating..."
                  : "Create Assignment"}
              </button>

              {assignmentMessage && (
                <div
                  className={
                    assignmentMessage
                      .toLowerCase()
                      .includes("success")
                      ? "faculty-upload-success"
                      : "faculty-upload-error"
                  }
                >
                  {assignmentMessage}
                </div>
              )}

            </form>

          </section>
        )}

        {/* =====================================================
            ASSIGNMENT REVIEW
        ===================================================== */}

        <section className="faculty-panel faculty-review-panel">

          <div className="faculty-panel-header">

            <div>

              <p>
                ASSESSMENT
              </p>

              <h4>
                Assignment Review
              </h4>

            </div>

          </div>

          {facultyAssignments.length === 0 ? (
            <div className="faculty-empty-state">

              <h5>
                No assignments created
              </h5>

              <p>
                Create an assignment to start
                receiving student submissions.
              </p>

            </div>
          ) : (
            <div className="faculty-review-assignment-list">

              {facultyAssignments.map(
                (assignment) => (
                  <div
                    className="faculty-review-assignment-card"
                    key={assignment._id}
                  >

                    <div>

                      <span className="faculty-course-code">
                        {assignment.course?.code}
                      </span>

                      <h5>
                        {assignment.title}
                      </h5>

                      <p>
                        {assignment.course?.name}
                        {" • "}
                        {assignment.class?.name}
                      </p>

                      <small>
                        Due{" "}
                        {new Date(
                          assignment.dueDate
                        ).toLocaleString()}
                      </small>

                    </div>

                    <button
                      type="button"
                      className="faculty-review-button"
                      onClick={() =>
                        handleOpenSubmissions(
                          assignment
                        )
                      }
                    >
                      View Submissions →
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          SUBMISSION REVIEW MODAL
      ===================================================== */}

      {selectedReviewAssignment && (
        <div
          className="faculty-review-modal-overlay"
          onClick={handleCloseSubmissions}
        >

          <div
            className="faculty-review-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="faculty-review-modal-header">

              <div>

                <p>
                  SUBMISSION REVIEW
                </p>

                <h3>
                  {selectedReviewAssignment.title}
                </h3>

                <span>
                  {selectedReviewAssignment.course?.name}
                  {" • "}
                  {selectedReviewAssignment.class?.name}
                </span>

              </div>

              <button
                type="button"
                className="faculty-review-modal-close"
                onClick={
                  handleCloseSubmissions
                }
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="faculty-review-modal-body">

              {submissionsLoading && (
                <div className="faculty-review-loading">

                  <strong>
                    Loading submissions...
                  </strong>

                  <p>
                    Fetching student submissions.
                  </p>

                </div>
              )}

              {!submissionsLoading &&
                submissionsError && (
                  <div className="faculty-review-error">

                    {submissionsError}

                  </div>
                )}

              {!submissionsLoading &&
                !submissionsError &&
                assignmentSubmissions.length === 0 && (
                  <div className="faculty-review-empty">

                    <div className="faculty-review-empty-icon">
                      📭
                    </div>

                    <h4>
                      No submissions yet
                    </h4>

                    <p>
                      Students have not submitted
                      this assignment yet.
                    </p>

                  </div>
                )}

              {!submissionsLoading &&
                !submissionsError &&
                assignmentSubmissions.length >
                  0 && (
                  <div className="faculty-submission-list">

                    {assignmentSubmissions.map(
                      (submission) => (
                        <div
                          className="faculty-submission-card"
                          key={submission._id}
                        >

                          {/* STUDENT INFO */}

                          <div className="faculty-submission-student">

                            <div className="faculty-submission-avatar">
                              {submission.student?.email
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                            </div>

                            <div>

                              <strong>
                                {submission.student?.email ||
                                  "Student"}
                              </strong>

                              <span>
                                Submitted{" "}
                                {submission.submittedAt
                                  ? new Date(
                                      submission.submittedAt
                                    ).toLocaleString()
                                  : "--"}
                              </span>

                            </div>

                          </div>

                          {/* FILE */}

                          <div className="faculty-submission-file">

  <span>
    📎
  </span>

  <div className="faculty-submission-file-info">

    <strong>
      {submission.originalFileName}
    </strong>

    <small>
      Student submission
    </small>

  </div>

  <button
    type="button"
    className="faculty-view-submission-button"
    onClick={() =>
      handleViewSubmission(
        submission
      )
    }
  >
    View File ↗
  </button>

</div>
                          {/* EXISTING RESULT */}

                          {submission.marks !==
                            null &&
                            submission.marks !==
                              undefined && (
                              <div className="faculty-existing-evaluation">

                                <strong>
                                  Current Marks:{" "}
                                  {submission.marks}
                                  / 100
                                </strong>

                                {submission.feedback && (
                                  <p>
                                    {submission.feedback}
                                  </p>
                                )}

                              </div>
                            )}

                          {/* EVALUATION */}

                          <div className="faculty-evaluation-section">

                            <div className="faculty-evaluation-field">

                              <label>
                                Marks
                              </label>

                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Enter marks (0-100)"
                                value={
                                  evaluationMarks[
                                    submission._id
                                  ] ??
                                  (submission.marks ??
                                    "")
                                }
                                onChange={(event) =>
                                  setEvaluationMarks(
                                    (previous) => ({
                                      ...previous,
                                      [submission._id]:
                                        event.target.value,
                                    })
                                  )
                                }
                              />

                            </div>

                            <div className="faculty-evaluation-field">

                              <label>
                                Feedback
                              </label>

                              <textarea
                                placeholder="Write feedback for the student..."
                                value={
                                  evaluationFeedback[
                                    submission._id
                                  ] ??
                                  submission.feedback ??
                                  ""
                                }
                                onChange={(event) =>
                                  setEvaluationFeedback(
                                    (previous) => ({
                                      ...previous,
                                      [submission._id]:
                                        event.target.value,
                                    })
                                  )
                                }
                              />

                            </div>

                            <button
                              type="button"
                              className="faculty-evaluate-button"
                              onClick={() =>
                                handleEvaluateSubmission(
                                  submission
                                )
                              }
                              disabled={
                                evaluatingSubmission ===
                                submission._id
                              }
                            >
                              {evaluatingSubmission ===
                              submission._id
                                ? "Evaluating..."
                                : submission.marks !==
                                    null &&
                                  submission.marks !==
                                    undefined
                                ? "Update Evaluation"
                                : "Evaluate Submission"}
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              {evaluationMessage && (
                <div
                  className={
                    evaluationMessage
                      .toLowerCase()
                      .includes("success")
                      ? "faculty-evaluation-success"
                      : "faculty-evaluation-error"
                  }
                >
                  {evaluationMessage}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default FacultyDashboard;