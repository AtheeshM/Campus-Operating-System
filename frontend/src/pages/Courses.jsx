import { useMemo, useState } from "react";

function Courses({ courses, loading, error, onRetry }) {
  const [semester, setSemester] = useState("all");
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSemester =
        semester === "all" ||
        String(course.semester) === semester;

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        course.code.toLowerCase().includes(searchValue) ||
        course.name.toLowerCase().includes(searchValue);

      return matchesSemester && matchesSearch;
    });
  }, [courses, semester, search]);

  const totalCredits = filteredCourses.reduce(
    (total, course) => total + (course.credits || 0),
    0
  );

  return (
    <section className="courses-page">
      <div className="courses-heading">
        <div>
          <p className="eyebrow">ACADEMICS</p>
          <h3>Courses</h3>
          <p className="courses-description">
            Browse the courses available in your academic curriculum.
          </p>
        </div>

        <div className="course-summary">
          <div>
            <strong>{filteredCourses.length}</strong>
            <span>Courses</span>
          </div>

          <div>
            <strong>{totalCredits}</strong>
            <span>Credits</span>
          </div>
        </div>
      </div>

      <div className="course-toolbar">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={semester}
          onChange={(event) => setSemester(event.target.value)}
        >
          <option value="all">All semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
      </div>

      {loading && (
        <div className="courses-panel">
          <div className="course-empty-state">
            <h4>Loading courses...</h4>
            <p>
              Fetching the academic course catalogue.
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="courses-panel">
          <div className="course-empty-state">
            <h4>Unable to load courses</h4>

            <p>{error}</p>

            <button
              className="retry-button"
              onClick={onRetry}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        filteredCourses.length === 0 && (
          <div className="courses-panel">
            <div className="course-empty-state">
              <div className="empty-icon">▣</div>

              <h4>No courses found</h4>

              <p>
                Try changing your search or semester filter.
              </p>
            </div>
          </div>
        )}

      {!loading &&
        !error &&
        filteredCourses.length > 0 && (
          <div className="courses-panel">
            <div className="courses-table-header">
              <span>COURSE</span>
              <span>SEMESTER</span>
              <span>L / T / P</span>
              <span>CREDITS</span>
            </div>

            <div className="courses-list">
              {filteredCourses.map((course) => (
                <div
                  className="course-item"
                  key={course._id}
                >
                  <div className="course-main">
                    <strong>{course.code}</strong>

                    <span>{course.name}</span>
                  </div>

                  <div className="course-semester">
                    {course.semester
                      ? `Semester ${course.semester}`
                      : "--"}
                  </div>

                  <div className="course-hours">
                    {course.lectureHours || 0} /{" "}
                    {course.tutorialHours || 0} /{" "}
                    {course.practicalHours || 0}
                  </div>

                  <div className="course-item-credit">
                    {course.credits || 0} Cr
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </section>
  );
}

export default Courses;