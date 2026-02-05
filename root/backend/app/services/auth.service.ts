import argon2 from "argon2";
import { Result } from "../../libs/Result";
import { BasicAdminLoginData, BasicStudentLoginData } from "../models/auth-model";
import { ENUM_ERROR_CODE } from "../enums/enums";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/auth.repository";
import userRepository from "../repositories/user.repository";
import { UserData } from "../models/user-model";
import userService from "./user.service";
import { ResultSetHeader } from "mysql2";

interface IAuthService {
  loginStudent(studentId: number, password: string): Promise<Result<{ token: string; }>>;
  loginAdmin(userId: number, password: string): Promise<Result<{ token: string; }>>;
  getStudentMe(studentId: number): Promise<Result<UserData>>;
  getAdminMe(adminId: number): Promise<Result<UserData>>;
  updateMe(userId: number, phoneNumber: string, email: string): Promise<Result<UserData>>;
}

class AuthService implements IAuthService {
  async loginStudent(studentId: number, password: string): Promise<Result<{ token: string; }>> {
    const basicStudentLoginData: BasicStudentLoginData | undefined = await authRepository.getBasicStudentLoginData(studentId);

    // Return fail if studentId invalid
    if (!basicStudentLoginData) {
      return Result.fail(ENUM_ERROR_CODE.INVALID_CREDS, "Invalid credentials");
    }

    const hashedPassword: string = basicStudentLoginData.password;

    // Return fail if password doesn't match
    if (!await argon2.verify(hashedPassword, password)) {
      return Result.fail(ENUM_ERROR_CODE.INVALID_CREDS, "Invalid credentials");
    }

    // Sign Jwt token
    const token: string = jwt.sign(
      {
        userId: basicStudentLoginData.studentId,
      },
      "secret_key",
      {
        expiresIn: "30d"
      }
    );

    return Result.succeed({ token: token }, "Login success");
  }

  async loginAdmin(userId: number, password: string): Promise<Result<{ token: string; }>> {
    const basicAdminLoginData: BasicAdminLoginData | undefined = await authRepository.getBasicAdminLoginData(userId);

    // Return fail if studentId invalid
    if (!basicAdminLoginData) {
      return Result.fail(ENUM_ERROR_CODE.INVALID_CREDS, "Invalid credentials");
    }

    const hashedPassword: string = basicAdminLoginData.password;

    // Return fail if password doesn't match
    if (!await argon2.verify(hashedPassword, password)) {
      return Result.fail(ENUM_ERROR_CODE.INVALID_CREDS, "Invalid credentials");
    }

    // Sign Jwt token
    const token: string = jwt.sign(
      {
        userId: basicAdminLoginData.userId,
      },
      "secret_key",
      {
        expiresIn: "30d"
      }
    );

    return Result.succeed({ token: token }, "Login success");
  }

  /** Gets student personal information. */
  async getStudentMe(studentId: number): Promise<Result<UserData>> {
    let studentData: UserData | undefined = await userRepository.getStudentById(studentId);
    if (!studentData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to get user");
    }

    return Result.succeed(studentData, "Get me success");

  }

  /** Gets admin personal information. */
  async getAdminMe(adminId: number): Promise<Result<UserData>> {
    let adminData: UserData | undefined = await userRepository.getAdminById(adminId);
    if (!adminData) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to get user");
    }

    return Result.succeed(adminData, "Get me success");
  }

  /** Did not separate this to two different methods for student and admin because it takes all userId. */
  async updateMe(userId: number, phoneNumber: string, email: string): Promise<Result<UserData>> {
    const userResult: Result<UserData> = await userService.getUserById(userId);

    if (!userResult) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid userId");
    }

    const currentUserData: UserData = userResult.getData();

    if (currentUserData.email !== email) {
      const isEmailExistResult: Result<UserData> = await userService.getUserByEmail(email);

      if (isEmailExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Email already exist");
      }
    }

    const updateUserResult: ResultSetHeader = await authRepository.updateMe(userId, phoneNumber, email);

    if (updateUserResult.affectedRows === 0) {
      throw new Error("updateMe failed to update");
    }

    const user: Result<UserData> = await userService.getUserById(userId);

    if (!user.isSuccess()) {
      throw new Error("updateMe user updated not found");
    }

    return Result.succeed(user.getData(), "Update me success");
  }
}

export default new AuthService();
