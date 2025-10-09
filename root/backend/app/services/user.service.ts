import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";

interface IUserService {
  getAllUsers(): Promise<Result<any[]>>;
}

class UserService implements IUserService {
  async getAllUsers(): Promise<Result<any[]>> {
    try {
      return Result.succeed([
        {
          userId: 1,
          firstName: "first name",
          lastName: "last name",
          phoneNumber: "phone number",
          email: "email",
          password: "123",
        }
      ], "Successfully get all users");
    } catch (error) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Data not found");
    }
  }
}

export default new UserService();