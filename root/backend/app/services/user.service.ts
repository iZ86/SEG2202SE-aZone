import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import { StudentCourseProgrammeIntakeData, UserCount, UserData } from "../models/user-model";
import { CourseData } from "../models/course-model";
import { ProgrammeData, ProgrammeIntakeData } from "../models/programme-model";
import UserRepository from "../repositories/user.repository";
import CourseRepository from "../repositories/course.repository";
import ProgrammeRepository from "../repositories/programme.repository";

interface IUserService {
  getAllAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getAllStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getUserById(userId: number): Promise<Result<UserData>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  isUserExist(userId: number): Promise<boolean>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>>;
  deleteUserById(userId: number): Promise<Result<null>>;
  getAllStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>>;
  deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId: number, status: number): Promise<Result<null>>;
}

class UserService implements IUserService {
  async getAllAdmins(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const admins: UserData[] = await UserRepository.getAllAdmins(query, pageSize, page);

    return Result.succeed(admins, "Admins retrieve success");
  }

  async getAllStudents(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const students: UserData[] = await UserRepository.getAllStudents(query, pageSize, page);
    return Result.succeed(students, "Students retrieve success");
  }

  async getUserById(userId: number): Promise<Result<UserData>> {
    const user: UserData | undefined = await UserRepository.getAdminById(userId);

    if (!user) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "User not found");
    }

    return Result.succeed(user, "User retrieve success");
  }

  async getAdminById(adminId: number): Promise<Result<UserData>> {
    const admin: UserData | undefined = await UserRepository.getAdminById(adminId);

    if (!admin) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Admin not found");
    }

    return Result.succeed(admin, "Admin retrieve success");
  }

  async getStudentById(studentId: number): Promise<Result<UserData>> {
    const student: UserData | undefined = await UserRepository.getStudentById(studentId);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getUserCount(query: string = "", role: ENUM_USER_ROLE): Promise<Result<number>> {
    let userCount: number;

    switch (role) {
      case ENUM_USER_ROLE.ADMIN:
        userCount = await UserRepository.getAdminCount(query);
        break;
      case ENUM_USER_ROLE.STUDENT:
        userCount = await UserRepository.getStudentCount(query);
        break;
      default:
        return Result.succeed(0, "Failed to get user count");
    }

    return Result.succeed(userCount ? userCount : 0, "User count retrieve success");
  }

  async isUserExist(userId: number): Promise<boolean> {
    const isUserExist: boolean = await UserRepository.isUserExist(userId);

    if (!isUserExist) {
      return false;
    }

    return true;
  }

  async createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const course: CourseData | undefined = await CourseRepository.getCourseById(courseId);
    const programme: ProgrammeData | undefined = await ProgrammeRepository.getProgrammeById(programmeId);
    const programmeIntake: ProgrammeIntakeData | undefined = await ProgrammeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!course || !programme || !programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid courseId, programmeId, or programmeIntakeId");
    }

    const hashedPassword: string = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const createUserResponse: ResultSetHeader = await UserRepository.createUser(firstName, lastName, email, phoneNumber, hashedPassword, userStatus);

    const response: ResultSetHeader = await UserRepository.createStudent(createUserResponse.insertId);

    const studentCourseProgrammeIntakeResponse: Result<StudentCourseProgrammeIntakeData> = await this.createStudentCourseProgrammeIntake(response.insertId, courseId, programmeIntakeId, courseStatus);

    if (!studentCourseProgrammeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student created not found");
    }

    return Result.succeed(studentCourseProgrammeIntakeResponse.getData(), "Student create success");
  }

  async updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number, programmeId: number, courseId: number, programmeIntakeId: number, courseStatus: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const student: UserData | undefined = await UserRepository.getStudentById(studentId);
    const course: CourseData | undefined = await CourseRepository.getCourseById(courseId);
    const programme: ProgrammeData | undefined = await ProgrammeRepository.getProgrammeById(programmeId);
    const programmeIntake: ProgrammeIntakeData | undefined = await ProgrammeRepository.getProgrammeIntakeById(programmeIntakeId);

    if (!student || !course || !programme || !programmeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentId, courseId, programmeId, or programmeIntakeId");
    }

    await UserRepository.updateUserById(studentId, firstName, lastName, phoneNumber, email, userStatus);

    const studentCourseProgrammeIntakeResponse: Result<StudentCourseProgrammeIntakeData> = await this.updateStudentCourseProgrammeIntakeByStudentId(studentId, courseId, programmeIntakeId, courseStatus);

    if (!studentCourseProgrammeIntakeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student created not found");
    }

    return Result.succeed(studentCourseProgrammeIntakeResponse.getData(), "Student update success");
  }

  async updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>> {
    const adminResponse: UserData | undefined = await UserRepository.getAdminById(adminId);

    if (!adminResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid adminId");
    }

    await UserRepository.updateUserById(adminId, firstName, lastName, phoneNumber, email, 1);

    const admin: UserData | undefined = await UserRepository.getAdminById(adminId);

    if (!admin) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Admin updated not found");
    }

    return Result.succeed(admin, "Admin update success");
  }

  async deleteUserById(userId: number): Promise<Result<null>> {
    await UserRepository.deleteUserById(userId);

    return Result.succeed(null, "User delete success");
  }

  async getAllStudentCourseProgrammeIntakes(query: string = "", pageSize: number, page: number): Promise<Result<StudentCourseProgrammeIntakeData[]>> {
    const studentCourseProgrammeIntakes: StudentCourseProgrammeIntakeData[] = await UserRepository.getAllStudentCourseProgrammeIntakes(query, pageSize, page);

    if (!studentCourseProgrammeIntakes.length) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntakes, "Students course programme intakes retrieve success");
  }

  async getStudentCourseProgrammeIntakeByStudentId(studentId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // Enroll the student into a course, and specify a programme intake.
  async createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    await UserRepository.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId, status);

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCrouseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake created not found");
    }

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake create success");
  }

  async updateStudentCourseProgrammeIntakeByStudentId(studentId: number, courseId: number, programmeIntakeId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    await UserRepository.updateStudentCourseProgrammeIntakeByStudentId(studentId, courseId, programmeIntakeId, status);

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await UserRepository.getStudentCourseProgrammeIntakeByStudentId(studentId);

    if (!studentCrouseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake updated not found");
    }

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake update success");
  }

  async deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId: number, status: number): Promise<Result<null>> {
    await UserRepository.deleteStudentCourseProgrammeIntakeByStudentIdAndStatus(studentId, status);

    return Result.succeed(null, "Student course programme intake delete success");
  }
}

export default new UserService();
