import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { UserData } from "../models/user-model";
import UserRepository from "../repositories/user.repository";

interface IUserService {
  getAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<Result<null>>;
  updateUserDetailsById(firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean, userId: number): Promise<Result<null>>;
  deleteUserById(userId: number): Promise<Result<null>>;
}

class UserService implements IUserService {
  async getAdmins(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const admins: UserData[] = await UserRepository.getAdmins(query, pageSize, page);

    return Result.succeed(admins, "Admins retrieve success");
  }

  async getStudents(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const students: UserData[] = await UserRepository.getStudents(query, pageSize, page);

    return Result.succeed(students, "Students retrieve success");
  }

  async getAdminById(adminId: number): Promise<Result<UserData>> {
    const admin: UserData = await UserRepository.getAdminById(adminId);

    if (!admin) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Admin not found");
    }

    return Result.succeed(admin, "Admin retrieve success");
  }

  async getStudentById(studentId: number): Promise<Result<UserData>> {
    const student: UserData = await UserRepository.getStudentById(studentId);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<Result<null>> {
    const hashedPassword: string = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const createUserResponse: ResultSetHeader = await UserRepository.createUser(firstName, lastName, email, phoneNumber, hashedPassword, status);

    await UserRepository.createStudent(createUserResponse.insertId);

    return Result.succeed(null, "Student create success");
  }

  async updateUserDetailsById(firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean, userId: number): Promise<Result<null>> {
    await UserRepository.updateUserById(userId, firstName, lastName, phoneNumber, email, status);

    return Result.succeed(null, "Student update success");
  }

  async deleteUserById(userId: number): Promise<Result<null>> {
    await UserRepository.deleteUserById(userId);

    return Result.succeed(null, "User delete success");
  }
}

export default new UserService();
