export const studentLogin = async (studentId: string, password: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/auth/login",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: studentId,
          password: password,
          role: 1
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
}
