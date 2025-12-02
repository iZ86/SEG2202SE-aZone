import {
  type CalendarDateTime,
} from "@internationalized/date";

export const getAllEnrollmentsAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/enrollments?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getEnrollmentByIdAPI = async (token: string, enrollmentId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/enrollments/${enrollmentId}`,
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

export const getEnrollmentsByProgrammeIdAPI = async (token: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/enrollments/programme/${programmeId}`,
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

export const createEnrollmentAPI = async (token: string, enrollmentStartDateTime: CalendarDateTime, enrollmentEndDateTime: CalendarDateTime, programmeIntakeIds: number[]): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/enrollments",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentStartDateTime: enrollmentStartDateTime.toString().slice(0, 19).replace('T', ' '),
          enrollmentEndDateTime: enrollmentEndDateTime.toString().slice(0, 19).replace('T', ' '),
          programmeIntakeIds
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateEnrollmentByIdAPI = async (token: string, enrollmentId: number, enrollmentStartDateTime: CalendarDateTime, enrollmentEndDateTime: CalendarDateTime, programmeIntakeIds: number[]): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/enrollments/${enrollmentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentStartDateTime: enrollmentStartDateTime.toString().slice(0, 19).replace('T', ' '),
          enrollmentEndDateTime: enrollmentEndDateTime.toString().slice(0, 19).replace('T', ' '),
          programmeIntakeIds
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteEnrollmentByIdAPI = async (token: string, enrollmentId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/enrollments/${enrollmentId}`,
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
