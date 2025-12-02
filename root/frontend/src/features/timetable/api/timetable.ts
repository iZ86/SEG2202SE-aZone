export async function fetchTimeTableAPI(token: string): Promise<Response | undefined> {
  try {
    return await fetch("http://localhost:8080/api/v1/users/students/timetable",
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
}
