import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import UserRepository from "../repositories/user.repository";
import CourseService from "./course.service";
import ProgrammeService from "./programme.service";
import { StudentCourseProgrammeIntakeData, UserData } from "../models/user-model";
import { ProgrammeIntakeData } from "../models/programme-model";
import { CourseData } from "../models/course-model";

interface IUserService {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getAllStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getUserById(userId: number): Promise<Result<UserData>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  isUserExist(userId: number): Promise<boolean>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<Result<UserData>>;
  updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean): Promise<Result<UserData>>;
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

  async getUserById(userId: number): Promise<Result<UserData>> {
    const user: UserData = await UserRepository.getAdminById(userId);

    if (!user) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "User not found");
    }

    return Result.succeed(user, "User retrieve success");
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

  async createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, status: boolean): Promise<Result<UserData>> {
    const hashedPassword: string = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const createUserResponse: ResultSetHeader = await UserRepository.createUser(firstName, lastName, email, phoneNumber, hashedPassword, status);

    const response: ResultSetHeader = await UserRepository.createStudent(createUserResponse.insertId);

    const student: UserData = await UserRepository.getStudentById(response.insertId);

    return Result.succeed(student, "Student create success");
  }

  async updateUserById(userId: number, firstName: string, lastName: string, phoneNumber: string, email: string, status: boolean): Promise<Result<UserData>> {
    await UserRepository.updateUserById(userId, firstName, lastName, phoneNumber, email, status);

    const student: UserData = await UserRepository.getStudentById(userId);

    return Result.succeed(student, "Student update success");
  }

  async deleteUserById(userId: number): Promise<Result<null>> {
    await UserRepository.deleteUserById(userId);

    return Result.succeed(null, "User delete success");
  }

  async getStudentCourseProgrammeIntakes(query: string = "", pageSize: number, page: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>> {
    const studentCourseProgrammeIntakes: StudentCourseProgrammeIntakeData[] = await UserRepository.getStudentCourseProgrammeIntakes(query, pageSize, page, status);

    if (!studentCourseProgrammeIntakes.length) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntakes, "Students course programme intakes retrieve success");
  }

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
