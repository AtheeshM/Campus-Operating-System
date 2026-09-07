import { useEffect, useState } from "react";
import "./AdminCourses.css";
import { getCourses } from "../services/api";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getCourses();

      setCourses(data.courses || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <section className="admin-courses-page">
      <div className="admin-courses-header">
        <div>
          <p className="admin-courses-label">
            ACADEMIC CATALOGUE
          </p>

          <h3>Courses</h3>

          <p>
            Manage the academic course catalogue for CampusOS.
          </p>
        </div>

        <button
          className="admin-courses-refresh"
          onClick={loadCourses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div className="admin-courses-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-courses-card">
        <div className="admin-courses-card-header">
          <div>
            <p>COURSE DIRECTORY</p>

            <h4>
              {courses.length} Course
              {courses.length !== 1 ? "s" : ""}
            </h4>
          </div>
        </div>

        {loading && (
          <div className="admin-courses-empty">
            <h5>Loading courses...</h5>

            <p>
              Fetching the academic catalogue from CampusOS.
            </p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          courses.length === 0 && (
            <div className="admin-courses-empty">
              <h5>No courses found</h5>

              <p>
                No courses are currently available.
              </p>
            </div>
          )}

        {!loading && courses.length > 0 && (
          <div className="admin-courses-table-wrapper">
            <table className="admin-courses-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Credits</th>
                  <th>L</th>
                  <th>T</th>
                  <th>P</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="admin-course-info">
                        <strong>{course.code}</strong>

                        <span>{course.name}</span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-course-credits">
                        {course.credits}
                      </span>
                    </td>

                    <td>{course.lectureHours}</td>

                    <td>{course.tutorialHours}</td>

                    <td>{course.practicalHours}</td>

                    <td>
                      {course.department || "Not mapped"}
                    </td>

                    <td>
                      {course.semester
                        ? `Semester ${course.semester}`
                        : "Not mapped"}
                    </td>

                    <td>
                      <span className="admin-course-status">
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminCourses;