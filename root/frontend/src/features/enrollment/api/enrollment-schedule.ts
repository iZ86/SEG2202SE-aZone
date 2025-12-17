export async function fetchEnrollmentScheduleAPI(token: string): Promise<Response | undefined> {
  try {
    return await fetch("http://localhost:8080/api/v1/enrollments/schedule",
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