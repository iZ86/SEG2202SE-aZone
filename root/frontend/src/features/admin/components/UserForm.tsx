import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { MultiValue, SingleValue } from "react-select";
import {
  createStudentAPI,
  createStudentCourseProgrammeIntakeAPI,
  deleteStudentCourseProgrammeIntakeAPI,
  getStudentByIdAPI,
  getStudentProgrammeHistoryAPI,
  getStudentsTimetableByIdAPI,
  updateStudentByIdAPI,
} from "../api/students";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import PasswordTextField from "@components/PasswordTextField";
import SingleFilter from "@components/SingleFilter";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import { getAdminByIdAPI, updateAdminByIdAPI } from "../api/admins";
import type { Programme, ProgrammeIntake } from "@datatypes/programmeType";
import type { Course } from "@datatypes/courseType";
import type {
  StudentClassData,
  StudentCourseProgrammeIntake,
} from "@datatypes/userType";
import { Trash2 } from "lucide-react";
import {
  getAllProgrammesAPI,
  getProgrammeIntakesByProgrammeIdAPI,
} from "../api/programmes";
import { getCoursesByProgrammeIdAPI } from "../api/courses";
import { toast } from "react-toastify";
import { useAdmin } from "../hooks/useAdmin";
import {
  createStudentEnrollmentSubjectTypesByStudentIdAPI,
  getEnrollmentSubjectByStudentIdAPI,
} from "../api/enrollments";
import type { EnrollmentSubjectResponse } from "@datatypes/enrollmentType";
import { MultiFilter } from "@components/MultiFilter";
import type { ClassType, ClassTypeDetail } from "@datatypes/classTypeType";

export default function UserForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  type Tab = "Student Information" | "Course History" | "Enroll in Subjects";
  const tabs: Tab[] = [
    "Student Information",
    "Course History",
    "Enroll in Subjects",
  ];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<reactSelectOptionType>({
    value: 1,
    label: "Active",
  });
  const [programme, setProgramme] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [course, setCourse] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [programmeIntake, setProgrammeIntake] = useState<reactSelectOptionType>(
    {
      value: -1,
      label: "",
    },
  );
  const [enrollmentSubjectTypes, setEnrollmentSubjectTypes] = useState<
    reactSelectOptionType[]
  >([]);

  const [studentCoursesHistory, setStudentCoursesHistory] = useState<
    StudentCourseProgrammeIntake[]
  >([]);

  const [programmeOptions, setProgrammeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [courseOptions, setCourseOptions] = useState<reactSelectOptionType[]>(
    [],
  );
  const [programmeIntakeOptions, setProgrammeIntakeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const statusOptions: reactSelectOptionType[] = [
    { value: 0, label: "Inactive" },
    { value: 1, label: "Active" },
  ];
  const [enrollmentSubjectTypesOptions, setEnrollmentSubjectTypesOptions] =
    useState<reactSelectOptionType[]>([]);

  const [emptyStatus, setEmptyStatus] = useState(false);
  const [emptyFirstName, setEmptyFirstName] = useState(false);
  const [emptyLastName, setEmptyLastName] = useState(false);
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [emptyPhoneNumber, setEmptyPhoneNumber] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [emptyConfirmPassword, setEmptyConfirmPassword] = useState(false);
  const [emptyProgramme, setEmptyProgramme] = useState(false);
  const [emptyCourse, setEmptyCourse] = useState(false);
  const [emptyProgrammeIntake, setEmptyProgrammeIntake] = useState(false);
  const [emptyEnrollmentSubjectTypes, setEmptyEnrollmentSubjectTypes] =
    useState(false);

  const [invalidEmail, setInvalidEmail] = useState(false);
  const [
    isStudentCourseProgrammeIntakeExist,
    setIsStudentCourseProgrammeIntakeExist,
  ] = useState(false);
  const [
    isEnrollmentSubjectTypeTimeClashed,
    setIsEnrollmentSubjectTypeTimeClashed,
  ] = useState(false);

  const [isPasswordMatched, setIsPasswordMatched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("Student Information");

  const navigate = useNavigate();
  const skipReset = useRef(false);
  const [searchParams] = useSearchParams();
  const isAdmin: boolean = searchParams.get("admin") === "true";

  const { authToken, admin, loading } = useAdmin();

  useEffect(() => {
    const setupEditStudentForm = async (token: string, studentId: number) => {
      if (activeTab === "Student Information") {
        const studentResponse: Response | undefined = await getStudentByIdAPI(
          token,
          studentId,
        );

        if (!studentResponse || !studentResponse.ok) {
          navigate("/admin/users");
          toast.error("Failed to fetch student data");
          return;
        }

        const { data } = await studentResponse.json();

        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setStatus({
          value: data.userStatus ? 1 : 0,
          label: data.userStatus ? "Active" : "Inactive",
        });
      } else if (activeTab === "Course History") {
        const studentCourseProgrammeIntakeResponse: Response | undefined =
          await getStudentProgrammeHistoryAPI(token, studentId);

        if (
          !studentCourseProgrammeIntakeResponse ||
          !studentCourseProgrammeIntakeResponse.ok
        ) {
          navigate("/admin/users");
          toast.error("Failed to fetch student course history");
          return;
        }

        const { data } = await studentCourseProgrammeIntakeResponse.json();

        // Filter active and history programmes
        const studentCoursesHistory = (data || []).filter(
          (p: StudentCourseProgrammeIntake) => p.courseStatus !== 1,
        );
        setStudentCoursesHistory(studentCoursesHistory);

        const activeProgrammes = (data || [])
          .filter((p: StudentCourseProgrammeIntake) => p.courseStatus === 1)
          .map((programme: Programme) => ({
            value: programme.programmeId,
            label: programme.programmeName,
          }));
        setProgramme(activeProgrammes[0] || { value: -1, label: "" });

        // Filter active and history courses
        const activeCourses = (data || [])
          .filter((c: StudentCourseProgrammeIntake) => c.courseStatus === 1)
          .map((course: Course) => ({
            value: course.courseId,
            label: course.courseName,
          }));
        setCourse(activeCourses[0] || { value: -1, label: "" });

        // Filter active and history programme intakes
        const activeProgrammeIntakes = (data || [])
          .filter((i: StudentCourseProgrammeIntake) => i.courseStatus === 1)
          .map((intake: ProgrammeIntake) => ({
            value: intake.programmeIntakeId,
            label: intake.intakeId + " - Semester " + intake.semester,
          }));
        setProgrammeIntake(
          activeProgrammeIntakes[0] || { value: -1, label: "" },
        );
      } else if (activeTab === "Enroll in Subjects") {
        const enrollmentSubjectTypesResponse: Response | undefined =
          await getEnrollmentSubjectByStudentIdAPI(token, studentId);

        const enrolledSubjectsResponse: Response | undefined =
          await getStudentsTimetableByIdAPI(token, studentId);

        if (
          !enrollmentSubjectTypesResponse ||
          !enrollmentSubjectTypesResponse.ok ||
          !enrolledSubjectsResponse ||
          !enrolledSubjectsResponse.ok
        ) {
          navigate("/admin/users");

          if (enrollmentSubjectTypesResponse?.status === 404) {
            toast.error("No enrollment at the moment");
            return;
          } else {
            toast.error("Failed to fetch student enrollment subjects");
            return;
          }
        }

        const { data } = await enrollmentSubjectTypesResponse.json();
        const enrolledSubjectsResponseJson =
          await enrolledSubjectsResponse.json();
        const enrolledSubjectsResponseData = enrolledSubjectsResponseJson.data;

        const enrollmentSubjectTypesOptions =
          data.studentEnrollmentSubjects.flatMap(
            (enrollmentSubjectType: EnrollmentSubjectResponse) =>
              enrollmentSubjectType.classTypes.flatMap((classType: ClassType) =>
                classType.classTypeDetails.map(
                  (classTypeDetail: ClassTypeDetail) => ({
                    value: classTypeDetail.enrollmentSubjectTypeId,
                    label:
                      enrollmentSubjectType.subjectCode +
                      " " +
                      enrollmentSubjectType.subjectName +
                      " (CH: " +
                      enrollmentSubjectType.creditHours +
                      ")" +
                      " - " +
                      classType.classType +
                      " • " +
                      (enrollmentSubjectType.lecturerTitle === "None"
                        ? ""
                        : enrollmentSubjectType.lecturerTitle + " ") +
                      enrollmentSubjectType.lastName +
                      " " +
                      enrollmentSubjectType.firstName +
                      " - " +
                      classTypeDetail.day +
                      " " +
                      classTypeDetail.startTime +
                      "-" +
                      classTypeDetail.endTime +
                      " • Group " +
                      classTypeDetail.grouping +
                      "",
                  }),
                ),
              ),
          );

        setEnrollmentSubjectTypesOptions(enrollmentSubjectTypesOptions);

        const enrolledSubjects = enrolledSubjectsResponseData.timetable.map(
          (timetable: StudentClassData) => {
            return {
              value: timetable.enrollmentSubjectTypeId,
              label:
                timetable.subjectCode +
                " " +
                timetable.subjectName +
                " (CH: " +
                timetable.creditHours +
                ")" +
                " - " +
                timetable.classType +
                " • " +
                (timetable.lecturerTitle === "None"
                  ? ""
                  : timetable.lecturerTitle + " ") +
                timetable.lecturerLastName +
                " " +
                timetable.lecturerFirstName +
                " - " +
                timetable.day +
                " " +
                timetable.startTime +
                "-" +
                timetable.endTime +
                " • Group " +
                timetable.grouping +
                "",
            };
          },
        );

        setEnrollmentSubjectTypes(enrolledSubjects);
      }

      skipReset.current = true;
    };

    const setupEditAdminForm = async (token: string, adminId: number) => {
      const response: Response | undefined = await getAdminByIdAPI(
        token,
        adminId,
      );

      if (!response?.ok) {
        navigate("/admin/users");
        return;
      }
      const { data } = await response.json();

      skipReset.current = true;

      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setStatus({
        value: data.userStatus ? 1 : 0,
        label: data.userStatus ? "Active" : "Inactive",
      });
    };

    if (!authToken) return;

    getAllProgrammes(authToken);

    if (type === "Edit" && id > 0) {
      if (isAdmin) {
        setupEditAdminForm(authToken, id);
      } else {
        setupEditStudentForm(authToken, id);
      }
    }
  }, [type, id, isAdmin, authToken, navigate, activeTab]);

  useEffect(() => {
    if (programme.value <= 0 || !authToken) {
      setCourseOptions([]);
      return;
    }

    if (activeTab !== "Course History") return;

    getCoursesByProgrammeId(authToken, programme.value);
    getProgrammeIntakesByProgrammeId(authToken, programme.value);

    if (skipReset.current) {
      skipReset.current = false;
    } else {
      setCourse({
        value: -1,
        label: "",
      });
      setProgrammeIntake({
        value: -1,
        label: "",
      });
    }
  }, [authToken, programme, activeTab]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
            {status}
          </span>
        );
      case "Finished":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
            {status}
          </span>
        );
      case "Completed":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
            {status}
          </span>
        );
      case "Dropped":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
            {status}
          </span>
        );
      default:
        return status;
    }
  };

  async function handleSubmitUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (
      emptyFirstName ||
      emptyLastName ||
      emptyEmail ||
      emptyPhoneNumber ||
      emptyPassword ||
      emptyConfirmPassword
    ) {
      setIsLoading(false);
      return;
    }

    if (setUserEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let response: Response | undefined;

    if (type === "Add") {
      response = await createStudentAPI(
        authToken as string,
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        status.value,
      );
    } else if (type === "Edit") {
      if (isAdmin) {
        response = await updateAdminByIdAPI(
          authToken as string,
          id,
          firstName,
          lastName,
          email,
          phoneNumber,
        );
      } else {
        response = await updateStudentByIdAPI(
          authToken as string,
          id,
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          status.value,
        );
      }
    } else {
      navigate("/admin/users");
      return;
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidEmail(true);
      toast.error("Email already exist!");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/users");
      toast.success(
        `${type === "Add" ? "Created new" : "Updated"} ${
          isAdmin ? "Admin" : "Student"
        }`,
      );
      return;
    } else {
      navigate("/admin/users");
      toast.error(
        `Failed to ${type === "Add" ? "Create new" : "Update"} ${
          isAdmin ? "Admin" : "Student"
        }`,
      );
    }
  }

  async function handleSubmitCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyProgramme || emptyCourse || emptyProgrammeIntake) {
      setIsLoading(false);
      return;
    }

    if (setCourseEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (type !== "Edit") {
      navigate("/admin/users");
      return;
    }

    const response: Response | undefined =
      await createStudentCourseProgrammeIntakeAPI(
        authToken as string,
        id,
        course.value,
        programmeIntake.value,
      );

    if (response && response.status === 409) {
      setIsStudentCourseProgrammeIntakeExist(true);
      setIsLoading(false);
      toast.error("Course existed");
      return;
    } else {
      setIsStudentCourseProgrammeIntakeExist(false);
    }

    if (!response || !response.ok) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate("/admin/users");
    toast.success("Updated student's course");
    return;
  }

  async function handleSubmitEnrollmentSubjectTypes(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyEnrollmentSubjectTypes) {
      setIsLoading(false);
      return;
    }

    if (setEnrollmentSubjectTypesEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (type !== "Edit") {
      navigate("/admin/users");
      return;
    }

    const response: Response | undefined =
      await createStudentEnrollmentSubjectTypesByStudentIdAPI(
        authToken as string,
        id,
        enrollmentSubjectTypes.map((est) => est.value),
      );

    if (response && response.status === 409) {
      const { data } = await response.json();

      const clashedId = data.enrollmentSubjectTypeIds[0];

      const clashedOption = enrollmentSubjectTypesOptions.find(
        (est) => est.value === clashedId,
      );

      setIsEnrollmentSubjectTypeTimeClashed(true);
      setIsLoading(false);
      toast.error(`Time clash detected: ${clashedOption?.label}`);
      return;
    } else {
      setIsEnrollmentSubjectTypeTimeClashed(false);
    }

    if (!response || !response.ok) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate("/admin/users");
    toast.success("Updated student's subject");
    return;
  }

  const handleDeleteStudentCourseProgrammeIntake = async (
    courseId: number,
    programmeIntakeId: number,
  ) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete course history for Student ID ${id}?`,
    );
    if (!confirmDelete) return;

    const response = await deleteStudentCourseProgrammeIntakeAPI(
      authToken,
      id,
      courseId,
      programmeIntakeId,
    );

    if (response && response.ok) {
      navigate("/admin/users");
      toast.success("Deleted course history");
    }
  };

  function setUserEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (firstName === "") {
      setEmptyFirstName(true);
      emptyInput = true;
    }

    if (lastName === "") {
      setEmptyLastName(true);
      emptyInput = true;
    }

    if (email === "") {
      setEmptyEmail(true);
      emptyInput = true;
    }

    if (phoneNumber === "") {
      setEmptyPhoneNumber(true);
      emptyInput = true;
    }

    if (type === "Add") {
      if (password === "") {
        setEmptyPassword(true);
        emptyInput = true;
      }

      if (confirmPassword === "") {
        setEmptyConfirmPassword(true);
        emptyInput = true;
      }
    }

    return emptyInput;
  }

  function setCourseEmptyInputs() {
    let emptyInput: boolean = false;

    if (isAdmin || type === "Add") {
      return false;
    }

    if (!programme.value || programme.value === -1) {
      setEmptyProgramme(true);
      emptyInput = true;
    }

    if (!course.value || course.value === -1) {
      setEmptyCourse(true);
      emptyInput = true;
    }

    if (!programmeIntake.value || programmeIntake.value === -1) {
      setEmptyProgrammeIntake(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function setEnrollmentSubjectTypesEmptyInputs() {
    let emptyInput: boolean = false;

    if (!enrollmentSubjectTypes.values || enrollmentSubjectTypes.length === 0) {
      setEmptyEnrollmentSubjectTypes(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeStatus(onChangeStatus: SingleValue<reactSelectOptionType>) {
    if (!onChangeStatus) {
      return;
    }
    setStatus(onChangeStatus);
    setEmptyStatus(false);
  }

  function onChangeFirstName(onChangeFirstName: string) {
    if (onChangeFirstName !== "") {
      setEmptyFirstName(false);
    }
    setFirstName(onChangeFirstName);
  }

  function onChangeLastName(onChangeLastName: string) {
    if (onChangeLastName !== "") {
      setEmptyLastName(false);
    }
    setLastName(onChangeLastName);
  }

  function onChangeEmail(onChangeEmail: string) {
    if (onChangeEmail !== "") {
      setEmptyEmail(false);
      setInvalidEmail(false);
    }
    setEmail(onChangeEmail);
  }

  function onChangePhoneNumber(onChangePhoneNumber: string) {
    if (onChangePhoneNumber !== "") {
      setEmptyPhoneNumber(false);
    }
    setPhoneNumber(onChangePhoneNumber);
  }

  function onChangePassword(onChangePassword: string) {
    if (onChangePassword !== "") {
      setEmptyPassword(false);
    }
    setIsPasswordMatched(onChangePassword === confirmPassword);
    setPassword(onChangePassword);
  }

  function onChangeConfirmPassword(onChangeConfirmPassword: string) {
    if (onChangeConfirmPassword !== "") {
      setEmptyConfirmPassword(false);
    }
    setIsPasswordMatched(onChangeConfirmPassword === password);
    setConfirmPassword(onChangeConfirmPassword);
  }

  function onChangeProgramme(
    onChangeProgramme: SingleValue<reactSelectOptionType>,
  ) {
    if (!onChangeProgramme) {
      return;
    }
    setProgramme(onChangeProgramme);
    setEmptyProgramme(false);
  }

  function onChangeCourse(onChangeCourse: SingleValue<reactSelectOptionType>) {
    if (!onChangeCourse) {
      return;
    }
    setCourse(onChangeCourse);
    setEmptyCourse(false);
  }

  function onChangeProgrammeIntake(
    onChangeProgrammeIntake: SingleValue<reactSelectOptionType>,
  ) {
    if (!onChangeProgrammeIntake) {
      return;
    }
    setProgrammeIntake(onChangeProgrammeIntake);
    setEmptyProgrammeIntake(false);
  }

  function onChangeEnrollmentSubjectTypes(
    onChangeEnrollmentSubjectTypes: MultiValue<reactSelectOptionType>,
  ) {
    const onChangeEnrollmentSubjectTypesValues: reactSelectOptionType[] = [];
    if (onChangeEnrollmentSubjectTypes.length !== 0) {
      setEmptyEnrollmentSubjectTypes(false);
    }
    for (let i = 0; i < onChangeEnrollmentSubjectTypes.length; i++) {
      onChangeEnrollmentSubjectTypesValues.push(
        onChangeEnrollmentSubjectTypes[i],
      );
    }
    setEnrollmentSubjectTypes(onChangeEnrollmentSubjectTypesValues);
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

  async function getCoursesByProgrammeId(token: string, programmeId: number) {
    const response: Response | undefined = await getCoursesByProgrammeIdAPI(
      token,
      programmeId,
    );

    if (!response?.ok) {
      setCourseOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.length === 0) {
      setCourseOptions([]);
      return;
    }

    const options = data.map((course: Course) => ({
      value: course.courseId,
      label: course.courseName,
    }));

    setCourseOptions(options);
  }

  async function getProgrammeIntakesByProgrammeId(
    token: string,
    programmeId: number,
  ) {
    const response: Response | undefined =
      await getProgrammeIntakesByProgrammeIdAPI(token, programmeId);

    if (!response?.ok) {
      setProgrammeIntakeOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.length === 0) {
      setProgrammeIntakeOptions([]);
      return;
    }

    const options = data.map((programmeIntake: ProgrammeIntake) => ({
      value: programmeIntake.programmeIntakeId,
      label:
        programmeIntake.intakeId + " - Semester " + programmeIntake.semester,
    }));

    setProgrammeIntakeOptions(options);
  }

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"}{" "}
            {!isAdmin ? "Student" : "Admin"}
          </h1>
          <p className="mt-1 text-slate-400">
            {!isAdmin &&
              type === "Edit" &&
              "Make changes to the student information below."}
            {isAdmin &&
              type === "Edit" &&
              "Make changes to the admin information below."}
          </p>

          {type == "Edit" && !isAdmin && (
            <div className="flex space-x-8 border-b border-gray-300 mt-8">
              {tabs.map(
                (
                  role:
                    | "Student Information"
                    | "Course History"
                    | "Enroll in Subjects",
                ) => (
                  <button
                    key={role}
                    className={`pb-2 font-semibold cursor-pointer ${
                      activeTab === role
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab(role)}
                    type="button"
                  >
                    {role}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center gap-y-14">
          {activeTab === "Student Information" && (
            <form
              onSubmit={handleSubmitUser}
              className="gap-y-8 flex flex-col justify-center items-center"
            >
              {type === "Edit" && !isAdmin && (
                <h1 className="font-bold text-slate-900 self-start">
                  Edit Student's Information
                </h1>
              )}
              <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
                <div className="flex-1">
                  <AdminInputFieldWrapper isEmpty={emptyFirstName}>
                    <NormalTextField
                      text={firstName}
                      onChange={onChangeFirstName}
                      isInvalid={emptyFirstName}
                      placeholder="First Name"
                    />
                  </AdminInputFieldWrapper>
                </div>

                <div className="flex-1">
                  <AdminInputFieldWrapper isEmpty={emptyLastName}>
                    <NormalTextField
                      text={lastName}
                      onChange={onChangeLastName}
                      isInvalid={emptyLastName}
                      placeholder="Last Name"
                    />
                  </AdminInputFieldWrapper>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
                <div className="flex-1">
                  <AdminInputFieldWrapper
                    isEmpty={emptyEmail}
                    isInvalid={invalidEmail}
                    invalidMessage="Email already exists."
                  >
                    <NormalTextField
                      text={email}
                      onChange={onChangeEmail}
                      isInvalid={emptyEmail || invalidEmail}
                      placeholder="Email (e.g., john@example.com)"
                    />
                  </AdminInputFieldWrapper>
                </div>
                <div className="flex-1">
                  <AdminInputFieldWrapper isEmpty={emptyPhoneNumber}>
                    <NormalTextField
                      text={phoneNumber}
                      onChange={onChangePhoneNumber}
                      isInvalid={emptyPhoneNumber}
                      placeholder="Phone Number (e.g., 0123456789)"
                    />
                  </AdminInputFieldWrapper>
                </div>
              </div>

              {type === "Add" && (
                <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
                  <div className="flex-1">
                    <AdminInputFieldWrapper isEmpty={emptyPassword}>
                      <PasswordTextField
                        password={password}
                        onChange={onChangePassword}
                        invalidPassword={emptyPassword}
                        placeholder="Password"
                      />
                    </AdminInputFieldWrapper>
                    {!isPasswordMatched && (
                      <p className="text-red-500 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <AdminInputFieldWrapper isEmpty={emptyConfirmPassword}>
                      <PasswordTextField
                        password={confirmPassword}
                        onChange={onChangeConfirmPassword}
                        invalidPassword={emptyConfirmPassword}
                        placeholder="Confirm Password"
                      />
                    </AdminInputFieldWrapper>
                  </div>
                </div>
              )}

              {!isAdmin && (
                <>
                  <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
                    <div className="flex-1">
                      <SingleFilter
                        placeholder="Select Student Status"
                        options={statusOptions}
                        value={status}
                        isInvalid={emptyStatus}
                        onChange={onChangeStatus}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
                <MediumButton
                  buttonText={
                    type === "Edit" ? "Save Changes" : "Create New Student"
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
                  link="/admin/users"
                />
              </div>
            </form>
          )}

          {!isAdmin && type === "Edit" && activeTab === "Course History" && (
            <>
              <form
                onSubmit={handleSubmitCourse}
                className="gap-y-8 flex flex-col justify-center items-center"
              >
                <h1 className="font-bold text-slate-900 self-start">
                  Edit Student's Course
                </h1>
                <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
                  <div className="flex-1">
                    <AdminInputFieldWrapper
                      isEmpty={emptyProgramme}
                      isInvalid={isStudentCourseProgrammeIntakeExist}
                      invalidMessage="Please Select a Different Programme"
                    >
                      <SingleFilter
                        placeholder="Select Student Programme"
                        value={programme}
                        options={programmeOptions}
                        isInvalid={
                          emptyProgramme || isStudentCourseProgrammeIntakeExist
                        }
                        onChange={onChangeProgramme}
                      />
                    </AdminInputFieldWrapper>
                  </div>
                  <div className="flex-1">
                    <AdminInputFieldWrapper
                      isEmpty={emptyCourse}
                      isInvalid={isStudentCourseProgrammeIntakeExist}
                      invalidMessage="Please Select a Different Course"
                    >
                      <SingleFilter
                        placeholder="Select Student Course"
                        value={course}
                        options={courseOptions}
                        isInvalid={
                          emptyCourse || isStudentCourseProgrammeIntakeExist
                        }
                        onChange={onChangeCourse}
                      />
                    </AdminInputFieldWrapper>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
                  <div className="flex-1">
                    <AdminInputFieldWrapper
                      isEmpty={emptyProgrammeIntake}
                      isInvalid={isStudentCourseProgrammeIntakeExist}
                      invalidMessage="Please Select a Different Intake"
                    >
                      <SingleFilter
                        placeholder="Select Student Intake"
                        value={programmeIntake}
                        options={programmeIntakeOptions}
                        isInvalid={
                          emptyProgrammeIntake ||
                          isStudentCourseProgrammeIntakeExist
                        }
                        onChange={onChangeProgrammeIntake}
                      />
                    </AdminInputFieldWrapper>
                  </div>
                </div>

                <div className="justify-center flex mt-10 gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
                  <MediumButton
                    buttonText="Save Changes"
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
                    link="/admin/users"
                  />
                </div>
              </form>

              <div className="flex flex-col w-xs sm:w-5xl gap-x-10">
                <h1 className="font-bold text-slate-900">
                  Student's Course History
                </h1>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white mt-4">
                  <div className="h-75 overflow-y-auto">
                    <table className="min-w-full text-left rounded-4xl">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr className="text-sm">
                          <th className="px-6 py-4 font-medium">Course</th>
                          <th className="px-6 py-4 font-medium">Programme</th>
                          <th className="px-6 py-4 font-medium">
                            Intake - Semester
                          </th>
                          <th className="px-6 py-4 font-medium">
                            Semester Period
                          </th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {studentCoursesHistory.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center py-6 text-gray-500"
                            >
                              No course history found.
                            </td>
                          </tr>
                        ) : (
                          studentCoursesHistory.map(
                            (student: StudentCourseProgrammeIntake) => (
                              <tr
                                key={`${student.studentId}`}
                                className="text-sm"
                              >
                                <td className="px-6 py-5">
                                  {student.courseName}
                                </td>
                                <td className="px-6 py-5">
                                  {student.programmeName}
                                </td>
                                <td className="px-6 py-5">
                                  {student.intakeId} - {student.semester}
                                </td>
                                <td className="px-6 py-5">
                                  {new Date(
                                    student.semesterStartDate,
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    student.semesterEndDate,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5">
                                  {getStatusBadge(student.status)}
                                </td>
                                <td className="px-6 py-5 text-slate-500 text-center">
                                  <button
                                    onClick={() =>
                                      handleDeleteStudentCourseProgrammeIntake(
                                        student.courseId,
                                        student.programmeIntakeId,
                                      )
                                    }
                                    className="text-red-tomato hover:text-red-600 cursor-pointer"
                                  >
                                    <Trash2
                                      size={16}
                                      className="inline-block ml-1"
                                    />
                                  </button>
                                </td>
                              </tr>
                            ),
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {!isAdmin && activeTab === "Enroll in Subjects" && (
            <form
              onSubmit={handleSubmitEnrollmentSubjectTypes}
              className="gap-y-8 flex flex-col justify-center items-center"
            >
              <h1 className="font-bold text-slate-900 self-start">
                Edit Student's Subjects
              </h1>
              <div className="flex flex-col xl:flex-row w-xs sm:w-xl md:w-2xl lg:w-4xl xl:w-6xl gap-x-10 gap-y-8 xl:gap-y-0">
                <div className="flex-1">
                  <AdminInputFieldWrapper
                    isEmpty={emptyEnrollmentSubjectTypes}
                    isInvalid={isEnrollmentSubjectTypeTimeClashed}
                    invalidMessage="Time clash detected with selected subjects."
                  >
                    <MultiFilter
                      placeholder="Select a Subject to Enroll"
                      options={enrollmentSubjectTypesOptions}
                      value={enrollmentSubjectTypes}
                      isInvalid={
                        emptyEnrollmentSubjectTypes ||
                        isEnrollmentSubjectTypeTimeClashed
                      }
                      onChange={onChangeEnrollmentSubjectTypes}
                    />
                  </AdminInputFieldWrapper>
                </div>
              </div>

              <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
                <MediumButton
                  buttonText="Save Changes"
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
                  link="/admin/users"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
