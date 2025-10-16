import { RowDataPacket } from "mysql2";

export interface BasicStudentLoginData extends RowDataPacket {
  studentId: number;
  email: string;
  password: string;
}

export interface BasicAdminLoginData extends RowDataPacket {
  userId: number;
  email: string;
  password: string;
}

export interface UserData extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
