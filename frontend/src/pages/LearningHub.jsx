import { useEffect, useState } from "react";

import "./LearningHub.css";

import {
  getStudentMaterials,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  getAssignmentSubmission,
  chatWithAI,
} from "../services/api";

function LearningHub({
  courses = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [startedCourses, setStartedCourses] =
    useState({});

  // =====================================================
  // PANDA AI STATE
  // =====================================================

  const [pandaMessage, setPandaMessage] =
    useState("");

  const [pandaResponse, setPandaResponse] =
    useState("");

  const [pandaLoading, setPandaLoading] =
    useState(false);

  const [pandaError, setPandaError] =
    useState("");

  const [assignments, setAssignments] =
    useState([]);

  const [assignmentsLoading, setAssignmentsLoading] =
    useState(true);

  const [assignmentsError, setAssignmentsError] =
    useState("");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [
    assignmentDetailsLoading,
    setAssignmentDetailsLoading,
  ] = useState(false);

  const [
    assignmentDetailsError,
    setAssignmentDetailsError,
  ] = useState("");

  const [materials, setMaterials] =
    useState([]);

  const [materialsLoading, setMaterialsLoading] =
    useState(false);

  const [materialsError, setMaterialsError] =
    useState("");

  // =====================================================
  // ASSIGNMENT SUBMISSION STATE
  // =====================================================

  const [submissionFile, setSubmissionFile] =
    useState(null);

  const [submission, setSubmission] =
    useState(null);

  const [submissionLoading, setSubmissionLoading] =
    useState(false);

  const [submissionMessage, setSubmissionMessage] =
    useState("");

  const [submissionError, setSubmissionError] =
    useState("");

  // =====================================================
  // LOAD ASSIGNMENT SUBMISSION
  // =====================================================

  const loadAssignmentSubmission = async (
    assignmentId
  ) => {
    try {
      setSubmissionLoading(true);
      setSubmissionError("");

      const data =
        await getAssignmentSubmission(
          assignmentId
        );

      setSubmission(
        data.submission || null
      );
    } catch (err) {
      setSubmissionError(
        err.message ||
          "Failed to load submission"
      );
    } finally {
      setSubmissionLoading(false);
    }
  };

  const availableCourses = courses.length;

  // =====================================================
  // LOAD STUDENT ASSIGNMENTS
  // =====================================================

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        setAssignmentsError("");

        const data =
          await getStudentAssignments();

        setAssignments(
          data.assignments || []
        );
      } catch (err) {
        setAssignmentsError(
          err.message ||
            "Failed to load assignments"
        );
      } finally {
        setAssignmentsLoading(false);
      }
    };

    loadAssignments();
  }, []);

  // =====================================================
  // LOAD LEARNING MATERIALS
  // =====================================================

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setMaterialsLoading(true);
        setMaterialsError("");

        const data =
          await getStudentMaterials();

        setMaterials(
          data.materials || []
        );
      } catch (err) {
        setMaterialsError(
          err.message ||
            "Failed to load materials"
        );
      } finally {
        setMaterialsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // =====================================================
  // OPEN COURSE
  // =====================================================

  const openCourse = (course) => {
    setSelectedCourse(course);

    setSelectedAssignment(null);
    setAssignmentDetailsError("");

    setPandaMessage("");
    setPandaResponse("");
    setPandaError("");
    setPandaLoading(false);

    setStartedCourses((current) => ({
      ...current,
      [course._id]: true,
    }));
  };

  // =====================================================
  // CLOSE COURSE
  // =====================================================

  const closeCourse = () => {
    setSelectedCourse(null);
    setSelectedAssignment(null);
    setAssignmentDetailsError("");

    setSubmission(null);
    setSubmissionFile(null);
    setSubmissionError("");
    setSubmissionMessage("");

    setPandaMessage("");
    setPandaResponse("");
    setPandaError("");
    setPandaLoading(false);
  };

  // =====================================================
  // MATERIAL ICON
  // =====================================================

  const getMaterialIcon = (fileType) => {
    switch (fileType) {
      case "PDF":
        return "📄";

      case "PRESENTATION":
        return "📊";

      case "DOCUMENT":
        return "📝";

      case "IMAGE":
        return "🖼️";

      case "VIDEO":
        return "🎬";

      case "AUDIO":
        return "🎧";

      default:
        return "📎";
    }
  };

  // =====================================================
  // FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  // =====================================================
  // OPEN MATERIAL
  // =====================================================

  const openMaterial = (material) => {
    const fileUrl =
      `http://localhost:5000/${material.filePath}`;

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // OPEN ASSIGNMENT
  // =====================================================

  const openAssignment = async (
    assignment
  ) => {
    try {
      setSelectedAssignment(assignment);

      setAssignmentDetailsLoading(true);
      setAssignmentDetailsError("");

      setSubmissionLoading(true);
      setSubmissionError("");
      setSubmissionMessage("");
      setSubmissionFile(null);
      setSubmission(null);

      const detailsData =
        await getAssignmentDetails(
          assignment._id
        );

      setSelectedAssignment(
        detailsData.assignment || assignment
      );

      await loadAssignmentSubmission(
        assignment._id
      );
    } catch (err) {
      setAssignmentDetailsError(
        err.message ||
          "Failed to load assignment details"
      );

      setSubmissionLoading(false);
    } finally {
      setAssignmentDetailsLoading(false);
    }
  };

  // =====================================================
  // CLOSE ASSIGNMENT
  // =====================================================

  const closeAssignment = () => {
    setSelectedAssignment(null);

    setAssignmentDetailsError("");

    setSubmissionFile(null);
    setSubmission(null);
    setSubmissionError("");
    setSubmissionMessage("");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDueDate = (date) => {
    if (!date) {
      return "--";
    }

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // SUBMIT ASSIGNMENT
  // =====================================================

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) {
      return;
    }

    if (!submissionFile) {
      setSubmissionError(
        "Please choose a file first."
      );
      return;
    }

    try {
      setSubmissionLoading(true);
      setSubmissionError("");
      setSubmissionMessage("");

      const data =
        await submitAssignment(
          selectedAssignment._id,
          submissionFile
        );

      setSubmission(
        data.submission || null
      );

      setSubmissionFile(null);

      setSubmissionMessage(
        "Assignment submitted successfully."
      );
    } catch (err) {
      setSubmissionError(
        err.message ||
          "Failed to submit assignment"
      );
    } finally {
      setSubmissionLoading(false);
    }
  };

  // =====================================================
  // COURSE LEARNING WORKSPACE
  // =====================================================

  if (selectedCourse) {
    const isStarted =
      startedCourses[selectedCourse._id];

    const courseMaterials =
      materials.filter((material) => {
        const materialCourseId =
          material.course?._id ||
          material.course;

        return (
          materialCourseId?.toString() ===
          selectedCourse._id?.toString()
        );
      });

    const courseAssignments =
      assignments.filter((assignment) => {
        const assignmentCourseId =
          assignment.course?._id ||
          assignment.course;

        return (
          assignmentCourseId?.toString() ===
          selectedCourse._id?.toString()
        );
      });

    // ===================================================
    // ASK PANDA
    // ===================================================

    const handleAskPanda = async () => {
      if (!pandaMessage.trim()) {
        setPandaError(
          "Ask panDA something about this course."
        );
        return;
      }

      try {
        setPandaLoading(true);
        setPandaError("");
        setPandaResponse("");

        const context = {
          course: {
            code:
              selectedCourse.code || "",
            name:
              selectedCourse.name || "",
            description:
              selectedCourse.description ||
              "",
            credits:
              selectedCourse.credits || 0,
            semester:
              selectedCourse.semester || "",
            courseType:
              selectedCourse.courseType || "",
          },

          materials:
            courseMaterials.map(
              (material) => ({
                title:
                  material.title,
                description:
                  material.description ||
                  "",
                fileType:
                  material.fileType ||
                  "OTHER",
              })
            ),

          assignments:
            courseAssignments.map(
              (assignment) => ({
                title:
                  assignment.title,
                description:
                  assignment.description ||
                  "",
                dueDate:
                  assignment.dueDate ||
                  null,
              })
            ),
        };

        const data =
          await chatWithAI(
            pandaMessage,
            context
          );

        setPandaResponse(
          data.message ||
            "panDA could not generate a response."
        );
      } catch (err) {
        setPandaError(
          err.message ||
            "Unable to connect to panDA."
        );
      } finally {
        setPandaLoading(false);
      }
    };

    return (
      <section className="learning-hub">
        <div className="learning-workspace">

          {/* BACK BUTTON */}

          <button
            type="button"
            className="learning-back-button"
            onClick={closeCourse}
          >
            ← Back to Learning Hub
          </button>

          {/* WORKSPACE HEADER */}

          <div className="learning-workspace-header">

            <div>
              <p className="learning-hub-eyebrow">
                LEARNING WORKSPACE
              </p>

              <div className="learning-workspace-code">
                {selectedCourse.code ||
                  "COURSE"}
              </div>

              <h3>
                {selectedCourse.name ||
                  "Untitled Course"}
              </h3>

              <p>
                Your dedicated learning space
                for this course.
              </p>
            </div>

            <div className="learning-workspace-icon">
              📚
            </div>

          </div>

          {/* WORKSPACE GRID */}

          <div className="learning-workspace-grid">

            {/* MAIN */}

            <div className="learning-workspace-main">

              {/* COURSE OVERVIEW */}

              <section className="learning-workspace-card">

                <div className="learning-workspace-card-heading">

                  <div>
                    <p>
                      COURSE OVERVIEW
                    </p>

                    <h4>
                      About this course
                    </h4>
                  </div>

                </div>

                <p className="learning-workspace-description">
                  {selectedCourse.description ||
                    "Course learning content will be organized here. Resources, topics and assessments will connect to this workspace."}
                </p>

                <div className="learning-course-details">

                  <div>
                    <span>
                      Course Code
                    </span>

                    <strong>
                      {selectedCourse.code ||
                        "--"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Credits
                    </span>

                    <strong>
                      {selectedCourse.credits ||
                        0}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Semester
                    </span>

                    <strong>
                      {selectedCourse.semester ||
                        "--"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Course Type
                    </span>

                    <strong>
                      {selectedCourse.courseType ||
                        "--"}
                    </strong>
                  </div>

                </div>

              </section>

              {/* LEARNING MATERIALS */}

              <section className="learning-workspace-card">

                <div className="learning-workspace-card-heading">

                  <div>
                    <p>
                      LEARNING CONTENT
                    </p>

                    <h4>
                      Your learning materials
                    </h4>
                  </div>

                  {!materialsLoading &&
                    courseMaterials.length >
                      0 && (
                      <span>
                        {courseMaterials.length}{" "}
                        resource
                        {courseMaterials.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    )}

                </div>

                {materialsLoading && (
                  <div className="learning-content-placeholder">

                    <div className="learning-content-icon">
                      ⏳
                    </div>

                    <h5>
                      Loading learning
                      materials...
                    </h5>

                    <p>
                      Fetching resources for
                      this course.
                    </p>

                  </div>
                )}

                {!materialsLoading &&
                  materialsError && (
                    <div className="learning-content-placeholder">

                      <div className="learning-content-icon">
                        !
                      </div>

                      <h5>
                        Unable to load
                        materials
                      </h5>

                      <p>
                        {materialsError}
                      </p>

                    </div>
                  )}

                {!materialsLoading &&
                  !materialsError &&
                  courseMaterials.length ===
                    0 && (
                    <div className="learning-content-placeholder">

                      <div className="learning-content-icon">
                        📖
                      </div>

                      <h5>
                        No learning materials
                        yet
                      </h5>

                      <p>
                        Your faculty has not
                        uploaded any study
                        materials for this
                        course yet.
                      </p>

                    </div>
                  )}

                {!materialsLoading &&
                  !materialsError &&
                  courseMaterials.length >
                    0 && (
                    <div className="learning-material-list">

                      {courseMaterials.map(
                        (material) => (
                          <article
                            className="learning-material-item"
                            key={
                              material._id
                            }
                          >

                            <div className="learning-material-icon">
                              {getMaterialIcon(
                                material.fileType
                              )}
                            </div>

                            <div className="learning-material-content">

                              <div className="learning-material-title-row">

                                <h5>
                                  {
                                    material.title
                                  }
                                </h5>

                                <span>
                                  {
                                    material.fileType
                                  }
                                </span>

                              </div>

                              {material.description && (
                                <p>
                                  {
                                    material.description
                                  }
                                </p>
                              )}

                              <div className="learning-material-meta">

                                <span>
                                  {
                                    material.originalFileName
                                  }
                                </span>

                                {material.fileSize >
                                  0 && (
                                  <span>
                                    •{" "}
                                    {formatFileSize(
                                      material.fileSize
                                    )}
                                  </span>
                                )}

                              </div>

                            </div>

                            <button
                              type="button"
                              className="learning-material-open-button"
                              onClick={() =>
                                openMaterial(
                                  material
                                )
                              }
                            >
                              Open →
                            </button>

                          </article>
                        )
                      )}

                    </div>
                  )}

              </section>

              {/* ASSIGNMENTS */}

              <section className="learning-workspace-card">

                <div className="learning-workspace-card-heading">

                  <div>
                    <p>
                      ACADEMIC WORK
                    </p>

                    <h4>
                      Assignments
                    </h4>
                  </div>

                  {!assignmentsLoading &&
                    courseAssignments.length >
                      0 && (
                      <span>
                        {courseAssignments.length}{" "}
                        assignment
                        {courseAssignments.length !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    )}

                </div>

                {assignmentsLoading && (
                  <div className="learning-content-placeholder">

                    <div className="learning-content-icon">
                      ⏳
                    </div>

                    <h5>
                      Loading assignments...
                    </h5>

                    <p>
                      Fetching assignments
                      for this course.
                    </p>

                  </div>
                )}

                {!assignmentsLoading &&
                  assignmentsError && (
                    <div className="learning-content-placeholder">

                      <div className="learning-content-icon">
                        !
                      </div>

                      <h5>
                        Unable to load
                        assignments
                      </h5>

                      <p>
                        {assignmentsError}
                      </p>

                    </div>
                  )}

                {!assignmentsLoading &&
                  !assignmentsError &&
                  courseAssignments.length ===
                    0 && (
                    <div className="learning-content-placeholder">

                      <div className="learning-content-icon">
                        📝
                      </div>

                      <h5>
                        No assignments yet
                      </h5>

                      <p>
                        Your faculty has not
                        created any assignments
                        for this course yet.
                      </p>

                    </div>
                  )}

                {!assignmentsLoading &&
                  !assignmentsError &&
                  courseAssignments.length >
                    0 && (
                    <div className="learning-assignment-list">

                      {courseAssignments.map(
                        (assignment) => {
                          const dueDate =
                            new Date(
                              assignment.dueDate
                            );

                          const isOverdue =
                            dueDate < new Date();

                          return (
                            <article
                              className="learning-assignment-card"
                              key={
                                assignment._id
                              }
                            >

                              <div className="learning-assignment-icon">
                                📝
                              </div>

                              <div className="learning-assignment-content">

                                <div className="learning-assignment-title-row">

                                  <h5>
                                    {
                                      assignment.title
                                    }
                                  </h5>

                                  <span
                                    className={
                                      isOverdue
                                        ? "assignment-overdue"
                                        : "assignment-active"
                                    }
                                  >
                                    {isOverdue
                                      ? "OVERDUE"
                                      : "ACTIVE"}
                                  </span>

                                </div>

                                <p>
                                  {assignment.description ||
                                    "No description provided."}
                                </p>

                                <div className="learning-assignment-meta">

                                  <span>
                                    📚{" "}
                                    {assignment
                                      .course
                                      ?.code ||
                                      selectedCourse.code ||
                                      "Course"}
                                  </span>

                                  <span>
                                    📅 Due{" "}
                                    {formatDueDate(
                                      assignment.dueDate
                                    )}
                                  </span>

                                </div>

                              </div>

                              <button
                                type="button"
                                className="learning-assignment-open"
                                onClick={() =>
                                  openAssignment(
                                    assignment
                                  )
                                }
                              >
                                Open →
                              </button>

                            </article>
                          );
                        }
                      )}

                    </div>
                  )}

              </section>

            </div>

            {/* RIGHT SIDE */}

            <aside className="learning-workspace-side">

              {/* PROGRESS */}

              <section className="learning-workspace-card">

                <p className="learning-workspace-small-label">
                  YOUR PROGRESS
                </p>

                <div className="learning-workspace-progress-number">
                  {isStarted
                    ? "1%"
                    : "0%"}
                </div>

                <div className="learning-workspace-progress-track">

                  <div
                    className="learning-workspace-progress-fill"
                    style={{
                      width: isStarted
                        ? "1%"
                        : "0%",
                    }}
                  />

                </div>

                <p className="learning-workspace-progress-text">
                  {isStarted
                    ? "Learning started"
                    : "Not started yet"}
                </p>

                <button
                  type="button"
                  className="learning-workspace-start-button"
                  onClick={() =>
                    setStartedCourses(
                      (current) => ({
                        ...current,
                        [selectedCourse._id]:
                          true,
                      })
                    )
                  }
                >
                  {isStarted
                    ? "Continue Learning"
                    : "Start Learning"}
                </button>

              </section>

              {/* PANDA AI */}

              <section className="learning-workspace-card learning-panda-card">

                <div className="learning-panda-icon">
                  🐼
                </div>

                <p className="learning-workspace-small-label">
                  panDA AI
                </p>

                <h4>
                  Your learning companion
                </h4>

                <p>
                  Ask anything about this
                  course or get help with
                  your studies.
                </p>

                <textarea
                  className="learning-panda-input"
                  placeholder="Ask panDA..."
                  value={pandaMessage}
                  onChange={(event) => {
                    setPandaMessage(
                      event.target.value
                    );
                    setPandaError("");
                  }}
                  rows={3}
                />

                {pandaError && (
                  <div className="learning-panda-error">
                    {pandaError}
                  </div>
                )}

                {pandaResponse && (
                  <div className="learning-panda-response">

                    <strong>
                      🐼 panDA
                    </strong>

                    <p>
                      {pandaResponse}
                    </p>

                  </div>
                )}

                <button
                  type="button"
                  className="learning-panda-button"
                  onClick={
                    handleAskPanda
                  }
                  disabled={pandaLoading}
                >
                  {pandaLoading
                    ? "panDA is thinking..."
                    : "Ask panDA →"}
                </button>

              </section>

            </aside>

          </div>

        </div>

        {/* =====================================================
            ASSIGNMENT DETAILS MODAL
        ===================================================== */}

        {selectedAssignment && (
          <div
            className="learning-assignment-modal-overlay"
            onClick={closeAssignment}
          >

            <div
              className="learning-assignment-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="learning-assignment-modal-header">

                <div>
                  <p>
                    ASSIGNMENT
                  </p>

                  <h4>
                    {selectedAssignment.title}
                  </h4>
                </div>

                <button
                  type="button"
                  className="learning-assignment-modal-close"
                  onClick={
                    closeAssignment
                  }
                >
                  ✕
                </button>

              </div>

              {/* LOADING */}

              {assignmentDetailsLoading && (
                <div className="learning-assignment-modal-loading">
                  Loading assignment details...
                </div>
              )}

              {/* ERROR */}

              {assignmentDetailsError && (
                <div className="learning-assignment-modal-error">
                  {assignmentDetailsError}
                </div>
              )}

              {/* DETAILS */}

              {!assignmentDetailsLoading && (
                <div className="learning-assignment-details">

                  {/* COURSE */}

                  <div className="learning-assignment-detail-row">

                    <span>
                      Course
                    </span>

                    <strong>
                      {selectedAssignment
                        .course?.code ||
                        selectedCourse.code ||
                        "--"}
                      {" • "}
                      {selectedAssignment
                        .course?.name ||
                        selectedCourse.name ||
                        "--"}
                    </strong>

                  </div>

                  {/* CLASS */}

                  <div className="learning-assignment-detail-row">

                    <span>
                      Class
                    </span>

                    <strong>
                      {selectedAssignment
                        .class?.name ||
                        "--"}
                    </strong>

                  </div>

                  {/* DUE DATE */}

                  <div className="learning-assignment-detail-row">

                    <span>
                      Due Date
                    </span>

                    <strong>
                      {formatDueDate(
                        selectedAssignment.dueDate
                      )}
                    </strong>

                  </div>

                  {/* INSTRUCTIONS */}

                  <div className="learning-assignment-description">

                    <span>
                      Instructions
                    </span>

                    <p>
                      {selectedAssignment.description ||
                        "No additional instructions provided."}
                    </p>

                  </div>

                  {/* =================================================
                      SUBMISSION SECTION
                  ================================================= */}

                  <div className="learning-assignment-submission-box">

                    {submissionLoading ? (
                      <>
                        <div className="learning-submission-icon">
                          ⏳
                        </div>

                        <h5>
                          Checking submission...
                        </h5>

                        <p>
                          Checking whether you have
                          already submitted this
                          assignment.
                        </p>
                      </>
                    ) : submission ? (
                      <>
                        {/* SUCCESS */}

                        <div className="learning-submission-success-icon">
                          ✓
                        </div>

                        <h5>
                          Assignment Submitted
                        </h5>

                        <p>
                          📎{" "}
                          {
                            submission.originalFileName
                          }
                        </p>

                        <small>
                          Submitted{" "}
                          {formatDueDate(
                            submission.submittedAt
                          )}
                        </small>

                        {/* SUCCESS MESSAGE */}

                        {submissionMessage && (
                          <div className="learning-submission-success-message">
                            {submissionMessage}
                          </div>
                        )}

                        {/* MARKS */}

                        {submission.marks !==
                          null &&
                          submission.marks !==
                            undefined && (
                            <div className="learning-assignment-result">

                              <strong>
                                {submission.marks}/100
                              </strong>

                              <span>
                                {submission.status ||
                                  "REVIEWED"}
                              </span>

                            </div>
                          )}

                        {/* NOT EVALUATED */}

                        {submission.marks ===
                          null &&
                          submission.marks ===
                            undefined && (
                            <div className="learning-assignment-result">

                              <strong>
                                --
                              </strong>

                              <span>
                                NOT EVALUATED
                              </span>

                            </div>
                          )}

                        {/* FEEDBACK */}

                        {submission.feedback && (
                          <div className="learning-assignment-feedback">

                            <span>
                              FACULTY FEEDBACK
                            </span>

                            <p>
                              {
                                submission.feedback
                              }
                            </p>

                          </div>
                        )}

                      </>
                    ) : (
                      <>
                        {/* UPLOAD */}

                        <div className="learning-submission-icon">
                          📤
                        </div>

                        <h5>
                          Submit Assignment
                        </h5>

                        <p>
                          Upload your completed
                          assignment file below.
                        </p>

                        <input
                          type="file"
                          onChange={(event) => {
                            setSubmissionFile(
                              event.target.files?.[0] ||
                                null
                            );

                            setSubmissionError(
                              ""
                            );

                            setSubmissionMessage(
                              ""
                            );
                          }}
                        />

                        {/* SELECTED FILE */}

                        {submissionFile && (
                          <div className="learning-selected-file">
                            Selected:{" "}
                            {
                              submissionFile.name
                            }
                          </div>
                        )}

                        {/* ERROR */}

                        {submissionError && (
                          <div className="learning-submission-error">
                            {submissionError}
                          </div>
                        )}

                        {/* SUBMIT */}

                        <button
                          type="button"
                          className="learning-submit-assignment-button"
                          onClick={
                            handleSubmitAssignment
                          }
                          disabled={
                            submissionLoading
                          }
                        >
                          {submissionLoading
                            ? "Submitting..."
                            : "Submit Assignment →"}
                        </button>

                      </>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </section>
    );
  }

  // =====================================================
  // LEARNING HUB HOME
  // =====================================================

  return (
    <section className="learning-hub">

      {/* HERO */}

      <div className="learning-hub-hero">

        <div>
          <p className="learning-hub-eyebrow">
            SMART EDUCATION
          </p>

          <h3>
            Learning Hub
          </h3>

          <p className="learning-hub-subtitle">
            Your learning, organized in one
            place.
          </p>
        </div>

        <div className="learning-hub-hero-icon">
          📚
        </div>

      </div>

      {/* CONTINUE LEARNING */}

      <section className="learning-hub-continue">

        <div className="learning-hub-section-heading">

          <div>
            <p>
              CONTINUE LEARNING
            </p>

            <h4>
              Pick up where you left off
            </h4>
          </div>

        </div>

        {loading && (
          <div className="learning-hub-state">

            <div className="learning-hub-state-icon">
              ⏳
            </div>

            <h5>
              Loading your courses...
            </h5>

            <p>
              Fetching your available
              courses from CampusOS.
            </p>

          </div>
        )}

        {!loading && error && (
          <div className="learning-hub-state">

            <div className="learning-hub-state-icon">
              !
            </div>

            <h5>
              Unable to load courses
            </h5>

            <p>
              {error}
            </p>

            {onRetry && (
              <button
                className="learning-hub-retry"
                onClick={onRetry}
              >
                Try Again
              </button>
            )}

          </div>
        )}

        {!loading &&
          !error &&
          availableCourses === 0 && (
            <div className="learning-hub-state">

              <div className="learning-hub-state-icon">
                📖
              </div>

              <h5>
                Your learning space is
                ready
              </h5>

              <p>
                Once courses are available,
                you can start your learning
                journey here.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          availableCourses > 0 && (
            <div className="learning-hub-featured">

              <div className="learning-hub-featured-icon">
                📚
              </div>

              <div className="learning-hub-featured-content">

                <span>
                  AVAILABLE COURSES
                </span>

                <h5>
                  {availableCourses} course
                  {availableCourses !== 1
                    ? "s"
                    : ""}{" "}
                  ready to explore
                </h5>

                <p>
                  Choose a course below to
                  begin learning.
                </p>

              </div>

            </div>
          )}

      </section>

      {/* COURSES */}

      <section className="learning-hub-courses">

        <div className="learning-hub-section-heading">

          <div>
            <p>
              MY COURSES
            </p>

            <h4>
              Available courses
            </h4>
          </div>

          <span className="learning-hub-count">
            {availableCourses}
          </span>

        </div>

        {!loading &&
          !error &&
          availableCourses > 0 && (
            <div className="learning-hub-course-grid">

              {courses.map((course) => (
                <article
                  className="learning-hub-course-card"
                  key={course._id}
                >

                  <div className="learning-hub-course-top">

                    <div className="learning-hub-course-code">
                      {course.code ||
                        "COURSE"}
                    </div>

                    <span className="learning-hub-course-arrow">
                      →
                    </span>

                  </div>

                  <h5>
                    {course.name ||
                      "Untitled Course"}
                  </h5>

                  <div className="learning-hub-progress">

                    <div className="learning-hub-progress-label">

                      <span>
                        Learning progress
                      </span>

                      <strong>
                        {startedCourses[
                          course._id
                        ]
                          ? "1%"
                          : "0%"}
                      </strong>

                    </div>

                    <div className="learning-hub-progress-track">

                      <div
                        className="learning-hub-progress-fill"
                        style={{
                          width:
                            startedCourses[
                              course._id
                            ]
                              ? "1%"
                              : "0%",
                        }}
                      />

                    </div>

                  </div>

                  <div className="learning-hub-course-footer">

                    <span>
                      {course.credits ||
                        0}{" "}
                      Credits
                    </span>

                    <button
                      type="button"
                      className="learning-hub-start-button"
                      onClick={() =>
                        openCourse(course)
                      }
                    >
                      {startedCourses[
                        course._id
                      ]
                        ? "Continue Learning"
                        : "Start Learning"}
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        {!loading &&
          !error &&
          availableCourses === 0 && (
            <div className="learning-hub-empty-courses">

              <span>
                ○
              </span>

              <p>
                No courses are currently
                available.
              </p>

            </div>
          )}

      </section>

      {/* PROGRESS */}

      <section className="learning-hub-progress-section">

        <div className="learning-hub-section-heading">

          <div>
            <p>
              LEARNING PROGRESS
            </p>

            <h4>
              Your learning overview
            </h4>
          </div>

        </div>

        <div className="learning-hub-progress-grid">

          <div className="learning-hub-progress-card">

            <span>
              Courses Available
            </span>

            <strong>
              {loading
                ? "..."
                : availableCourses}
            </strong>

            <small>
              From your CampusOS academics
            </small>

          </div>

          <div className="learning-hub-progress-card">

            <span>
              In Progress
            </span>

            <strong>
              {
                Object.values(
                  startedCourses
                ).filter(Boolean).length
              }
            </strong>

            <small>
              Courses you have started
            </small>

          </div>

          <div className="learning-hub-progress-card">

            <span>
              Completed
            </span>

            <strong>
              0
            </strong>

            <small>
              Completion tracking will
              connect here
            </small>

          </div>

        </div>

      </section>

      {/* PANDA */}

      <section className="learning-hub-smart-section">

        <div className="learning-hub-smart-icon">
          🐼
        </div>

        <div>

          <p className="learning-hub-smart-label">
            panDA
          </p>

          <h4>
            Your learning companion
          </h4>

          <p>
            panDA will guide you through
            your learning journey and
            provide assistance when you
            need it.
          </p>

        </div>

      </section>

    </section>
  );
}

export default LearningHub;