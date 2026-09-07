import { useEffect, useState } from "react";
import "./AdminEnrollUser.css";
import { createAdminUser, getClasses } from "../services/api";

function AdminEnrollUser() {
  const [role, setRole] = useState("STUDENT");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [classId, setClassId] = useState("");

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (role !== "STUDENT") {
      setClassId("");
      setClasses([]);
      return;
    }

    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        setErrorMessage("");

        const data = await getClasses();

        setClasses(data.classes || []);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, [role]);

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;

    setRole(selectedRole);
    setSuccessMessage("");
    setErrorMessage("");
    setClassId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const data = await createAdminUser({
        email,
        password,
        role,
        department: department || null,
        classId: role === "STUDENT" ? classId : null,
      });

      setSuccessMessage(data.message);

      setEmail("");
      setPassword("");
      setDepartment("");
      setClassId("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-enroll-page">
      <div className="admin-enroll-header">
        <div>
          <p className="admin-enroll-label">USER MANAGEMENT</p>
          <h3>Enroll User</h3>
          <p>
            Create student and faculty accounts for CampusOS.
          </p>
        </div>
      </div>

      <div className="admin-enroll-card">
        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <label>User Type</label>

            <div className="admin-role-selector">
              <button
                type="button"
                className={
                  role === "STUDENT"
                    ? "admin-role-option active"
                    : "admin-role-option"
                }
                onClick={() => handleRoleChange({
                  target: { value: "STUDENT" },
                })}
              >
                <strong>Student</strong>
                <span>Enroll a student</span>
              </button>

              <button
                type="button"
                className={
                  role === "FACULTY"
                    ? "admin-role-option active"
                    : "admin-role-option"
                }
                onClick={() => handleRoleChange({
                  target: { value: "FACULTY" },
                })}
              >
                <strong>Faculty</strong>
                <span>Enroll a faculty member</span>
              </button>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={
                role === "STUDENT"
                  ? "student@campusos.local"
                  : "faculty@campusos.local"
              }
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Initial Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter initial password"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="department">Department</label>

            <input
              id="department"
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Information Technology"
              required
            />
          </div>

          {role === "STUDENT" && (
            <div className="admin-form-group">
              <label htmlFor="class">Class</label>

              <select
                id="class"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                required
                disabled={loadingClasses}
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : "Select class"}
                </option>

                {classes.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name || item.className || item._id}
                  </option>
                ))}
              </select>

              {!loadingClasses && classes.length === 0 && (
                <small className="admin-form-hint">
                  No classes are currently available.
                </small>
              )}
            </div>
          )}

          {successMessage && (
            <div className="admin-success-message">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="admin-error-message">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="admin-submit-button"
            disabled={loading}
          >
            {loading ? "Enrolling..." : `Enroll ${role}`}
          </button>

        </form>
      </div>
    </section>
  );
}

export default AdminEnrollUser;