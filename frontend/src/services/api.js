const API_BASE_URL = "http://localhost:5000/api";

// =====================================================
// COMMON API REQUEST
// =====================================================

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("campusos_token");

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
};

// =====================================================
// AUTH
// =====================================================

export const loginUser = async (
  email,
  password
) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// =====================================================
// COURSES
// =====================================================

export const getCourses = async (
  filters = {}
) => {
  const params = new URLSearchParams();

  if (filters.regulationId) {
    params.append(
      "regulationId",
      filters.regulationId
    );
  }

  if (filters.semester) {
    params.append(
      "semester",
      filters.semester
    );
  }

  if (filters.department) {
    params.append(
      "department",
      filters.department
    );
  }

  const query = params.toString();

  return apiRequest(
    `/courses${query ? `?${query}` : ""}`
  );
};

// =====================================================
// ADMIN
// =====================================================

export const createAdminUser = async ({
  email,
  password,
  role,
  department,
  classId,
}) => {
  return apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      role,
      department,
      classId,
    }),
  });
};

export const getClasses = async () => {
  return apiRequest("/classes");
};

export const getFaculty = async () => {
  return apiRequest("/admin/faculty");
};

export const getAdminFaculty = async () => {
  return apiRequest("/admin/faculty");
};

export const designateHOD = async (
  userId
) => {
  return apiRequest(
    `/admin/users/${userId}/designate-hod`,
    {
      method: "PATCH",
    }
  );
};

// =====================================================
// ACADEMIC MAPPING
// =====================================================

export const getAcademicMappings =
  async () => {
    return apiRequest(
      "/academic-mappings"
    );
  };

export const createAcademicMapping =
  async ({
    courseId,
    facultyId,
    classId,
  }) => {
    return apiRequest(
      "/academic-mappings",
      {
        method: "POST",
        body: JSON.stringify({
          courseId,
          facultyId,
          classId,
        }),
      }
    );
  };

// =====================================================
// FACULTY / TUTOR
// =====================================================

export const getTutorCourses =
  async () => {
    return apiRequest(
      "/tutor/courses"
    );
  };

// =====================================================
// LEARNING MATERIALS
// =====================================================

export const getFacultyMaterials =
  async () => {
    return apiRequest(
      "/materials/faculty"
    );
  };

export const getStudentMaterials =
  async () => {
    return apiRequest(
      "/materials/student"
    );
  };

export const uploadLearningMaterial =
  async ({
    courseId,
    classId,
    title,
    description,
    file,
  }) => {
    const token =
      localStorage.getItem(
        "campusos_token"
      );

    const formData =
      new FormData();

    formData.append(
      "courseId",
      courseId
    );

    formData.append(
      "classId",
      classId
    );

    formData.append(
      "title",
      title
    );

    formData.append(
      "description",
      description || ""
    );

    formData.append(
      "file",
      file
    );

    const response = await fetch(
      `${API_BASE_URL}/materials/upload`,
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to upload material"
      );
    }

    return data;
  };

export const deleteLearningMaterial =
  async (materialId) => {
    return apiRequest(
      `/materials/${materialId}`,
      {
        method: "DELETE",
      }
    );
  };

// =====================================================
// ASSIGNMENTS - FACULTY
// =====================================================

export const createAssignment =
  async ({
    courseId,
    classId,
    title,
    description,
    dueDate,
  }) => {
    return apiRequest(
      "/assignments",
      {
        method: "POST",

        body: JSON.stringify({
          courseId,
          classId,
          title,
          description,
          dueDate,
        }),
      }
    );
  };

export const getFacultyAssignments =
  async () => {
    return apiRequest(
      "/assignments/faculty"
    );
  };

export const getFacultyAssignmentSubmissions =
  async (assignmentId) => {
    return apiRequest(
      `/assignments/faculty/${assignmentId}/submissions`
    );
  };

export const evaluateAssignmentSubmission =
  async (
    submissionId,
    marks,
    feedback
  ) => {
    return apiRequest(
      `/assignments/submissions/${submissionId}/evaluate`,
      {
        method: "PATCH",

        body: JSON.stringify({
          marks,
          feedback,
        }),
      }
    );
  };

// =====================================================
// ASSIGNMENTS - STUDENT
// =====================================================

export const getStudentAssignments =
  async () => {
    return apiRequest(
      "/assignments/student"
    );
  };

export const getAssignmentDetails =
  async (assignmentId) => {
    return apiRequest(
      `/assignments/student/${assignmentId}`
    );
  };

export const submitAssignment =
  async (
    assignmentId,
    file
  ) => {
    const token =
      localStorage.getItem(
        "campusos_token"
      );

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response = await fetch(
      `${API_BASE_URL}/assignments/student/${assignmentId}/submission`,
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to submit assignment"
      );
    }

    return data;
  };

export const getAssignmentSubmission =
  async (assignmentId) => {
    return apiRequest(
      `/assignments/student/${assignmentId}/submission`
    );
  };

// =====================================================
// FACULTY SUBMISSION DOWNLOAD
// =====================================================

export const downloadAssignmentSubmission =
  async (submissionId) => {
    const token =
      localStorage.getItem(
        "campusos_token"
      );

    const response = await fetch(
      `${API_BASE_URL}/assignments/faculty/submissions/${submissionId}/download`,
      {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    if (!response.ok) {
      const data =
        await response
          .json()
          .catch(() => ({}));

      throw new Error(
        data.message ||
          "Failed to download submission"
      );
    }

    return response.blob();
  };

  export const chatWithAI = async (
  message,
  context = {}
) => {
  return apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      context,
    }),
  });
};