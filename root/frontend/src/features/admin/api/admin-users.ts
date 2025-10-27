export const getAllStudentCourseProgrammeIntakesAPI = async (token: string, pageSize: number, page: number, query: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/students/course/programme/intake?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getStudentCourseProgrammeIntakeByStudentIdAPI = async (token: string, studentId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/${studentId}/course/programme/intake`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getAllAdminsAPI = async (token: string, pageSize: number, page: number, query: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/admins?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getAdminByIdAPI = async (token: string, adminId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/admins/${adminId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getAllProgrammesAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes",
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getCoursesByProgrammeIdAPI = async (token: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/courses/programme/${programmeId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const getProgrammeIntakesByProgrammeIdAPI = async (token: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/${programmeId}/intake`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const createStudent = async (token: string, firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          userStatus: status,
          programmeId,
          courseId,
          programmeIntakeId,
          courseStatus,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateStudentById = async (token: string, studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/${studentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          userStatus: status,
          programmeId,
          courseId,
          programmeIntakeId,
          courseStatus,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateAdminById = async (token: string, adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/admins/${adminId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};
