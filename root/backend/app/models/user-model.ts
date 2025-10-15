
/**
 * Models folder will be mainly used for data types
 * This is an example for User Model
 * */
import { RowDataPacket } from "mysql2";

export interface UserData extends RowDataPacket {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
