import { RowDataPacket } from "mysql2";

export interface TotalCount extends RowDataPacket {
  totalCount: number;
}

export interface IsExist extends RowDataPacket {
  value: number;
}
