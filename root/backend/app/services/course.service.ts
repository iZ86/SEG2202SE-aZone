import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData, CourseProgrammeData, CourseSubjectData } from "../models/course-model";
import courseRepository from "../repositories/course.repository";
import programmeService from "./programme.service";
import { ProgrammeData } from "../models/programme-model";

interface ICourseService {
  getCourses(query: string, pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseProgrammeData>>;
  getCourseByName(courseName: string): Promise<Result<CourseData>>;
  getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>>;
  getCourseByIdAndCourseName(courseId: number, courseName: string): Promise<Result<CourseProgrammeData>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  getCourseCount(query: string): Promise<Result<number>>;
  getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean>;
}

class CourseService implements ICourseService {
  async getCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] = await courseRepository.getCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseById(courseId: number): Promise<Result<CourseProgrammeData>> {
    const course: CourseProgrammeData | undefined = await courseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async getCourseByName(courseName: string): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await courseRepository.getCourseByName(courseName);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] | undefined = await courseRepository.getCoursesByProgrammeId(programmeId);

    if (!courses) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(courses, "Courses retrieve success");
  }

  async getCourseByIdAndCourseName(courseId: number, courseName: string): Promise<Result<CourseProgrammeData>> {
    const course: CourseProgrammeData | undefined = await courseRepository.getCourseByIdAndCourseName(courseId, courseName);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  async createCourse(courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {

    // Check parameters exist.
    const courseResult: Result<CourseData> = await this.getCourseByName(courseName);

    if (courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course name duplicated");
    }

    const programmeResult: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }


    // Create new course.
    const createCourseResult: ResultSetHeader = await courseRepository.createCourse(courseName, programmeId);
    if (createCourseResult.affectedRows === 0) {
      throw new Error("createCourse failed to insert");
    }

    const course: Result<CourseProgrammeData> = await this.getCourseById(createCourseResult.insertId);
    if (!course.isSuccess()) {
      throw new Error("createCourse course created not found");
    }

    return Result.succeed(course.getData(), "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {
    await courseRepository.updateCourseById(courseId, programmeId, courseName);

    const course: CourseProgrammeData | undefined = await courseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course updated not found");
    }

    return Result.succeed(course, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
    await courseRepository.deleteCourseById(courseId);

    return Result.succeed(null, "Course delete success");
  }

  async getCourseCount(query: string = ""): Promise<Result<number>> {
    const courseCount: number = await courseRepository.getCourseCount(query);

    return Result.succeed(courseCount ? courseCount : 0, "Course count retrieve success");
  }

  async getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>> {
    const courseSubject: CourseSubjectData[] = await courseRepository.getCourseSubjectBySubjectId(subjectId);

    if (!courseSubject.length) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    return Result.succeed(courseSubject, "Course subject retrieve success");
  }

  async isCourseSubjectExist(courseId: number, subjectId: number): Promise<boolean> {
    const isCourseSubjectExist: boolean = await courseRepository.isCourseSubjectExist(courseId, subjectId);

    return isCourseSubjectExist;
  }

  async createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {
    await courseRepository.createCourseSubject(courseId, subjectId);

    const courseSubject: CourseSubjectData | undefined = await courseRepository.getCourseSubjectByCourseIdAndSubjectId(courseId, subjectId);

    if (!courseSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject created not found");
    }

    return Result.succeed(courseSubject, "Course subject create success");
  }
}

export default new CourseService();
