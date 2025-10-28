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
