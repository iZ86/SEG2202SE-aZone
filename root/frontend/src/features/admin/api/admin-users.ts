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
