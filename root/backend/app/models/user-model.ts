
/**
 * Models folder will be mainly used for data types
 * This is an example for User Model
 * */
import { RowDataPacket } from "mysql2";

export interface Users extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}
