export const getAllCoursesAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/courses?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getCourseByIdAPI = async (token: string, courseId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/courses/${courseId}`,
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

export const createCourseAPI = async (token: string, courseName: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/courses",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseName,
          programmeId,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateCourseByIdAPI = async (token: string, courseId: number, courseName: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/courses/${courseId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseName,
          programmeId,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteCourseByIdAPI = async (token: string, courseId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/courses/${courseId}`,
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
