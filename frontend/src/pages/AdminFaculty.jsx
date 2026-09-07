import { useEffect, useState } from "react";
import "./AdminFaculty.css";
import {
  getAdminFaculty,
  designateHOD,
} from "../services/api";

function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadFaculty = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAdminFaculty();

      setFaculty(data.faculty || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleDesignateHOD = async (userId) => {
    try {
      setActionLoading(userId);
      setErrorMessage("");

      await designateHOD(userId);

      await loadFaculty();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <section className="admin-faculty-page">
      <div className="admin-faculty-header">
        <div>
          <p className="admin-faculty-label">
            USER MANAGEMENT
          </p>

          <h3>Faculty</h3>

          <p>
            View and manage faculty members across the campus.
          </p>
        </div>

        <button
          className="admin-faculty-refresh"
          onClick={loadFaculty}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div className="admin-faculty-error">
          {errorMessage}
        </div>
      )}

      <div className="admin-faculty-card">
        <div className="admin-faculty-card-header">
          <div>
            <p>FACULTY DIRECTORY</p>
            <h4>
              {faculty.length} Faculty Member
              {faculty.length !== 1 ? "s" : ""}
            </h4>
          </div>
        </div>

        {loading && (
          <div className="admin-faculty-empty">
            <h5>Loading faculty...</h5>
            <p>
              Fetching faculty information from CampusOS.
            </p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          faculty.length === 0 && (
            <div className="admin-faculty-empty">
              <h5>No faculty found</h5>
              <p>
                No faculty members are currently enrolled.
              </p>
            </div>
          )}

        {!loading && faculty.length > 0 && (
          <div className="admin-faculty-table-wrapper">
            <table className="admin-faculty-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {faculty.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="admin-faculty-person">
                        <div className="admin-faculty-avatar">
                          {member.email
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{member.email}</strong>
                          <span>{member.role}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {member.department || "Not assigned"}
                    </td>

                    <td>
                      {member.facultyType ? (
                        <span className="admin-faculty-badge">
                          {member.facultyType}
                        </span>
                      ) : (
                        <span className="admin-faculty-muted">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="admin-faculty-status">
                        {member.status}
                      </span>
                    </td>

                    <td>
                      {member.facultyType === "HOD" ? (
                        <span className="admin-faculty-current">
                          Current HOD
                        </span>
                      ) : (
                        <button
                          className="admin-faculty-hod-button"
                          onClick={() =>
                            handleDesignateHOD(member._id)
                          }
                          disabled={
                            actionLoading === member._id
                          }
                        >
                          {actionLoading === member._id
                            ? "Updating..."
                            : "Designate HOD"}
                        </button>
                      )}
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

export default AdminFaculty;