/**
 * Repositories folder will be used for databse interaction with queries
 * This is an example for User Repository fetching all the users with search query
 */
import databaseConn from "../database/db-connection";
import { Users } from "../models/user-model";

interface IUserRepostory {
  getUsers(query: string): Promise<Users[]>;
}

class UserRepository implements IUserRepostory {
  getUsers(query: string): Promise<Users[]> {
    return new Promise((resolve, reject) => {
      databaseConn.query<Users[]>(
        "SELECT * " +
        "FROM USER " +
        "WHERE firstName LIKE ? " +
        "OR lastName LIKE ? " +
        "OR email LIKE ?;",
        [
          "%" + query + "%",
          "%" + query + "%",
          "%" + query + "%",
        ],
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    });
  }
}

export default new UserRepository();
