import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData, CourseSubjectData } from "../models/course-model";
import CourseRepository from "../repositories/course.repository";

interface ICourseService {
  getAllCourses(query: string, pageSize: number, page: number): Promise<Result<CourseData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseData>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<CourseData>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseData>>;
  deleteCourseById(courseId: number): Promise<Result<null>>;
  getCourseSubjectByCourseId(courseId: number, query: string, pageSize: number, page: number): Promise<Result<CourseSubjectData[]>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
  deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<Result<null>>;
}

class CourseService implements ICourseService {
  async getAllCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseData[]>> {
    const courses: CourseData[] = await CourseRepository.getAllCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseById(courseId: number): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async createCourse(courseName: string, programmeId: number): Promise<Result<CourseData>> {
    const response: ResultSetHeader = await CourseRepository.createCourse(courseName, programmeId);

    const course: CourseData | undefined = await CourseRepository.getCourseById(response.insertId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course created not found");
    }

    return Result.succeed(course, "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseData>> {
    await CourseRepository.updateCourseById(courseId, programmeId, courseName);

    const course: CourseData | undefined = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course updated not found");
    }

    return Result.succeed(course, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
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

  async createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {
    await CourseRepository.createCourseSubject(courseId, subjectId);

    const courseSubject: CourseSubjectData | undefined = await CourseRepository.getCourseSubjectByCourseIdAndSubjectId(courseId, subjectId);

    if (!courseSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject created not found");
    }

    return Result.succeed(courseSubject, "Course subject create success");
  }

  async deleteCourseSubjectByCourseIdAndSubjectId(courseId: number, subjectId: number): Promise<Result<null>> {
    await CourseRepository.deleteCourseSubjectByCourseIdAndSubjectId(courseId, subjectId);

    return Result.succeed(null, "Course subject delete success");
  }
}

export default new CourseService();
