import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData, CourseProgrammeData, CourseSubjectData } from "../models/course-model";
import CourseRepository from "../repositories/course.repository";

interface ICourseService {
  getAllCourses(query: string, pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseProgrammeData>>;
  getCourseByName(courseName: string): Promise<Result<CourseData>>;
  getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  getCourseCount(query: string): Promise<Result<number>>;
  getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseData[]>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
}

class CourseService implements ICourseService {
  async getAllCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] = await CourseRepository.getAllCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseById(courseId: number): Promise<Result<CourseProgrammeData>> {
    const course: CourseProgrammeData | undefined = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async getCourseByName(courseName: string): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await CourseRepository.getCourseByName(courseName);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] | undefined = await CourseRepository.getCoursesByProgrammeId(programmeId);

    if (!courses) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(courses, "Courses retrieve success");
  }

  async createCourse(courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {
    const response: ResultSetHeader = await CourseRepository.createCourse(courseName, programmeId);

    const course: CourseProgrammeData | undefined = await CourseRepository.getCourseById(response.insertId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course created not found");
    }

    return Result.succeed(course, "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {
    await CourseRepository.updateCourseById(courseId, programmeId, courseName);

    const course: CourseProgrammeData | undefined = await CourseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course updated not found");
    }

    return Result.succeed(course, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
    await CourseRepository.deleteCourseById(courseId);

    return Result.succeed(null, "Course delete success");
  }

  async getCourseCount(query: string = ""): Promise<Result<number>> {
    const courseCount: number = await CourseRepository.getCourseCount(query);

    return Result.succeed(courseCount ? courseCount : 0, "Course count retrieve success");
  }

  async getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseData[]>> {
    const courseSubject: CourseData[] = await CourseRepository.getCourseSubjectBySubjectId(subjectId);

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
}

export default new CourseService();
