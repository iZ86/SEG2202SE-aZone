import { RowDataPacket } from "mysql2";

export interface LecturerData extends RowDataPacket {
  lecturerId: number;
  firstName: string;
  lastName: string;
  lecturerTitleId: number;
  lecturerTitle: string;
  email: string;
  phoneNumber: string;
}

export interface LecturerTitleData extends RowDataPacket {
  lecturerTitleId: number;
  lecturerTitle: string;
}
