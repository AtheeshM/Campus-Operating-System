import { useEffect, useState } from "react";
import "./AdminClasses.css";
import { getClasses } from "../services/api";

function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadClasses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getClasses();

      setClasses(data.classes || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <section className="admin-classes-page">
      <div className="admin-classes-header">
        <div>
          <p className="admin-classes-label">ACADEMIC SETUP</p>

          <h3>Classes</h3>

          <p>
            View and manage academic classes across the campus.
          </p>
        </div>

        <button
          className="admin-classes-refresh"
          onClick={loadClasses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div className="admin-classes-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-classes-card">
        <div className="admin-classes-card-header">
          <div>
            <p>CLASS DIRECTORY</p>

            <h4>
              {classes.length} Class
              {classes.length !== 1 ? "es" : ""}
            </h4>
          </div>
        </div>

        {loading && (
          <div className="admin-classes-empty">
            <h5>Loading classes...</h5>

            <p>
              Fetching class information from CampusOS.
            </p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          classes.length === 0 && (
            <div className="admin-classes-empty">
              <h5>No classes found</h5>

              <p>
                No classes are currently available.
              </p>
            </div>
          )}

        {!loading && classes.length > 0 && (
          <div className="admin-classes-table-wrapper">
            <table className="admin-classes-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Tutor</th>
                  <th>Parent Registration</th>
                </tr>
              </thead>

              <tbody>
                {classes.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="admin-class-person">
                        <div className="admin-class-avatar">
                          {item.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{item.name}</strong>

                          <span>{item._id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {item.department || "Not assigned"}
                    </td>

                    <td>
                      <span className="admin-class-year">
                        Year {item.year}
                      </span>
                    </td>

                    <td>
                      <span className="admin-class-section">
                        {item.section}
                      </span>
                    </td>

                    <td>
                      {item.tutor?.email ? (
                        <div className="admin-class-tutor">
                          <strong>
                            {item.tutor.email}
                          </strong>

                          {item.tutor.facultyType && (
                            <span>
                              {item.tutor.facultyType}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="admin-class-muted">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          item.parentRegistrationEnabled
                            ? "admin-class-parent enabled"
                            : "admin-class-parent"
                        }
                      >
                        {item.parentRegistrationEnabled
                          ? "Enabled"
                          : "Disabled"}
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

export default AdminClasses;