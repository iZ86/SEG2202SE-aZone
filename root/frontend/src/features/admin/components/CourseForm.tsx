import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import { getAllProgrammesAPI } from "../api/programmes";
import {
  createCourseAPI,
  getCourseByIdAPI,
  updateCourseByIdAPI,
} from "../api/courses";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { SingleValue } from "react-select";
import type { Programme } from "@datatypes/programmeType";
import SingleFilter from "@components/SingleFilter";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

export default function CourseForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [courseName, setCourseName] = useState("");
  const [programme, setProgramme] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });

  const [emptyCourseName, setEmptyCourseName] = useState(false);
  const [emptyProgramme, setEmptyProgramme] = useState(false);

  const [invalidCourseName, setInvalidCourseName] = useState(false);

  const [programmeOptions, setProgrammeOptions] = useState<
    reactSelectOptionType[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyProgramme || emptyCourseName) {
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
      response = await createCourseAPI(
        authToken as string,
        courseName,
        programme.value
      );
    } else if (type === "Edit") {
      response = await updateCourseByIdAPI(
        authToken as string,
        id,
        courseName,
        programme.value
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidCourseName(true);
      toast.error("Course name existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/courses");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} course`);
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (courseName === "") {
      setEmptyCourseName(true);
      emptyInput = true;
    }

    if (!programme.value || programme.value === -1) {
      setEmptyProgramme(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeProgramme(
    onChangeProgramme: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeProgramme) {
      return;
    }
    setProgramme(onChangeProgramme);
    setEmptyProgramme(false);
  }

  function onChangeCourseName(onChangeCourseName: string) {
    if (onChangeCourseName !== "") {
      setEmptyCourseName(false);
    }
    setCourseName(onChangeCourseName);
  }

  async function getAllProgrammes(token: string) {
    const response: Response | undefined = await getAllProgrammesAPI(token);

    if (!response?.ok) {
      setProgrammeOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.length === 0) {
      setProgrammeOptions([]);
      return;
    }

    const options = data.programmes.map((programme: Programme) => ({
      value: programme.programmeId,
      label: programme.programmeName,
    }));

    setProgrammeOptions(options);
  }

  const setupEditCourseForm = useCallback(
    async (token: string, courseId: number) => {
      const response: Response | undefined = await getCourseByIdAPI(
        token,
        courseId
      );

      if (!response?.ok) {
        navigate("/admin/courses");
        toast.error("Failed to fetch course");
        return;
      }

      const { data } = await response.json();

      setCourseName(data.courseName);
      setProgramme({
        label: data.programmeName,
        value: data.programmeId,
      });
    },
    [navigate]
  );

  useEffect(() => {
    if (!authToken) {
      return;
    }

    getAllProgrammes(authToken);
    if (type === "Edit" && id > 0) {
      setupEditCourseForm(authToken, id);
    }
  }, [type, id, setupEditCourseForm, authToken]);

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
            {type === "Edit" ? "Edit" : "Create New"} Course
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the course information below."
              : "Fill in the details below to create a new course."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyCourseName}
                  isInvalid={invalidCourseName}
                  invalidMessage="Course Name already exists."
                >
                  <NormalTextField
                    text={courseName}
                    onChange={onChangeCourseName}
                    isInvalid={emptyCourseName || invalidCourseName}
                    placeholder="Course Name"
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptyProgramme}>
                  <SingleFilter
                    placeholder="Select Course's Programme"
                    options={programmeOptions}
                    value={programme}
                    isInvalid={emptyProgramme}
                    onChange={onChangeProgramme}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex mt-10 gap-x-10">
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/courses"
              />
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Course"
                }
                submit={true}
                backgroundColor="bg-blue-500"
                hoverBgColor="hover:bg-blue-600"
                textColor="text-white"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
