import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import { getAllCoursesAPI } from "../api/courses";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { MultiValue } from "react-select";
import { MultiFilter } from "@components/MultiFilter";
import {
  createSubjectAPI,
  getSubjectByIdAPI,
  updateSubjectByIdAPI,
} from "../api/subjects";
import type { Course } from "@datatypes/courseType";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

export default function SubjectForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState<reactSelectOptionType[]>([]);

  const [emptySubjectName, setEmptySubjectName] = useState(false);
  const [emptySubjectCode, setEmptySubjectCode] = useState(false);
  const [emptyCreditHours, setEmptyCreditHours] = useState(false);
  const [emptyCourse, setEmptyCourse] = useState(false);

  const [invalidSubjectCode, setInvalidSubjectCode] = useState(false);

  const [courseOptions, setCourseOptions] = useState<reactSelectOptionType[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (
      emptyCourse ||
      emptySubjectName ||
      emptyCreditHours ||
      emptySubjectCode
    ) {
      setIsLoading(false);
      return;
    }

    if (setEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let response: Response | undefined;

    if (type === "Add") {
      response = await createSubjectAPI(
        authToken as string,
        subjectName,
        subjectCode,
        Number(creditHours),
        description,
        course.map((c) => c.value)
      );
    } else if (type === "Edit") {
      response = await updateSubjectByIdAPI(
        authToken as string,
        id,
        subjectName,
        subjectCode,
        Number(creditHours),
        description,
        course.map((c) => c.value)
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidSubjectCode(true);
      toast.error("Subject code existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/subjects");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} subject`);
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (subjectName === "") {
      setEmptySubjectName(true);
      emptyInput = true;
    }

    if (!course.values || course.length === 0) {
      setEmptyCourse(true);
      emptyInput = true;
    }

    if (subjectCode === "") {
      setEmptySubjectCode(true);
      emptyInput = true;
    }

    if (creditHours === "") {
      setEmptyCreditHours(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeCourse(onChangeCourse: MultiValue<reactSelectOptionType>) {
    const onChangeCourseValues: reactSelectOptionType[] = [];
    if (onChangeCourse.length !== 0) {
      setEmptyCourse(false);
    }
    for (let i = 0; i < onChangeCourse.length; i++) {
      onChangeCourseValues.push(onChangeCourse[i]);
    }
    setCourse(onChangeCourseValues);
  }

  function onChangeSubjectName(onChangeSubjectName: string) {
    if (onChangeSubjectName !== "") {
      setEmptySubjectName(false);
    }

    setSubjectName(onChangeSubjectName);
  }

  function onChangeSubjectCode(onChangeSubjectCode: string) {
    if (onChangeSubjectCode !== "") {
      setEmptySubjectCode(false);
    }
    setSubjectCode(onChangeSubjectCode);
  }

  function onChangeCreditHours(value: string) {
    // Allow only digits
    const isNumeric = /^\d*$/.test(value);

    if (isNumeric) {
      const numValue = Number(value);

      if (value === "" || (numValue > 0 && numValue <= 10)) {
        setCreditHours(value);
        if (value !== "") {
          setEmptyCreditHours(false);
        }
      }
    }
  }

  function onChangeDescription(onChangeDescription: string) {
    setDescription(onChangeDescription);
  }

  async function getAllCourses(token: string) {
    const response: Response | undefined = await getAllCoursesAPI(token);

    if (!response?.ok) {
      setCourseOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data.courses || data.courses.length === 0) {
      setCourseOptions([]);
      return;
    }

    const options = data.courses.map((course: Course) => ({
      value: course.courseId,
      label: course.courseName,
    }));

    setCourseOptions(options);
  }

  const setupEditSubjectForm = useCallback(
    async (token: string, subjectId: number) => {
      const response: Response | undefined = await getSubjectByIdAPI(
        token,
        subjectId
      );

      if (!response?.ok) {
        navigate("/admin/subjects");
        toast.error("Failed to fetch subject");
        return;
      }

      const { data } = await response.json();

      setSubjectName(data.subjects.subjectName);
      setCourse(
        data.courses.map(
          (course: { courseId: number; courseName: string }) => ({
            label: course.courseName,
            value: course.courseId,
          })
        )
      );
      setSubjectCode(data.subjects.subjectCode);
      setCreditHours(data.subjects.creditHours.toString());
      setDescription(data.subjects.description || "");
    },
    [navigate]
  );

  useEffect(() => {
    if (!authToken) {
      return;
    }

    getAllCourses(authToken);
    if (type === "Edit" && id > 0) {
      setupEditSubjectForm(authToken, id);
    }
  }, [authToken, type, id, setupEditSubjectForm]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Subject
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the subject information below."
              : "Fill in the details below to create a new subject."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptySubjectName}>
                  <NormalTextField
                    text={subjectName}
                    onChange={onChangeSubjectName}
                    isInvalid={emptySubjectName}
                    placeholder="Subject Name"
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptySubjectCode}
                  isInvalid={invalidSubjectCode}
                  invalidMessage="Subject Code already exists."
                >
                  <NormalTextField
                    text={subjectCode}
                    onChange={onChangeSubjectCode}
                    isInvalid={emptySubjectCode || invalidSubjectCode}
                    placeholder="Subject Code (e.g., SEG1024)"
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptyCreditHours}>
                  <NormalTextField
                    text={creditHours}
                    onChange={onChangeCreditHours}
                    isInvalid={emptyCreditHours}
                    placeholder="Credit Hours (1 - 10)"
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptyCourse}>
                  <MultiFilter
                    placeholder="Select Subject's Course"
                    options={courseOptions}
                    value={course}
                    isInvalid={emptyCourse}
                    onChange={onChangeCourse}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <NormalTextField
                  text={description}
                  onChange={onChangeDescription}
                  isInvalid={false}
                  placeholder="Description"
                />
              </div>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Course"
                }
                submit={true}
                backgroundColor="bg-blue-500"
                hoverBgColor="hover:bg-blue-600"
                textColor="text-white"
              />
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/subjects"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
