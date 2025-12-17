export async function fetchEnrolledSubjectsAPI(token: string): Promise<Response | undefined> {
  try {
    return await fetch("http://localhost:8080/api/v1/enrollments/subjects/enrolled",
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

export const enrollSubjectsAPI = async (token: string, enrollmentSubjectTypeIds: number[]): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/enrollments/subjects`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentSubjectTypeIds
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};