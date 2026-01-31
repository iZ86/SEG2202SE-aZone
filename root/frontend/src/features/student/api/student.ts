export const getAllStudentEnrollmentSubjectByIdAPI = async (token: string, semester: number, pageSize: number, page: number, query: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/subjects?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}&semester=${semester}`,
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

export const getStudentInformationByIdAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/users/students/information",
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

