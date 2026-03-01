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
  createCourse(courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  updateCourseById(courseId: number, courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>>;
  deleteCourseById(courseId: number): Promise<Result<null>>;
  getCourseCount(query: string): Promise<Result<number>>;
  getCourseSubjectById(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>>;
  getCourseSubjectsBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>>;
  createCourseSubjectsBySubjectId(courseIds: number[], subjectId: number): Promise<Result<CourseSubjectData[]>>;
  getCoursesByIds(courseIds: number[]): Promise<Result<CourseData[]>>;
  deleteCourseSubjectsBySubjectId(subjectId: number): Promise<Result<null>>;
}

class CourseService implements ICourseService {
  public async getCourses(query: string, pageSize: number, page: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] = await courseRepository.getCourses(query, pageSize, page);

    return Result.succeed(courses, "Courses retrieve success");
  }

  public async getCourseById(courseId: number): Promise<Result<CourseProgrammeData>> {
    const course: CourseProgrammeData | undefined = await courseRepository.getCourseById(courseId);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  private async getCourseByCourseCode(courseCode: string): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await courseRepository.getCourseByCourseCode(courseCode);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  public async getCourseByName(courseName: string): Promise<Result<CourseData>> {
    const course: CourseData | undefined = await courseRepository.getCourseByName(courseName);

    if (!course) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(course, "Course retrieve success");
  }

  public async getCoursesByProgrammeId(programmeId: number): Promise<Result<CourseProgrammeData[]>> {
    const courses: CourseProgrammeData[] | undefined = await courseRepository.getCoursesByProgrammeId(programmeId);

    if (!courses) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course not found");
    }

    return Result.succeed(courses, "Courses retrieve success");
  }

  public async createCourse(courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {

    // Check parameters exist.
    const courseCodeResult: Result<CourseData> = await this.getCourseByCourseCode(courseCode);

    if (courseCodeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course code already exists");
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
      throw new Error("createCourse created course not found");
    }

    return Result.succeed(course.getData(), "Course create success");
  }

  public async updateCourseById(courseId: number, courseCode: string, courseName: string, programmeId: number): Promise<Result<CourseProgrammeData>> {

    // Check parameters exist.
    const courseResult: Result<CourseProgrammeData> = await this.getCourseById(courseId);

    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }

    const programmeResult: Result<ProgrammeData> = await programmeService.getProgrammeById(programmeId);
    if (!programmeResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, programmeResult.getMessage());
    }


    const currentCourseData: CourseProgrammeData = courseResult.getData();

    // Check if course code already exists or not.
    // First check if course code has changed.
    if (currentCourseData.courseCode !== courseCode) {

      // Check if the course code exists or not.
      const isCourseCodeExistResult: Result<CourseData> = await this.getCourseByCourseCode(courseCode);

      if (isCourseCodeExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course code already exists");
      }
    }


    // Check if course name already exists or not.
    // First check if the courseName has changed.
    if (currentCourseData.courseName !== courseName) {

      // Check if the new name exists or not.
      const isCourseNameExistResult: Result<CourseData> = await this.getCourseByName(courseName);

      if (isCourseNameExistResult.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Course name already exists");
      }
    }



    const updateCourseResult: ResultSetHeader = await courseRepository.updateCourseById(courseId, courseCode, courseName, programmeId);
    if (updateCourseResult.affectedRows === 0) {
      throw new Error("updateCourseById failed to update");
    }

    const course: Result<CourseProgrammeData> = await this.getCourseById(courseId);

    if (!course.isSuccess()) {
      throw new Error("updateCourseById updated course not found");
    }

    return Result.succeed(course.getData(), "Course update success");
  }

  public async deleteCourseById(courseId: number): Promise<Result<null>> {

    // Check if course exist.
    const courseResult: Result<CourseData> = await this.getCourseById(courseId);

    if (!courseResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseResult.getMessage());
    }

    const deleteCourseResult: ResultSetHeader = await courseRepository.deleteCourseById(courseId);
    if (deleteCourseResult.affectedRows === 0) {
      throw new Error("deleteCourseById failed to delete");
    }

    return Result.succeed(null, "Course delete success");
  }

  public async getCourseCount(query: string = ""): Promise<Result<number>> {
    const courseCount: number = await courseRepository.getCourseCount(query);

    return Result.succeed(courseCount ? courseCount : 0, "Course count retrieve success");
  }

  public async getCourseSubjectById(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {
    const courseSubject: CourseSubjectData | undefined = await courseRepository.getCourseSubjectById(courseId, subjectId);

    if (!courseSubject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Course subject not found");
    }

    return Result.succeed(courseSubject, "Course subject retrieve success");
  }

  public async getCourseSubjectsBySubjectId(subjectId: number): Promise<Result<CourseSubjectData[]>> {

    // Check param exist
    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }

    const courseSubjects: CourseSubjectData[] = await courseRepository.getCourseSubjectsBySubjectId(subjectId);

    return Result.succeed(courseSubjects, "Course subjects retrieve success");
  }


   public async createCourseSubject(courseId: number, subjectId: number): Promise<Result<CourseSubjectData>> {

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
    const createCourseSubjectResult: ResultSetHeader = await courseRepository.createCourseSubject(courseId, subjectId);

    if (createCourseSubjectResult.affectedRows === 0) {
      throw new Error("createCourseSubject failed to insert");
    }


    const courseSubject: Result<CourseSubjectData> = await this.getCourseSubjectById(courseId, subjectId);

    if (!courseSubjectResult.isSuccess()) {
      throw new Error("createCourseSubject created course subject not found");
    }

    return Result.succeed(courseSubject.getData(), "Course subject create success");
  }

  /** This is used by subject.service createSubject.
   * Creates multiple course subject from different courseIds, but one subjectId
   */
  public async createCourseSubjectsBySubjectId(courseIds: number[], subjectId: number): Promise<Result<CourseSubjectData[]>> {

    // Check params exist.
    // Never checked for duplicate courseIds because getCoursesById already does it.
    const courseIdsResult: Result<CourseData[]> = await this.getCoursesByIds(courseIds);
    if (!courseIdsResult.isSuccess()) {
      switch (courseIdsResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseIdsResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, courseIdsResult.getMessage());
      }
    }

    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);
    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }


    const courseSubjectsResult: Result<CourseSubjectData[]> = await this.getCourseSubjectsBySubjectId(subjectId);
    if (!courseSubjectsResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseSubjectsResult.getMessage());
    }

    const courseSubjectsData: CourseSubjectData[] = courseSubjectsResult.getData();
    if (courseSubjectsData.length > 0) {
      for (const courseId of courseIds) {
        for (const courseSubjectData of courseSubjectsData) {
          if (courseId === courseSubjectData.courseId) {
            return Result.fail(ENUM_ERROR_CODE.CONFLICT, `courseId {${courseId}} and subjectId {${subjectId}} is already an existing courseSubject`);
          }
        }
      }
    }

    const insertCourseSubjectIds: number[][] = [];
    for (const courseId of courseIds) {
      insertCourseSubjectIds.push([courseId, subjectId]);
    }

    const createCourseSubjectsBySubjectIdResult: ResultSetHeader = await courseRepository.createCourseSubjects(insertCourseSubjectIds);
    if (createCourseSubjectsBySubjectIdResult.affectedRows === 0) {
      throw new Error("createCourseSubjectsBySubjectId failed to insert");
    }

    const courseSubjects: Result<CourseSubjectData[]> = await this.getCourseSubjectsBySubjectId(subjectId);
    if (!courseSubjects.isSuccess()) {
      throw new Error("createCourseSubjectsBySubjectId created course subjects not found");
    }

    return Result.succeed(courseSubjects.getData(), "Course subjects create success");
  }

  public async getCoursesByIds(courseIds: number[]): Promise<Result<CourseData[]>> {
    const duplicateCourseIds: { [courseId: number]: boolean } = {};
    for (const courseId of courseIds) {
      if (duplicateCourseIds[courseId]) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, `Duplicate courseId found: ${courseId}`)
      }
      duplicateCourseIds[courseId] = true;
    }


    const courses: CourseData[] = await courseRepository.getCoursesByIds(courseIds);

    if (courses.length === 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `courseIds not found: [${courseIds.join(", ")}]`);
    }

    const foundIds = new Set(
      courses.map(c => c.courseId)
    );

    const missingIds = courseIds.filter(
      id => !foundIds.has(id)
    );

    if (missingIds.length > 0) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, `courseIds not found: [${missingIds.join(", ")}]`);
    }

    return Result.succeed(courses, "courses retrieve success");
  }

  public async deleteCourseSubjectsBySubjectId(subjectId: number): Promise<Result<null>> {

    // Check if course exist.
    const subjectResult: Result<SubjectData> = await subjectService.getSubjectById(subjectId);

    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }

    const deleteCourseResult: ResultSetHeader = await courseRepository.deleteCourseSubjectsBySubjectId(subjectId);
    if (deleteCourseResult.affectedRows === 0) {
      throw new Error("deleteCourseById failed to delete");
    }

    return Result.succeed(null, "Course delete success");
  }
}

export default new CourseService();
