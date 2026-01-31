import {
  type CalendarDateTime,
} from "@internationalized/date";

export const getAllProgrammesAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getProgrammeByIdAPI = async (token: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/${programmeId}`,
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

export const createProgrammeAPI = async (token: string, programmeName: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programmeName,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateProgrammeByIdAPI = async (token: string, programmeId: number, programmeName: string): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/${programmeId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programmeName,
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteProgrammeByIdAPI = async (token: string, programmeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/${programmeId}`,
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

export const getAllProgrammeIntakesAPI = async (token: string, pageSize?: number, page?: number, query?: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes/intake?" + (query ? `query=${query}&` : '') + `pageSize=${pageSize}&page=${page}`,
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

export const getProgrammeIntakeByIdAPI = async (token: string, programmeIntakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/intake/${programmeIntakeId}`,
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

export const createProgrammeIntakeAPI = async (token: string, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: CalendarDateTime, semesterEndDate: CalendarDateTime): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes/intake",
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programmeId,
          intakeId,
          studyModeId,
          semester,
          semesterStartDate: semesterStartDate.toString().slice(0, 19).replace('T', ' '),
          semesterEndDate: semesterEndDate.toString().slice(0, 19).replace('T', ' '),
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const updateProgrammeIntakeByIdAPI = async (token: string, programmeIntakeId: number, programmeId: number, intakeId: number, studyModeId: number, semester: number, semesterStartDate: CalendarDateTime, semesterEndDate: CalendarDateTime): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/intake/${programmeIntakeId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programmeId,
          intakeId,
          studyModeId,
          semester,
          semesterStartDate: semesterStartDate.toString().slice(0, 19).replace('T', ' '),
          semesterEndDate: semesterEndDate.toString().slice(0, 19).replace('T', ' '),
        }),
        mode: "cors"
      });
  } catch (err) {
    console.error(err);
  }
};

export const deleteProgrammeIntakeByIdAPI = async (token: string, programmeIntakeId: number): Promise<Response | undefined> => {
  try {
    return await fetch(`http://localhost:8080/api/v1/programmes/intake/${programmeIntakeId}`,
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

export const getProgrammeDistributionAPI = async (token: string): Promise<Response | undefined> => {
  try {
    return await fetch("http://localhost:8080/api/v1/programmes/distribution",
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
