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
