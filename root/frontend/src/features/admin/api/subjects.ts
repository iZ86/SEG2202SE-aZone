export const getAllSubjectsAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/subjects?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getSubjectByIdAPI = async (token: string, subjectId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/subjects/${subjectId}`,
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

export const createSubjectAPI = async (token: string, subjectName: string, subjectCode: string, creditHours: number, description: string, courseIds: number[]): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/subjects",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectName,
          subjectCode,
          creditHours,
          description: description ?? "",
          courseIds,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateSubjectByIdAPI = async (token: string, subjectId: number, subjectName: string, subjectCode: string, creditHours: number, description: string, courseIds: number[]): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/subjects/${subjectId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectName,
          subjectCode,
          creditHours,
          description,
          courseIds,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteSubjectByIdAPI = async (token: string, subjectId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/subjects/${subjectId}`,
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
