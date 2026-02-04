import argon2 from "argon2";
import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import { StudentCourseProgrammeIntakeData, UserData, StudentInformation, StudentSemesterStartAndEndData, StudentClassData } from "../models/user-model";
import userRepository from "../repositories/user.repository";

interface IUserService {
  getAdmins(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getStudents(query: string, pageSize: number, page: number): Promise<Result<UserData[]>>;
  getUserById(userId: number): Promise<Result<UserData>>;
  getUserByEmail(email: string): Promise<Result<UserData>>;
  getUserByIdAndEmail(userId: number, email: string): Promise<Result<UserData>>;
  getAdminById(adminId: number): Promise<Result<UserData>>;
  getStudentById(studentId: number): Promise<Result<UserData>>;
  getStudentByEmail(email: string): Promise<Result<UserData>>;
  getStudentByIdAndEmail(studentId: number, email: string): Promise<Result<UserData>>;
  createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number): Promise<Result<UserData>>;
  updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number): Promise<Result<UserData>>;
  updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>>;
  updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<Result<UserData>>;
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

  async getUserById(userId: number): Promise<Result<UserData>> {
    const student: UserData | undefined = await userRepository.getUserById(userId);

    if (!student) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Student not found");
    }

    return Result.succeed(student, "Student retrieve success");
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

  async createStudent(firstName: string, lastName: string, email: string, phoneNumber: string, password: string, userStatus: number): Promise<Result<UserData>> {
    const isEmailExistResult: Result<UserData> = await this.getStudentByEmail(email);

    if (isEmailExistResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Email already exist");
    }

    const hashedPassword: string = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const createUserResult: ResultSetHeader = await userRepository.createUser(firstName, lastName, email, phoneNumber, hashedPassword, userStatus);

    const createStudentResult: ResultSetHeader = await userRepository.createStudent(createUserResult.insertId);

    if (createStudentResult.affectedRows === 0) {
      throw new Error("createStudent failed to insert");
    }

    const student: Result<UserData> = await this.getStudentById(createStudentResult.insertId);

    if (!student.isSuccess()) {
      throw new Error("createStudent student created not found");
    }

    return Result.succeed(student.getData(), "Student create success");
  }

  async updateStudentById(studentId: number, firstName: string, lastName: string, email: string, phoneNumber: string, userStatus: number): Promise<Result<UserData>> {
    const studentResult: Result<UserData> = await this.getStudentById(studentId);

    if (!studentResult) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid studentId");
    }

    const currentUserData: UserData = studentResult.getData();

    /**
     * Check if the user is using the email before updating
     * If user is using the old email, doesn't needs to check if the email is duplicated
     */
    if (currentUserData.email !== email) {
      const isEmailExistResult: Result<UserData> = await this.getStudentByEmail(email);

      if (isEmailExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Email already exist");
      }
    }

    const updateStudentResult: ResultSetHeader = await userRepository.updateUserById(studentId, firstName, lastName, phoneNumber, email, userStatus);

    if (updateStudentResult.affectedRows === 0) {
      throw new Error("updateStudentById failed to update");
    }

    const student: Result<UserData> = await this.getStudentById(studentId);

    if (!student.isSuccess()) {
      throw new Error("updateStudentById student updated not found");
    }

    return Result.succeed(student.getData(), "Student update success");
  }

  async updateAdminById(adminId: number, firstName: string, lastName: string, email: string, phoneNumber: string): Promise<Result<UserData>> {
    const adminResult: Result<UserData> = await this.getAdminById(adminId);

    if (!adminResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid adminId");
    }

    const updateAdminResult: ResultSetHeader = await userRepository.updateUserById(adminId, firstName, lastName, phoneNumber, email, 1);

    if (updateAdminResult.affectedRows === 0) {
      throw new Error("updateAdminById failed to update");
    }

    const admin: Result<UserData> = await this.getAdminById(adminId);

    if (!admin.isSuccess()) {
      throw new Error("updateAdminById admin updated not found");
    }

    return Result.succeed(admin.getData(), "Admin update success");
  }

  async updateUserProfilePictureById(userId: number, profilePictureUrl: string): Promise<Result<UserData>> {
    const userResult: Result<UserData> = await this.getUserById(userId);

    if (!userResult) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid userId");
    }

    const updateUserProfilePictureResult: ResultSetHeader = await userRepository.updateUserProfilePictureById(userId, profilePictureUrl);

    if (updateUserProfilePictureResult.affectedRows === 0) {
      throw new Error("updateUserProfilePictureById failed to update");
    }

    const user: Result<UserData> = await this.getUserById(userId);

    if (!user.isSuccess()) {
      throw new Error("updateUserProfilePictureById user updated not found");
    }

    return Result.succeed(user.getData(), "User update success");
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
