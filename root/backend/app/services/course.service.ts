import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData, CourseSubjectData } from "../models/course-model";
import CourseRepository from "../repositories/course.repository";
import ProgrammeService from "./programme.service";
import SubjectService from "./subject.service";
import { ProgrammeData } from "../models/programme-model";
import { SubjectData } from "../models/subject-model";

interface ICourseService {
  getAllCourses(query: string, pageSize: number, page: number): Promise<Result<CourseData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseData>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<null>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>>;
  deleteCourseById(courseId: number): Promise<Result<null>>;
  getCourseSubjectByCourseId(courseId: number, query: string, pageSize: number, page: number): Promise<Result<CourseSubjectData[]>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<null>>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
  deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<Result<null>>;
}

class CourseService implements ICourseService {
  async getAllCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseData[]>> {
    const courses: CourseData[] = await CourseRepository.getCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseById(courseId: number): Promise<Result<CourseData>> {
    const course: CourseData = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async createCourse(courseName: string, programmeId: number): Promise<Result<null>> {
    const programmeResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);

    if (!programmeResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId");
    }

    await CourseRepository.createCourse(courseName, programmeId);

    return Result.succeed(null, "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>> {
    const programmeResponse: Result<ProgrammeData> = await ProgrammeService.getProgrammeById(programmeId);
    const courseResponse: Result<CourseData> = await this.getCourseById(courseId);

    if (!programmeResponse.isSuccess() || !courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid programmeId, or courseId");
    }

    await CourseRepository.updateCourseById(courseId, programmeId, courseName);

    return Result.succeed(null, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
    const courseResponse: Result<CourseData> = await this.getCourseById(courseId);

    if (!courseResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid courseId");
    }

    await CourseRepository.deleteCourseById(courseId);

    return Result.succeed(null, "Course delete success");
  }

  async getCourseSubjectByCourseId(courseId: number, query: string = "", pageSize: number, page: number): Promise<Result<CourseSubjectData[]>> {
    const courseSubject: CourseSubjectData[] = await CourseRepository.getCourseSubjectByCourseId(courseId, query, pageSize, page);

    if (!courseSubject.length) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    return Result.succeed(courseSubject, "Course subject retrieve success");
  }

  async isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean> {
    const isCourseSubjectExist: boolean = await CourseRepository.isCourseSubjectExist(courseId, subjectId);

    return isCourseSubjectExist;
  }

  async createCourseSubject(courseId: number, subjectId: number): Promise<Result<null>> {
    const courseIdResponse: Result<CourseData> = await this.getCourseById(courseId);

    const subjectIdResponse: Result<SubjectData> = await SubjectService.getSubjectById(subjectId);

    if (!courseIdResponse.isSuccess() || !subjectIdResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid courseId or subjectId");
    }

    const isCourseSubjectExist: boolean = await this.isCourseSubjectExist(courseId, subjectId);

    if (isCourseSubjectExist) {
      return Result.fail(ENUM_ERROR_CODE.BAD_REQUEST, "Course subject already exist");
    }

    await CourseRepository.createCourseSubject(courseId, subjectId);

    return Result.succeed(null, "Course subject create success");
  }

  async deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<Result<null>> {
    const courseIdResponse: Result<CourseData> = await this.getCourseById(courseId);

    const subjectIdResponse: Result<SubjectData> = await SubjectService.getSubjectById(subjectId);

    if (!courseIdResponse.isSuccess() || !subjectIdResponse.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Invalid courseId or subjectId");
    }

    const isCourseSubjectExist: boolean = await this.isCourseSubjectExist(courseId, subjectId);

    if (!isCourseSubjectExist) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    await CourseRepository.deleteCourseSubjectByCourseIdAndSubjectId(courseId, subjectId);

    return Result.succeed(null, "Course subject delete success");
  }
}

export default new CourseService();
