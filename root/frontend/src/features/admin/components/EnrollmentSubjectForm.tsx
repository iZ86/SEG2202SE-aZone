import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createEnrollmentSubjectAPI,
  getEnrollmentSubjectByIdAPI,
  updateEnrollmentSubjectByIdAPI,
} from "../api/enrollments";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { SingleValue } from "react-select";
import SingleFilter from "@components/SingleFilter";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";
import { getAllEnrollmentsAPI } from "../api/enrollments";
import type { Enrollment } from "@datatypes/enrollmentType";
import { getAllSubjectsAPI } from "../api/subjects";
import type { Subject } from "@datatypes/subjectType";
import { getAllLecturersAPI } from "../api/lecturers";
import type { Lecturer } from "@datatypes/lecturerType";

export default function EnrollmentSubjectForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [enrollment, setEnrollment] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [subject, setSubject] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [lecturer, setLecturer] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });

  const [emptyEnrollment, setEmptyEnrollment] = useState(false);
  const [emptySubject, setEmptySubject] = useState(false);
  const [emptyLecturer, setEmptyLecturer] = useState(false);

  const [invalidEnrollmentSubject, setInvalidEnrollmentSubject] =
    useState(false);

  const [enrollmentOptions, setEnrollmentOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [subjectOptions, setSubjectOptions] = useState<reactSelectOptionType[]>(
    []
  );
  const [lecturerOptions, setLecturerOptions] = useState<
    reactSelectOptionType[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  useEffect(() => {
    const setupEditEnrollmentSubjectForm = async (
      token: string,
      enrollmentSubjectId: number
    ) => {
      const response: Response | undefined = await getEnrollmentSubjectByIdAPI(
        token,
        enrollmentSubjectId
      );

      if (!response?.ok) {
        navigate("/admin/enrollment-subject");
        toast.error("Failed to fetch enrollment subject data");
        return;
      }

      const { data } = await response.json();

      setEnrollment({
        label:
          new Date(data.enrollmentStartDateTime).toLocaleString() +
          " - " +
          new Date(data.enrollmentEndDateTime).toLocaleString(),
        value: data.enrollmentId,
      });
      setSubject({
        label: data.subjectName + " (" + data.subjectCode + ")",
        value: data.subjectId,
      });
      setLecturer({
        label:
          (data.lecturerTitle === "None" ? "" : data.lecturerTitle + ".") +
          " " +
          data.lastName +
          " " +
          data.firstName,
        value: data.lecturerId,
      });
    };

    if (!authToken) {
      return;
    }

    getAllEnrollments(authToken);
    getAllSubjects(authToken);
    getAllLecturers(authToken);
    if (type === "Edit" && id > 0) {
      setupEditEnrollmentSubjectForm(authToken, id);
    }
  }, [type, id, authToken, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyEnrollment || emptySubject || emptyLecturer) {
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
      response = await createEnrollmentSubjectAPI(
        authToken as string,
        enrollment.value,
        subject.value,
        lecturer.value
      );
    } else if (type === "Edit") {
      response = await updateEnrollmentSubjectByIdAPI(
        authToken as string,
        id,
        enrollment.value,
        subject.value,
        lecturer.value
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidEnrollmentSubject(true);
      toast.error(
        "Enrollment Subject Existed. Please select a different value"
      );
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/enrollment-subjects");
      toast.success(
        `${type === "Add" ? "Created new" : "Updated"} enrollment subject`
      );
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (!enrollment.value || enrollment.value === -1) {
      setEmptyEnrollment(true);
      emptyInput = true;
    }

    if (!subject.value || subject.value === -1) {
      setEmptySubject(true);
      emptyInput = true;
    }

    if (!lecturer.value || lecturer.value === -1) {
      setEmptyLecturer(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeEnrollment(
    onChangeEnrollment: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeEnrollment) {
      return;
    }
    setEnrollment(onChangeEnrollment);
    setEmptyEnrollment(false);
  }

  function onChangeSubject(
    onChangeSubject: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeSubject) {
      return;
    }
    setSubject(onChangeSubject);
    setEmptySubject(false);
  }

  function onChangeLecturer(
    onChangeLecturer: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeLecturer) {
      return;
    }
    setLecturer(onChangeLecturer);
    setEmptyLecturer(false);
  }

  async function getAllEnrollments(token: string) {
    const response: Response | undefined = await getAllEnrollmentsAPI(token);

    if (!response?.ok) {
      setEnrollmentOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.enrollments.length === 0) {
      setEnrollmentOptions([]);
      return;
    }

    const options = data.enrollments.map((enrollment: Enrollment) => ({
      value: enrollment.enrollmentId,
      label:
        new Date(enrollment.enrollmentStartDateTime).toLocaleString() +
        " - " +
        new Date(enrollment.enrollmentEndDateTime).toLocaleString(),
    }));

    setEnrollmentOptions(options);
  }

  async function getAllSubjects(token: string) {
    const response: Response | undefined = await getAllSubjectsAPI(token);

    if (!response?.ok) {
      setSubjectOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.subjects.length === 0) {
      setSubjectOptions([]);
      return;
    }

    const options = data.subjects.map((subject: Subject) => ({
      value: subject.subjectId,
      label: subject.subjectName + " (" + subject.subjectCode + ")",
    }));

    setSubjectOptions(options);
  }

  async function getAllLecturers(token: string) {
    const response: Response | undefined = await getAllLecturersAPI(token);

    if (!response?.ok) {
      setLecturerOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.lecturers.length === 0) {
      setLecturerOptions([]);
      return;
    }

    const options = data.lecturers.map((lecturer: Lecturer) => ({
      value: lecturer.lecturerId,
      label:
        (lecturer.lecturerTitle === "None"
          ? ""
          : lecturer.lecturerTitle + ".") +
        " " +
        lecturer.lastName +
        " " +
        lecturer.firstName,
    }));

    setLecturerOptions(options);
  }

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Enrollment Subject
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the enrollment subject information below."
              : "Fill in the details below to create a new enrollment subject."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyEnrollment}
                  isInvalid={invalidEnrollmentSubject}
                  invalidMessage="Please Select a Different Enrollment"
                >
                  <SingleFilter
                    placeholder="Select Enrollment Period"
                    options={enrollmentOptions}
                    value={enrollment}
                    isInvalid={emptyEnrollment || invalidEnrollmentSubject}
                    onChange={onChangeEnrollment}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptySubject}
                  isInvalid={invalidEnrollmentSubject}
                  invalidMessage="Please Select a Different Subject"
                >
                  <SingleFilter
                    placeholder="Select Subject"
                    options={subjectOptions}
                    value={subject}
                    isInvalid={emptySubject || invalidEnrollmentSubject}
                    onChange={onChangeSubject}
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyLecturer}
                  isInvalid={invalidEnrollmentSubject}
                  invalidMessage="Please Select a Different Lecturer"
                >
                  <SingleFilter
                    placeholder="Select Lecturer"
                    options={lecturerOptions}
                    value={lecturer}
                    isInvalid={emptyLecturer || invalidEnrollmentSubject}
                    onChange={onChangeLecturer}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit"
                    ? "Save Changes"
                    : "Create New Enrollment Subject"
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
                link="/admin/enrollment-subjects"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
