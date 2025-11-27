export const getAllLecturersAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/lecturers?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getLecturerByIdAPI = async (token: string, lecturerId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/lecturers/${lecturerId}`,
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

export const createLecturerAPI = async (token: string, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/lecturers",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          lecturerTitleId,
          email,
          phoneNumber
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateLecturerByIdAPI = async (token: string, lecturerId: number, firstName: string, lastName: string, lecturerTitleId: number, email: string, phoneNumber: string): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/lecturers/${lecturerId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          lecturerTitleId,
          email,
          phoneNumber
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteLecturerByIdAPI = async (token: string, lecturerId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/lecturers/${lecturerId}`,
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

export const getAllLecturerTitlesAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/lecturers/titles",
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

export const getLecturerTitleByIdAPI = async (token: string, lecturerTitleId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/lecturers/${lecturerTitleId}`,
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
