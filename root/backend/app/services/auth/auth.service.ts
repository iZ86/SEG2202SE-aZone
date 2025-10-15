import argon2 from "argon2";
import { Result } from "../../../libs/Result";
import { BasicAdminLoginData, BasicStudentLoginData, UserData } from "../../models/auth/auth.model";
import { ENUM_ERROR_CODE, ENUM_USER_ROLE } from "../../enums/enums";
import jwt from "jsonwebtoken";
import AuthRepository from "../../repositories/auth/auth.repository";
import UserRepository from "../../repositories/user.repository";

interface IAuthService {
  loginStudent(studentId: number, password: string): Promise<Result<string>>;
  loginAdmin(userId: number, password: string): Promise<Result<string>>;
}

class AuthService implements IAuthService {
  async loginStudent(studentId: number, password: string): Promise<Result<string>> {
    const basicStudentLoginData: BasicStudentLoginData = await AuthRepository.getBasicStudentLoginData(studentId);

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

    return Result.succeed(token, "Login success");
  }

  async loginAdmin(userId: number, password: string): Promise<Result<string>> {
    const basicAdminLoginData: BasicAdminLoginData = await AuthRepository.getBasicAdminLoginData(userId);

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

    return Result.succeed(token, "Login success");
  }

  async getMe(userId: number, role: ENUM_USER_ROLE): Promise<Result<UserData>> {
    let user: UserData;
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

    return Result.succeed(user, "Get me success");
  }
}

export default new AuthService();
