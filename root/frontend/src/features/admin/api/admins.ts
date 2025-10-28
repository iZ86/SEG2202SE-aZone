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


export const updateAdminByIdAPI = async (token: string, adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Response | undefined> => {
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
