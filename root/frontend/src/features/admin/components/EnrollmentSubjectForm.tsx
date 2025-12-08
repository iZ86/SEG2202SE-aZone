import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createEnrollmentSubjectTypeAPI,
  createEnrollmentSubjectAPI,
  getEnrollmentSubjectByIdAPI,
  getEnrollmentSubjectTypeByEnrollmentSubjectIdAPI,
  updateEnrollmentSubjectByIdAPI,
  updateEnrollmentSubjectTypeByEnrollmentSubjectIdAPI,
  deleteEnrollmentSubjectTypeByEnrollmentSubjectIdAPI,
} from "../api/enrollments";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { SingleValue } from "react-select";
import SingleFilter from "@components/SingleFilter";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";
import { getAllEnrollmentsAPI } from "../api/enrollments";
import { Time } from "@internationalized/date";
import type {
  CreateEnrollmentSubjectType,
  Enrollment,
  EnrollmentSubjectType,
  UpdateEnrollmentSubjectType,
} from "@datatypes/enrollmentType";
import { getAllSubjectsAPI } from "../api/subjects";
import type { Subject } from "@datatypes/subjectType";
import { getAllLecturersAPI } from "../api/lecturers";
import type { Lecturer } from "@datatypes/lecturerType";
import EnrollmentSubjectTypeForm from "./EnrollmentSubjectTypeForm";

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
  const [classes, setClasses] = useState<
    {
      classType: reactSelectOptionType;
      venue: reactSelectOptionType;
      day: reactSelectOptionType;
      startTime: Time | null;
      endTime: Time | null;
      numberOfSeats: number;
      grouping: number;
    }[]
  >([
    {
      classType: {
        value: -1,
        label: "",
      },
      venue: {
        value: -1,
        label: "",
      },
      day: {
        value: -1,
        label: "",
      },
      startTime: null,
      endTime: null,
      numberOfSeats: 0,
      grouping: 0,
    },
  ]);

  const [emptyEnrollment, setEmptyEnrollment] = useState(false);
  const [emptySubject, setEmptySubject] = useState(false);
  const [emptyLecturer, setEmptyLecturer] = useState(false);
  const [emptyClassSession, setEmptyClassSession] = useState<
    {
      classType: boolean;
      venue: boolean;
      day: boolean;
      startTime: boolean;
      endTime: boolean;
      numberOfSeats: boolean;
      grouping: boolean;
    }[]
  >([
    {
      classType: false,
      venue: false,
      day: false,
      startTime: false,
      endTime: false,
      numberOfSeats: false,
      grouping: false,
    },
  ]);

  const [invalidEnrollmentSubject, setInvalidEnrollmentSubject] =
    useState(false);
  const [invalidClassSession, setInvalidClassSession] = useState<
    {
      classType: boolean;
      venue: boolean;
      day: boolean;
      startTime: boolean;
      endTime: boolean;
      numberOfSeats: boolean;
      grouping: boolean;
    }[]
  >([
    {
      classType: false,
      venue: false,
      day: false,
      startTime: false,
      endTime: false,
      numberOfSeats: false,
      grouping: false,
    },
  ]);

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

    const setupEditEnrollmentSubjectTypeForm = async (
      token: string,
      enrollmentSubjectId: number
    ) => {
      const response: Response | undefined =
        await getEnrollmentSubjectTypeByEnrollmentSubjectIdAPI(
          token,
          enrollmentSubjectId
        );

      if (!response?.ok) {
        navigate("/admin/enrollment-subject");
        toast.error("Failed to fetch enrollment subject data");
        return;
      }

      const { data } = await response.json();

      setClasses(
        data.map((enrollmentSubjectType: EnrollmentSubjectType) => ({
          classType: {
            value: enrollmentSubjectType.classTypeId,
            label: enrollmentSubjectType.classType,
          },
          venue: {
            value: enrollmentSubjectType.venueId,
            label: enrollmentSubjectType.venue,
          },
          day: {
            value: enrollmentSubjectType.dayId,
            label: enrollmentSubjectType.day,
          },
          startTime: new Time(
            parseInt(enrollmentSubjectType.startTime.toString().split(":")[0]),
            parseInt(enrollmentSubjectType.startTime.toString().split(":")[1])
          ),
          endTime: new Time(
            parseInt(enrollmentSubjectType.endTime.toString().split(":")[0]),
            parseInt(enrollmentSubjectType.endTime.toString().split(":")[1])
          ),
          numberOfSeats: enrollmentSubjectType.numberOfSeats ?? 0,
          grouping: enrollmentSubjectType.grouping ?? 0,
        }))
      );
    };

    if (!authToken) {
      return;
    }

    getAllEnrollments(authToken);
    getAllSubjects(authToken);
    getAllLecturers(authToken);
    if (type === "Edit" && id > 0) {
      setupEditEnrollmentSubjectForm(authToken, id);
      setupEditEnrollmentSubjectTypeForm(authToken, id);
    }
  }, [type, id, authToken, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  async function handleSubmitEnrollmentSubject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyEnrollment || emptySubject || emptyLecturer) {
      setIsLoading(false);
      return;
    }

    if (setEmptyEnrollmentSubjectInputs()) {
      setIsLoading(false);
      return;
    }

    if (classes.length > 0 && setEmptySubjectSessionsInputs()) {
      setIsLoading(false);
      return;
    }

    const formatTime = (t: Time | null): string => {
      if (!t) return "";
      const hh = t.hour.toString().padStart(2, "0");
      const mm = t.minute.toString().padStart(2, "0");
      return `${hh}:${mm}`;
    };

    // Check for duplicate class sessions
    if (classes.length > 1) {
      const sessionKeys: Map<string, number> = new Map<string, number>();
      let isDuplicateFound: boolean = false;

      for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];

        // Unique key for the class session based on relevant fields
        const key = [
          id,
          cls.classType.value,
          cls.venue.value,
          formatTime(cls.startTime),
          formatTime(cls.endTime),
          cls.day.value,
        ].join("|");

        if (sessionKeys.has(key)) {
          // Duplicate found
          isDuplicateFound = true;
          const originalIndex = sessionKeys.get(key) as number;

          // Set error state and provide feedback
          setInvalidClassSession((prev) => {
            const newState = [...prev];
            newState[i] = {
              ...newState[i],
              classType: true,
              venue: true,
              day: true,
              startTime: true,
              endTime: true,
            };
            return newState;
          });
          toast.error(
            `Class Session #${i + 1} is a duplicate of Class Session #${
              originalIndex + 1
            }`
          );
          break;
        }
        // Store the key and the current index
        sessionKeys.set(key, i);
      }

      if (isDuplicateFound) {
        setIsLoading(false);
        return;
      }
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

    if (!response || !response.ok) {
      setIsLoading(false);
      toast.error("Failed to submit enrollment subject");
      return;
    }

    if (classes.length === 0) {
      // If no class sessions, or removed. Delete existing class sessions
      const deleteResponse: Response | undefined =
        await deleteEnrollmentSubjectTypeByEnrollmentSubjectIdAPI(
          authToken,
          id
        );

      if (!deleteResponse || !deleteResponse.ok) {
        setIsLoading(false);
        navigate("/admin/enrollment-subjects");
        toast.error("Failed to delete existing class sessions");
        return;
      }

      toast.success(
        `Enrollment subject ${type === "Edit" ? "updated" : "created"}`
      );
      navigate("/admin/enrollment-subjects");
      return;
    }

    if (setEmptySubjectSessionsInputs()) {
      setIsLoading(false);
      return;
    }

    const { data } = await response.json();
    const enrollmentSubjectId: number = data.enrollmentSubjectId
      ? data.enrollmentSubjectId
      : id;

    const formattedClasses = classes.map((cls) => {
      if (type === "Add") {
        return {
          enrollmentSubjectId,
          classTypeId: cls.classType.value,
          venueId: cls.venue.value,
          dayId: cls.day.value,
          startTime: formatTime(cls.startTime),
          endTime: formatTime(cls.endTime),
          numberOfSeats: cls.numberOfSeats,
          grouping: cls.grouping,
        };
      } else if (type === "Edit") {
        return {
          classTypeId: cls.classType.value,
          venueId: cls.venue.value,
          dayId: cls.day.value,
          startTime: formatTime(cls.startTime),
          endTime: formatTime(cls.endTime),
          numberOfSeats: cls.numberOfSeats,
          grouping: cls.grouping,
        };
      }
    });

    let enrollmentSubjectTypeResponse: Response | undefined;

    if (type === "Add") {
      enrollmentSubjectTypeResponse = await createEnrollmentSubjectTypeAPI(
        authToken as string,
        formattedClasses as CreateEnrollmentSubjectType[]
      );
    } else if (type === "Edit") {
      enrollmentSubjectTypeResponse =
        await updateEnrollmentSubjectTypeByEnrollmentSubjectIdAPI(
          authToken as string,
          enrollmentSubjectId,
          formattedClasses as UpdateEnrollmentSubjectType[]
        );
    }

    if (!enrollmentSubjectTypeResponse || !enrollmentSubjectTypeResponse.ok) {
      setIsLoading(false);
      toast.error("Failed to create class sessions");
      return;
    }

    toast.success(
      `Enrollment subject and class sessions ${
        type === "Edit" ? "updated" : "created"
      }`
    );
    navigate("/admin/enrollment-subjects");
    return;
  }

  function setEmptyEnrollmentSubjectInputs(): boolean {
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

  function setEmptySubjectSessionsInputs(): boolean {
    let emptyInput = false;

    classes.map((cls, index) => {
      const isClassTypeEmpty = !cls.classType || cls.classType.value === -1;
      const isVenueEmpty = !cls.venue || cls.venue.value === -1;
      const isDayEmpty = !cls.day || cls.day.value === -1;
      const isStartTimeEmpty = cls.startTime === null;
      const isEndTimeEmpty = cls.endTime === null;
      const isNumberOfSeatsEmpty = !cls.numberOfSeats || cls.numberOfSeats <= 0;
      const isGroupingEmpty = !cls.grouping || cls.grouping === 0;

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          classType: isClassTypeEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          venue: isVenueEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          day: isDayEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          startTime: isStartTimeEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          endTime: isEndTimeEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          numberOfSeats: isNumberOfSeatsEmpty,
        };
        return newState;
      });

      setEmptyClassSession((prev) => {
        const newState = [...prev];
        newState[index] = {
          ...newState[index],
          grouping: isGroupingEmpty,
        };
        return newState;
      });

      if (
        isClassTypeEmpty ||
        isVenueEmpty ||
        isDayEmpty ||
        isStartTimeEmpty ||
        isEndTimeEmpty ||
        isNumberOfSeatsEmpty ||
        isGroupingEmpty
      ) {
        emptyInput = true;
        toast.error(`Please complete all fields for Class #${index + 1}`);
      }

      return emptyInput;
    });
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
    setInvalidEnrollmentSubject(false);
  }

  function onChangeSubject(
    onChangeSubject: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeSubject) {
      return;
    }
    setSubject(onChangeSubject);
    setEmptySubject(false);
    setInvalidEnrollmentSubject(false);
  }

  function onChangeLecturer(
    onChangeLecturer: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeLecturer) {
      return;
    }
    setLecturer(onChangeLecturer);
    setEmptyLecturer(false);
    setInvalidEnrollmentSubject(false);
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
        (lecturer.lecturerTitle === "None" ? "" : lecturer.lecturerTitle) +
        " " +
        lecturer.lastName +
        " " +
        lecturer.firstName,
    }));

    setLecturerOptions(options);
  }

  function addClass() {
    setClasses((prev) => [
      ...prev,
      {
        classType: { value: -1, label: "" },
        venue: { value: -1, label: "" },
        day: { value: -1, label: "" },
        startTime: null,
        endTime: null,
        numberOfSeats: 0,
        grouping: 0,
      },
    ]);

    setEmptyClassSession((prev) => [
      ...prev,
      {
        classType: false,
        venue: false,
        day: false,
        startTime: false,
        endTime: false,
        numberOfSeats: false,
        grouping: false,
      },
    ]);
  }

  function updateClass(
    index: number,
    field: string,
    value: string | SingleValue<reactSelectOptionType> | Time | null
  ) {
    const updated = [...classes];
    updated[index] = { ...updated[index], [field]: value };
    setClasses(updated);
    setEmptyClassSession((prev) => {
      const newState = [...prev];
      newState[index] = {
        ...newState[index],
        [field]: false,
      };
      return newState;
    });
    setInvalidClassSession((prev) => {
      const newState = [...prev];
      newState[index] = {
        ...newState[index],
        classType: false,
        venue: false,
        day: false,
        startTime: false,
        endTime: false,
      };
      return newState;
    });
  }

  function removeClass(index: number) {
    setClasses((prev) => prev.filter((_, i) => i !== index));
    setEmptyClassSession((prev) => prev.filter((_, i) => i !== index));
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
          <form
            onSubmit={handleSubmitEnrollmentSubject}
            className="mt-6 gap-y-8 flex flex-col"
          >
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

            {classes.length > 0 && (
              <h1 className="text-3xl font-bold text-slate-900">
                Class Sessions
              </h1>
            )}
            {classes.map((cls, idx) => (
              <EnrollmentSubjectTypeForm
                key={idx}
                index={idx}
                data={cls}
                isEmpty={emptyClassSession[idx] || {}}
                isInvalid={invalidClassSession[idx] || {}}
                onChange={updateClass}
                onRemove={removeClass}
              />
            ))}

            <div className="flex justify-center mt-4">
              <MediumButton
                buttonText="+ Add Class"
                onClick={addClass}
                submit={false}
                backgroundColor="bg-green-500"
                hoverBgColor="hover:bg-green-600"
                textColor="text-white"
              />
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
