import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { CourseData } from "../models/course-model";
import CourseRepository from "../repositories/course.repository";

interface ICourseService {
  getCourses(query: string, pageSize: number, page: number): Promise<Result<CourseData[]>>;
  getCourseById(courseId: number): Promise<Result<CourseData>>;
  createCourse(courseName: string, programmeId: number): Promise<Result<null>>;
  updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>>;
  deleteCourseById(courseId: number): Promise<Result<null>>;
}

class CourseService implements ICourseService {
  async getCourses(query: string = "", pageSize: number, page: number): Promise<Result<CourseData[]>> {
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
    await CourseRepository.createCourse(courseName, programmeId);

    return Result.succeed(null, "Course create success");
  }

  async updateCourseById(courseId: number, courseName: string, programmeId: number): Promise<Result<null>> {
    await CourseRepository.updateCourseById(courseId, programmeId, courseName);

    return Result.succeed(null, "Course update success");
  }

  async deleteCourseById(courseId: number): Promise<Result<null>> {
    await CourseRepository.deleteCourseById(courseId);

    return Result.succeed(null, "Course delete success");
  }
}

export default new CourseService();
