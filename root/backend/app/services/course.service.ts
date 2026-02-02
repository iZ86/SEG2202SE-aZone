import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData, CourseProgrammeData, CourseSubjectData } from "../models/course-model";
import courseRepository from "../repositories/course.repository";
import programmeService from "./programme.service";
import { ProgrammeData } from "../models/programme-model";
import subjectService from "./subject.service";
import { SubjectData } from "../models/subject-model";

interface ICourseService {
  getCourses(query: string, pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseProgrammeData>>;
  getCourseByName(courseName: string): Promise<Result<CourseData>>;
  getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>>;
  getCourseByIdAndCourseName(courseId: number, courseName: string): Promise<Result<CourseProgrammeData>>;
  createCourse(courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  getCourseCount(query: string): Promise<Result<number>>;
  getCourseSubjectById(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>>;
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

  async getCourseByCourseCode(courseCode: string): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await courseRepository.getCourseByCourseCode(courseCode);

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

  async createCourse(courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {

    // Check parameters exist.
    const courseCodeResult: Result<CourseData> = await this.getCourseByCourseCode(courseCode);

    if (!courseCodeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course code already exists");
    }

    const courseNameResult: Result<CourseData> = await this.getCourseByName(courseName);

    if (courseNameResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course name already exists");
    }

    const programmeResult: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);

    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }


    // Create new course.
    const createCourseResult: ResultSetHeader = await courseRepository.createCourse(courseCode, courseName, programmeId);
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

  async getCourseSubjectById(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {
    const courseSubject: CourseSubjectData | undefined = await courseRepository.getCourseSubjectById(courseId, subjectId);

    if (!courseSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    return Result.succeed(courseSubject, "Course subject retrieve success");
  }

  async getCourseSubjectBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>> {
    const courseSubject: CourseSubjectData[] = await courseRepository.getCourseSubjectBySubjectId(subjectId);

    if (!courseSubject.length) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    return Result.succeed(courseSubject, "Course subject retrieve success");
  }


  async createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {

    // Check parameters exist
    const courseResult: Result<CourseData> = await this.getCourseById(courseId);
    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }

    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }



    // Check if course subject exists.
    const courseSubjectResult: Result<CourseSubjectData> = await this.getCourseSubjectById(courseId, subjectId);

    if (!courseSubjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course subject already exists");
    }

    // Create new course subject.
    const createCourseSubjectResult = await courseRepository.createCourseSubject(courseId, subjectId);

    if (createCourseSubjectResult.affectedRows === 0) {
      throw new Error("createCourseSubject failed to insert");
    }


    const courseSubject: Result<CourseSubjectData> = await this.getCourseSubjectById(courseId, subjectId);

    if (!courseSubjectResult.isSuccess()) {
      throw new Error("createCourseSubject course subject created not found");
    }

    return Result.succeed(courseSubject.getData(), "Course subject create success");
  }
}

export default new CourseService();
