export const getMeAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/auth/me",
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateMeAPI = async (token: string, email: string, phoneNumber: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/auth/me",
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          phoneNumber: phoneNumber,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};
