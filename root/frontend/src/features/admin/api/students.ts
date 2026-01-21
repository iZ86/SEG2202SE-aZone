export const getAllStudentsAPI = async (token: string, pageSize: number, page: number, query: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/students?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getStudentByIdAPI = async (token: string, studentId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/${studentId}`,
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

export const createStudentAPI = async (token: string, firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number): Promise<Response | undefined> => {
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
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateStudentByIdAPI = async (token: string, studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: number): Promise<Response | undefined> => {
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
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

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
    return await fetch(`http://localhost:8080/api/v1/programmes/history`,
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

export const createStudentCourseProgrammeIntakeAPI = async (token: string, studentId: number, courseId: number, programmeIntakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/course/programme/intake`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          courseId,
          programmeIntakeId,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeIdAPI = async (token: string, studentId: number, courseId: number, programmeIntakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/${studentId}/course/${courseId}/programme/intake/${programmeIntakeId}`,
      {
        method: 'DELETE',
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

export const getStudentsCountAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/students/count",
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

export const getStudentsTimetableByIdAPI = async (token: string, studentId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/users/students/${studentId}/timetable`,
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
