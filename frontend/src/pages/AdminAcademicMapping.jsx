import { useEffect, useState } from "react";
import "./AdminAcademicMapping.css";
import {
  getCourses,
  getClasses,
  getAdminFaculty,
  getAcademicMappings,
  createAcademicMapping,
} from "../services/api";

function AdminAcademicMapping() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [classId, setClassId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [courseData, classData, facultyData, mappingData] =
        await Promise.all([
          getCourses(),
          getClasses(),
          getAdminFaculty(),
          getAcademicMappings(),
        ]);

      setCourses(courseData.courses || []);
      setClasses(classData.classes || []);
      setFaculty(facultyData.faculty || []);
      setMappings(mappingData.mappings || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const data = await createAcademicMapping({
        courseId,
        facultyId,
        classId,
      });

      setSuccessMessage(data.message);

      setCourseId("");
      setFacultyId("");
      setClassId("");

      await loadData();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-mapping-page">
      <div className="admin-mapping-header">
        <div>
          <p className="admin-mapping-label">
            ACADEMIC SETUP
          </p>

          <h3>Academic Mapping</h3>

          <p>
            Connect courses, faculty and classes together.
          </p>
        </div>

        <button
          className="admin-mapping-refresh"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {successMessage && (
        <div className="admin-mapping-success">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="admin-mapping-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-mapping-layout">
        <div className="admin-mapping-card">
          <div className="admin-mapping-card-header">
            <p>CREATE MAPPING</p>

            <h4>Assign Academic Relationship</h4>
          </div>

          <form
            className="admin-mapping-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-mapping-form-group">
              <label htmlFor="mapping-course">
                Course
              </label>

              <select
                id="mapping-course"
                value={courseId}
                onChange={(event) =>
                  setCourseId(event.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">
                  Select course
                </option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-mapping-form-group">
              <label htmlFor="mapping-faculty">
                Faculty
              </label>

              <select
                id="mapping-faculty"
                value={facultyId}
                onChange={(event) =>
                  setFacultyId(event.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">
                  Select faculty
                </option>

                {faculty.map((member) => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.email}
                    {member.facultyType
                      ? ` — ${member.facultyType}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-mapping-form-group">
              <label htmlFor="mapping-class">
                Class
              </label>

              <select
                id="mapping-class"
                value={classId}
                onChange={(event) =>
                  setClassId(event.target.value)
                }
                required
                disabled={loading}
              >
                <option value="">
                  Select class
                </option>

                {classes.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name} — Section {item.section}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="admin-mapping-submit"
              disabled={saving || loading}
            >
              {saving
                ? "Creating..."
                : "Create Mapping"}
            </button>
          </form>
        </div>

        <div className="admin-mapping-card">
          <div className="admin-mapping-card-header">
            <p>MAPPING DIRECTORY</p>

            <h4>
              {mappings.length} Mapping
              {mappings.length !== 1 ? "s" : ""}
            </h4>
          </div>

          {loading && (
            <div className="admin-mapping-empty">
              Loading mappings...
            </div>
          )}

          {!loading && mappings.length === 0 && (
            <div className="admin-mapping-empty">
              No academic mappings found.
            </div>
          )}

          {!loading && mappings.length > 0 && (
            <div className="admin-mapping-list">
              {mappings.map((mapping) => (
                <div
                  className="admin-mapping-item"
                  key={mapping._id}
                >
                  <div>
                    <strong>
                      {mapping.course?.code}
                    </strong>

                    <span>
                      {mapping.course?.name}
                    </span>
                  </div>

                  <div className="admin-mapping-arrow">
                    →
                  </div>

                  <div>
                    <strong>
                      {mapping.faculty?.email}
                    </strong>

                    <span>
                      {mapping.faculty?.facultyType ||
                        "Faculty"}
                    </span>
                  </div>

                  <div className="admin-mapping-arrow">
                    →
                  </div>

                  <div>
                    <strong>
                      {mapping.class?.name}
                    </strong>

                    <span>
                      Section {mapping.class?.section}
                    </span>
                  </div>

                  <span className="admin-mapping-status">
                    {mapping.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminAcademicMapping;