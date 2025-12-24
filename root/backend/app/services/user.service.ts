import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_PROGRAMME_STATUS, ENUM_USER_ROLE } from "../enums/enums";
import { StudentCourseProgrammeIntakeData, UserData, StudentInformation, StudentSemesterStartAndEndData, StudentClassData } from "../models/user-model";
import userRepository from "../repositories/user.repository";

interface IUserService {
  getAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getUserByEmail(email: string): Promise<Result<UserData>>;
  getUserByIdAndEmail(userId: number, email: string): Promise<Result<UserData>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  getStudentByEmail(email: string): Promise<Result<UserData>>;
  getStudentByIdAndEmail(studentId: number, email: string): Promise<Result<UserData>>;
  isUserExist(userId: number): Promise<boolean>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number): Promise<Result<ResultSetHeader>>;
  updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number): Promise<Result<UserData | undefined>>;
  updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>>;
  deleteUserById(userId: number): Promise<Result<null>>;
  updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<Result<UserData | undefined>>;
  getStudentCourseProgrammeIntakeByStudentId(studentId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>>;
  // getStudentCourseProgrammeIntakes(query: string, pageSize: number, page: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>>;
  createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData[]>>;
  deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>>;
  getStudentInformationById(studentId: number): Promise<Result<StudentInformation>>;
  getStudentTimetableById(studentId: number): Promise<Result<StudentClassData[]>>;
  getStudentSemesterStartAndEndDateById(studentId: number): Promise<Result<StudentSemesterStartAndEndData | undefined>>;
}

class UserService implements IUserService {
  async getAdmins(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const admins: UserData[] = await userRepository.getAdmins(query, pageSize, page);

    return Result.succeed(admins, "Admins retrieve success");
  }

  async getStudents(query: string = "", pageSize: number, page: number): Promise<Result<UserData[]>> {
    const students: UserData[] = await userRepository.getStudents(query, pageSize, page);
    return Result.succeed(students, "Students retrieve success");
  }

  async getUserByEmail(email: string): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getUserByEmail(email);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getUserByIdAndEmail(userId: number, email: string): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getUserByIdAndEmail(userId, email);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getStudentById(studentId: number): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getStudentById(studentId);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getStudentByEmail(email: string): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getStudentByEmail(email);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getStudentByIdAndEmail(studentId: number, email: string): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getStudentByIdAndEmail(studentId, email);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
  }

  async getAdminById(adminId: number): Promise<Result<UserData>> {
    const admin: UserData | undefined = await userRepository.getAdminById(adminId);

    if (!admin) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Admin not found");
    }

    return Result.succeed(admin, "Admin retrieve success");
  }

  async getUserCount(query: string = "", role: ENUM_USER_ROLE): Promise<Result<number>> {
    let userCount: number;

    switch (role) {
      case ENUM_USER_ROLE.ADMIN:
        userCount = await userRepository.getAdminCount(query);
        break;
      case ENUM_USER_ROLE.STUDENT:
        userCount = await userRepository.getStudentCount(query);
        break;
      default:
        return Result.succeed(0, "Failed to get user count");
    }

    return Result.succeed(userCount ? userCount : 0, "User count retrieve success");
  }

  async isUserExist(userId: number): Promise<boolean> {
    const isUserExist: boolean = await userRepository.isUserExist(userId);

    if (!isUserExist) {
      return false;
    }

    return true;
  }

  async createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number): Promise<Result<ResultSetHeader>> {
    const hashedPassword: string = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const createUserResponse: ResultSetHeader = await userRepository.createUser(firstName, lastName, email, phoneNumber, hashedPassword, userStatus);

    const response: ResultSetHeader = await userRepository.createStudent(createUserResponse.insertId);

    return Result.succeed(response, "Student create success");
  }

  async updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number): Promise<Result<UserData | undefined>> {
    const student: UserData | undefined = await userRepository.getStudentById(studentId);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentId");
    }

    await userRepository.updateUserById(studentId, firstName, lastName, phoneNumber, email, userStatus);

    const studentResponse: UserData | undefined = await userRepository.getStudentById(studentId);

    return Result.succeed(studentResponse, "Student update success");
  }

  async updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>> {
    const adminResponse: UserData | undefined = await userRepository.getAdminById(adminId);

    if (!adminResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid adminId");
    }

    await userRepository.updateUserById(adminId, firstName, lastName, phoneNumber, email, 1);

    const admin: UserData | undefined = await userRepository.getAdminById(adminId);

    if (!admin) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Admin updated not found");
    }

    return Result.succeed(admin, "Admin update success");
  }

  async deleteUserById(userId: number): Promise<Result<null>> {
    await userRepository.deleteUserById(userId);

    return Result.succeed(null, "User delete success");
  }

  async updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<Result<UserData | undefined>> {
    await userRepository.updateUserProfilePictureById(userId, profilePictureUrl);

    const userResponse: UserData | undefined = await userRepository.getUserById(userId);

    return Result.succeed(userResponse, "User update success");
  }

  async getStudentCourseProgrammeIntakeByStudentId(studentId: number, status: number): Promise<Result<StudentCourseProgrammeIntakeData[]>> {
    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData[] | undefined = await userRepository.getStudentCourseProgrammeIntakeByStudentId(studentId, status);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // TODO: Checkup with skyfoojs whether or not this is unused API.
  // async getStudentCourseProgrammeIntakes(query: string = "", pageSize: number, page: number): Promise<Result<StudentCourseProgrammeIntakeData[]>> {
  //   const studentCourseProgrammeIntakes: StudentCourseProgrammeIntakeData[] = await userRepository.getStudentCourseProgrammeIntakes(query, pageSize, page);

  //   if (!studentCourseProgrammeIntakes.length) {
  //     return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
  //   }

  //   return Result.succeed(studentCourseProgrammeIntakes, "Students course programme intakes retrieve success");
  // }  

  async getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData>> {
    const studentCourseProgrammeIntake: StudentCourseProgrammeIntakeData | undefined = await userRepository.getStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrameIntakeId(studentId, courseId, programmeIntakeId);

    if (!studentCourseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake not found");
    }

    return Result.succeed(studentCourseProgrammeIntake, "Students course programme intakes retrieve success");
  }

  // Enroll the student into a course, and specify a programme intake.
  async createStudentCourseProgrammeIntake(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<StudentCourseProgrammeIntakeData[]>> {
    await userRepository.updateStudentCourseProgrammeIntakeStatusByStudentIdAndStatus(studentId, ENUM_PROGRAMME_STATUS.COMPLETED);

    await userRepository.createStudentCourseProgrammeIntake(studentId, courseId, programmeIntakeId);

    const studentCrouseProgrammeIntake: StudentCourseProgrammeIntakeData[] | undefined = await userRepository.getStudentCourseProgrammeIntakeByStudentId(studentId, 0);

    if (!studentCrouseProgrammeIntake) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student course programme intake created not found");
    }

    return Result.succeed(studentCrouseProgrammeIntake, "Student course programme intake create success");
  }

  async deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId: number, courseId: number, programmeIntakeId: number): Promise<Result<null>> {
    await userRepository.deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeId(studentId, courseId, programmeIntakeId);

    return Result.succeed(null, "Student course programme intake delete success");
  }

  async getStudentInformationById(studentId: number): Promise<Result<StudentInformation>> {
    const studentInformation: StudentInformation | undefined = await userRepository.getStudentInformationById(studentId);

    if (!studentInformation) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student information not found");
    }

    return Result.succeed(studentInformation, "Student information retrieve success");
  }

  async getStudentTimetableById(studentId: number): Promise<Result<StudentClassData[]>> {
    const studentTimetable: StudentClassData[] = await userRepository.getStudentTimetableById(studentId);
    return Result.succeed(studentTimetable, "Student timetable retrieve success");
  }

  async getStudentSemesterStartAndEndDateById(studentId: number): Promise<Result<StudentSemesterStartAndEndData | undefined>> {
    const studentSemesterStartAndEndData: StudentSemesterStartAndEndData | undefined = await userRepository.getStudentSemesterStartAndEndDateById(studentId);

    return Result.succeed(studentSemesterStartAndEndData, "Student semester start and end date retrieve success");
  }
}

export default new UserService();
