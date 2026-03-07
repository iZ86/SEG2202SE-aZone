import { ResultSetHeader } from "mysql2";
import { Result } from "../../libs/Result";
import { ENUM_ERROR_CODE } from "../enums/enums";
import { SubjectData, StudentSubjectData, StudentSubjectOverviewData, SubjectWithCourseSubjectData, StudentSubjectWithCountData, SubjectWithCountData } from "../models/subject-model";
import subjectRepository from "../repositories/subject.repository";
import { CourseData, CourseSubjectData } from "../models/course-model";
import courseService from "./course.service";

interface ISubjectService {
  getSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectWithCountData>>;
  getSubjectById(subjectId: number): Promise<Result<SubjectData>>;
  getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<Result<SubjectData>>;
  createSubject(subjectName: string, subjectCode: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<SubjectWithCourseSubjectData>>;
  updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<SubjectWithCourseSubjectData>>;
  deleteSubjectById(subjectId: number): Promise<Result<null>>;
  getSubjectCount(query: string): Promise<Result<number>>;
  getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<Result<StudentSubjectWithCountData>>;
  getActiveSubjectsOverviewByStudentId(studentId: number): Promise<Result<StudentSubjectOverviewData[]>>;
}

class SubjectService implements ISubjectService {
  async getSubjects(query: string, pageSize: number, page: number): Promise<Result<SubjectWithCountData>> {
    const subjects: SubjectData[] = await subjectRepository.getSubjects(query, pageSize, page);

    const subjectCount: Result<number> = await this.getSubjectCount(query);
    return Result.succeed({subjects, subjectCount: subjectCount.getData()}, "Subjects retrieve success");
  }

  async getSubjectById(subjectId: number): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectById(subjectId);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async getSubjectBySubjectCode(subjectCode: string): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectBySubjectCode(subjectCode);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async getSubjectByIdAndSubjectCode(subjectId: number, subjectCode: string): Promise<Result<SubjectData>> {
    const subject: SubjectData | undefined = await subjectRepository.getSubjectByIdAndSubjectCode(subjectId, subjectCode);

    if (!subject) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, "Subject not found");
    }

    return Result.succeed(subject, "Subject retrieve success");
  }

  async createSubject(subjectName: string, subjectCode: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<SubjectWithCourseSubjectData>> {


    // Check exist or not subject code.
    const isSubjectCodeDuplicated: Result<SubjectData> = await this.getSubjectBySubjectCode(subjectCode);

    if (isSubjectCodeDuplicated.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Subject code already exists");
    }

    // Check courseIds already exist or not.
    const courseIdsResult: Result<CourseData[]> = await courseService.getCoursesByIds(courseIds);
    if (!courseIdsResult.isSuccess()) {
      switch (courseIdsResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseIdsResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, courseIdsResult.getMessage());
      }
    }

    const createSubjectResult: ResultSetHeader = await subjectRepository.createSubject(subjectCode, subjectName, description, creditHours);
    if (createSubjectResult.affectedRows === 0) {
      throw new Error("createSubject failed to insert");
    }

    const subject: Result<SubjectData> = await this.getSubjectById(createSubjectResult.insertId);
    if (!subject.isSuccess()) {
      throw new Error("createSubject created subject not found");
    }


    const createCourseSubjectResult: Result<CourseSubjectData[]> = await courseService.createCourseSubjectsBySubjectId(courseIds, createSubjectResult.insertId);
    if (!createCourseSubjectResult.isSuccess()) {
      switch (createCourseSubjectResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, createCourseSubjectResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, createCourseSubjectResult.getMessage());
      }
    }

    return Result.succeed({ ...subject.getData(), courseSubjects: createCourseSubjectResult.getData() }, "Subject create success");
  }

  async updateSubjectById(subjectId: number, subjectCode: string, subjectName: string, description: string, creditHours: number, courseIds: number[]): Promise<Result<SubjectWithCourseSubjectData>> {

    // Check param exists or not
    const subjectResult: Result<SubjectData> = await this.getSubjectById(subjectId);

    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }



    // Check exist or not subject code.
    const subjectData: SubjectData = subjectResult.getData();
    if (subjectCode !== subjectData.subjectCode) {
      const isSubjectCodeDuplicated: Result<SubjectData> = await this.getSubjectBySubjectCode(subjectCode);

      if (isSubjectCodeDuplicated.isSuccess()) {
        return Result.fail(ENUM_ERROR_CODE.CONFLICT, "Subject code already exists");
      }
    }

    // Check courseIds already exist or not.
    const courseIdsResult: Result<CourseData[]> = await courseService.getCoursesByIds(courseIds);
    if (!courseIdsResult.isSuccess()) {
      switch (courseIdsResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, courseIdsResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, courseIdsResult.getMessage());
      }
    }


    const updateSubjectByIdResult: ResultSetHeader = await subjectRepository.updateSubjectById(subjectId, subjectCode, subjectName, description, creditHours);
    if (updateSubjectByIdResult.affectedRows === 0) {
      throw new Error("updateSubjectById failed to update");
    }

    const subject: Result<SubjectData> = await this.getSubjectById(subjectId);
    if (!subject.isSuccess()) {
      throw new Error("updateSubjectById updated subject not found");
    }

    const deleteCourseSubjectsBySubjectIdResult: Result<null> = await courseService.deleteCourseSubjectsBySubjectId(subjectId);
    if (!deleteCourseSubjectsBySubjectIdResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, deleteCourseSubjectsBySubjectIdResult.getMessage());
    }

    const createCourseSubjectResult: Result<CourseSubjectData[]> = await courseService.createCourseSubjectsBySubjectId(courseIds, subjectId);
    if (!createCourseSubjectResult.isSuccess()) {
      switch (createCourseSubjectResult.getErrorCode()) {
        case ENUM_ERROR_CODE.ENTITY_NOT_FOUND:
          return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, createCourseSubjectResult.getMessage());
        case ENUM_ERROR_CODE.CONFLICT:
          return Result.fail(ENUM_ERROR_CODE.CONFLICT, createCourseSubjectResult.getMessage());
      }
    }
    return Result.succeed({ ...subject.getData(), courseSubjects: createCourseSubjectResult.getData() }, "Subject update success");
  }

  async deleteSubjectById(subjectId: number): Promise<Result<null>> {
    // Check param exists or not
    const subjectResult: Result<SubjectData> = await this.getSubjectById(subjectId);

    if (!subjectResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, subjectResult.getMessage());
    }

    const deleteCourseSubjectsBySubjectIdResult: Result<null> = await courseService.deleteCourseSubjectsBySubjectId(subjectId);
    if (!deleteCourseSubjectsBySubjectIdResult.isSuccess()) {
      return Result.fail(ENUM_ERROR_CODE.ENTITY_NOT_FOUND, deleteCourseSubjectsBySubjectIdResult.getMessage());
    }

    const deleteSubjectResult: ResultSetHeader = await subjectRepository.deleteSubjectById(subjectId);
    if (deleteSubjectResult.affectedRows === 0) {
      throw new Error("deleteSubjectById failed to delete");
    }

    return Result.succeed(null, "Subject delete success");
  }

  async getSubjectCount(query: string = ""): Promise<Result<number>> {
    const subjectCount: number = await subjectRepository.getSubjectCount(query);

    return Result.succeed(subjectCount, "Subject count retrieve success");
  }

  async getSubjectsByStudentId(studentId: number, semester: number, query: string, pageSize: number, page: number): Promise<Result<StudentSubjectWithCountData>> {
    const subjects: StudentSubjectData[] = await subjectRepository.getSubjectsByStudentId(studentId, semester, query, pageSize, page);

    const subjectCount: Result<number> = await this.getSubjectCount(query);

    return Result.succeed({subjects, subjectCount: subjectCount.getData()}, "Student subjects retrieve success");
  }


  async getActiveSubjectsOverviewByStudentId(studentId: number): Promise<Result<StudentSubjectOverviewData[]>> {
    const studentActiveSubjects: StudentSubjectOverviewData[] = await subjectRepository.getActiveSubjectsOverviewByStudentId(studentId);
    return Result.succeed(studentActiveSubjects, "Student active subjects retrieve success");
  }
}

export default new SubjectService();
