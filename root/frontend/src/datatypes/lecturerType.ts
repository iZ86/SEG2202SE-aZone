export type Lecturer = {
  lecturerId: number;
  firstName: string;
  lastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  email: string;
  phoneNumber: string;
};

export type LecturerTitle = {
  lecturerTitleId: number;
  lecturerTitle: string;
};
