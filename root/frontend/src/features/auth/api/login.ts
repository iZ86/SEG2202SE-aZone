export const loginAPI = async (userId: string, password: string, role: number): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/auth/login",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          password: password,
          role: role
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
}
