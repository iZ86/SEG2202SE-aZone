export const getAllIntakesAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/intakes?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getIntakeByIdAPI = async (token: string, intakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/intakes/${intakeId}`,
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

export const createIntakeAPI = async (token: string, intakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/intakes",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intakeId,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateIntakeByIdAPI = async (token: string, intakeId: number, newIntakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/intakes/${intakeId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intakeId: newIntakeId
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteIntakeByIdAPI = async (token: string, intakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/intakes/${intakeId}`,
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
