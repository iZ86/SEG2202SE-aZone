import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { UserData } from "../models/user-model";
import UserRepository from "../repositories/user.repository";
import { StudentCourseProgrammeIntakeData, UserData } from "../models/user-model";

interface IUserService {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getAllStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  isUserExist(userId: number): Promise<boolean>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<Result<null>>;
  updateUserDetailsById(firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean, userId: number): Promise<Result<null>>;
  deleteUserById(userId: number): Promise<Result<null>>;
  getStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId: number, status: number): Promise<Result<null>>;
}

class UserService implements IUserService {
  async getAllAdmins(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const admins: UserData[] = await UserRepository.getAdmins(query, pageSize, page);

    return Result.succeed(admins, "Admins retrieve success");
  }

  async getAllStudents(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
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

  async isUserExist(userId: number): Promise<boolean> {
    const isUserExist: boolean = await UserRepository.isUserExist(userId);

    if (!isUserExist) {
      return false;
    }

    return true;
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
    const userResponse: boolean = await this.isUserExist(userId);

    if (!userResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid userId");
    }

    await UserRepository.updateUserById(userId, firstName, lastName, phoneNumber, email, status);

    return Result.succeed(null, "Student update success");
  }

  async deleteUserById(userId: number): Promise<Result<null>> {
    const userResponse: boolean = await this.isUserExist(userId);

    if (!userResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid userId");
    }

    await UserRepository.deleteUserById(userId);

    return Result.succeed(null, "User delete success");
  async getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // Enroll the student into a course, and specify a programme intake.
  async createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    await UserRepository.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId, status);

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake create success");
  }

  async updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    await UserRepository.updateStudentCourseProgrammeIntakeByStudentId(studentId, courseId, programmeIntakeId, status);

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake update success");
  }

  async deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId: number, status: number): Promise<Result<null>> {
    await UserRepository.deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId, status);

    return Result.succeed(null, "Student course programme intake delete success");
  }
}

export default new UserService();
