import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { EnrollmentData, EnrollmentProgrammeIntakeData } from "../models/enrollment-model";
import enrollmentRepository from "../repositories/enrollment.repository";

interface IEnrollmentService {
  getAllEnrollments(query: string, pageSize: number, page: number): Promise<Result<EnrollmentData[]>>;
  getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>>;
  createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>>;
  deleteEnrollmentById(enrollmentId: number): Promise<Result<null>>;
  getEnrollmentCount(query: string): Promise<Result<number>>;
  getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<EnrollmentProgrammeIntakeData[]>>;
  createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<Result<EnrollmentProgrammeIntakeData>>;
  deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<Result<null>>;
}

class EnrollmentService implements IEnrollmentService {
  async getAllEnrollments(query: string = "", pageSize: number, page: number): Promise<Result<EnrollmentData[]>> {
    const enrollments: EnrollmentData[] = await enrollmentRepository.getAllEnrollments(query, pageSize, page);

    return Result.succeed(enrollments, "Enrollments retrieve success");
  }

  async getEnrollmentById(enrollmentId: number): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  async createEnrollment(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const response = await enrollmentRepository.createEnrollment(enrollmentStartDateTime, enrollmentEndDateTime);

    const enrollmentResponse: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(response.insertId);

    if (!enrollmentResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment created not found");
    }

    return Result.succeed(enrollmentResponse, "Enrollment create success");
  }

  async updateEnrollmentById(enrollmentId: number, enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    await enrollmentRepository.updateEnrollmentById(enrollmentId, enrollmentStartDateTime, enrollmentEndDateTime);

    const enrollmentResponse: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentById(enrollmentId);

    if (!enrollmentResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment updated not found");
    }

    return Result.succeed(enrollmentResponse, "Enrollment update success");
  }

  async deleteEnrollmentById(enrollmentId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentById(enrollmentId);

    return Result.succeed(null, "Enrollment delete success");
  }

  async getEnrollmentCount(query: string = ""): Promise<Result<number>> {
    const enrollmentCount: number = await enrollmentRepository.getEnrollmentCount(query);

    return Result.succeed(enrollmentCount ? enrollmentCount : 0, "Enrollment count retrieve success");
  }

  async getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId: number): Promise<Result<EnrollmentProgrammeIntakeData[]>> {
    const enrollmentProgrammeIntakes: EnrollmentProgrammeIntakeData[] = await enrollmentRepository.getEnrollmentProgrammeIntakesByEnrollmentId(enrollmentId);

    if (!enrollmentProgrammeIntakes) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment programme intake not found");
    }

    return Result.succeed(enrollmentProgrammeIntakes, "Enrollment programme intake retrieve success");
  }

  async getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime: Date, enrollmentEndDateTime: Date): Promise<Result<EnrollmentData>> {
    const enrollment: EnrollmentData | undefined = await enrollmentRepository.getEnrollmentByEnrollmentStartDateTimeAndEnrollmentEndDateTime(enrollmentStartDateTime, enrollmentEndDateTime);

    if (!enrollment) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment not found");
    }

    return Result.succeed(enrollment, "Enrollment retrieve success");
  }

  async createEnrollmentProgrammeIntake(enrollmentId: number, programmeIntakeId: number): Promise<Result<EnrollmentProgrammeIntakeData>> {
    await enrollmentRepository.createEnrollmentProgrammeIntake(enrollmentId, programmeIntakeId);

    const enrollmentProgrammeIntakeResponse: EnrollmentProgrammeIntakeData | undefined = await enrollmentRepository.getEnrollmentProgrammeIntakeByEnrollmentIdAndProgrammeIntakeId(enrollmentId, programmeIntakeId);

    if (!enrollmentProgrammeIntakeResponse) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Enrollment programme intake created not found");
    }

    return Result.succeed(enrollmentProgrammeIntakeResponse, "Enrollment programme intake create success");
  }

  async deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId: number): Promise<Result<null>> {
    await enrollmentRepository.deleteEnrollmentProgrammeIntakeByEnrollmentId(enrollmentId);

    return Result.succeed(null, "Enrollment programme intake delete success");
  }
}

export default new EnrollmentService();
