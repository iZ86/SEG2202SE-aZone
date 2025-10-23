import argon2 from "argon2";
import { Result } from "../../libs/Result";
import { BasicAdminLoginData, BasicStudentLoginData, UserData } from "../models/auth-model";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../enums/enums";
import jwt from "jsonwebtoken";
import AuthRepository from "../repositories/auth.repository";
import UserRepository from "../repositories/user.repository";

interface IAuthService {
  loginStudent(studentId: number, password: string): Promise<Result<{ token: string; }>>;
  loginAdmin(userId: number, password: string): Promise<Result<{ token: string; }>>;
  getMe(userId: number, role: ENUM_USER_ROLE): Promise<Result<UserData>>;
  updateMe(userId: number, phoneNumber: string, email: string): Promise<Result<UserData>>;
}

class AuthService implements IAuthService {
  async loginStudent(studentId: number, password: string): Promise<Result<{ token: string; }>> {
    const basicStudentLoginData: BasicStudentLoginData | undefined = await AuthRepository.getBasicStudentLoginData(studentId);

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
    const basicAdminLoginData: BasicAdminLoginData | undefined = await AuthRepository.getBasicAdminLoginData(userId);

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

  async getMe(userId: number, role: ENUM_USER_ROLE): Promise<Result<UserData>> {
    let user: UserData | undefined;
    switch (role) {
      case ENUM_USER_ROLE.STUDENT:
        user = await UserRepository.getStudentById(userId);
        break;

      case ENUM_USER_ROLE.ADMIN:
        user = await UserRepository.getAdminById(userId);
        break;

      default:
        return Result.fail(ENUM_ERROR_CODE.INVALID_DATA, "Invalid data");
    }

    if (!user) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to get user");
    }

    return Result.succeed(user, "Get me success");
  }

  async updateMe(userId: number, phoneNumber: string, email: string): Promise<Result<UserData>> {
    await AuthRepository.updateMe(userId, phoneNumber, email);
    const user: UserData | undefined = await UserRepository.getUserById(userId);

    if (!user) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Failed to get updated user");
    }

    return Result.succeed(user, "Update me success");
  }
}

export default new AuthService();
