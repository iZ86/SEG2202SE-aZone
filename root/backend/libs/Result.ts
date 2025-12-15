/** This class follows the result pattern used in web development.
 * It's always used to return data from the service layer to the controller layer.
 */
export class Result<T> {

  protected constructor(
    readonly success: boolean,
    readonly data: T,
    readonly errorCode: string | null,
    readonly message: string
  ) { }

  static succeed<T>(data: T, message: string): Success<T> {
    return new Result(true, data, null, message) as Success<T>;
  }


  // ---- FAIL OVERLOADS ----
  static fail(errorCode: string, message: string): Failure;
  static fail<T>(errorCode: string, message: string, data: T): Result<T>;

  static fail<T>(
    errorCode: string,
    message: string,
    data?: T,
  ): Result<T | never> {
    if (data) {
      return new Result(false, data, errorCode, message);
    }
    return new Result(false, null, errorCode, message) as Failure;
  }

  isSuccess(): boolean {
    return this.success;
  }

  getData(): T {
    return this.data;
  }

  getErrorCode(): String | null {
    return this.errorCode;
  }

  getMessage(): string {
    return this.message;
  }

}

export type Success<T> = Result<T>;
export type Failure = Result<never>;
