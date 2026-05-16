import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { MultiValue, SingleValue } from "react-select";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogTrigger, Modal, ModalOverlay, Button, Form } from "react-aria-components";
import { useAdmin } from "../hooks/useAdmin";

import LoadingOverlay from "@components/LoadingOverlay";
import NormalTextField from "@components/NormalTextField";
import PasswordTextField from "@components/PasswordTextField";
import SingleFilter from "@components/SingleFilter";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";

import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { StudentEnrollmentSubject } from "@datatypes/enrollmentType";
import type { Programme, ProgrammeIntake } from "@datatypes/programmeType";
import type { Course } from "@datatypes/courseType";
import type { StudentCourseProgrammeIntake, } from "@datatypes/userType";

import { MultiFilter } from "@components/MultiFilter";
import SmallButton from "@components/SmallButton";

import {
  createStudentAPI, createStudentCourseProgrammeIntakeAPI, deleteStudentCourseProgrammeIntakeAPI, getStudentByIdAPI,
  getStudentProgrammeHistoryAPI, getStudentsTimetableByIdAPI, updateStudentByIdAPI,
  updateStudentCourseProgrammeIntakeAPI
} from "../api/students";
import { getAdminByIdAPI, updateAdminByIdAPI } from "../api/admins";
import { getAllProgrammesAPI, getProgrammeIntakesByProgrammeIdAPI } from "../api/programmes";
import { getCoursesByProgrammeIdAPI } from "../api/courses";
import { createStudentEnrollmentSubjectTypesByStudentIdAPI, getEnrollmentSubjectByStudentIdAPI } from "../api/enrollments";

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

  const USERSTATUSOPTIONS: reactSelectOptionType[] = [
    { value: 0, label: "All" },
    { value: 1, label: "Active" },
    { value: 2, label: "Completed" },
    { value: 3, label: "Finished" },
    { value: 4, label: "Dropped" },
    { value: 5, label: "Upcoming" },
  ];

  // const USERSTATUSOPTIONS: reactSelectOptionType[] = [
  //   { value: 0, label: "Inactive" },
  //   { value: 1, label: "Active" },
  // ];

  const STUDENTCOURSEPROGRAMMEINTAKESTATUSOPTIONS: reactSelectOptionType[] = [
    { value: 1, label: "Active" },
    { value: 2, label: "Completed" },
    { value: 3, label: "Dropped" },
    { value: 4, label: "Upcoming" },
  ];



  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userStatus, setUserStatus] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
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

  const [studentCourseProgrammeIntakeStatus, setStudentCourseProgrammeIntakeStatus] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });

  const [updateStudentCourseProgrammeIntakeStatus, setUpdateStudentCourseProgrammeIntakeStatus] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });

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

  const [enrollmentSubjectTypesOptions, setEnrollmentSubjectTypesOptions] =
    useState<reactSelectOptionType[]>([]);


  const [emptyFirstName, setEmptyFirstName] = useState(false);
  const [emptyLastName, setEmptyLastName] = useState(false);
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [emptyPhoneNumber, setEmptyPhoneNumber] = useState(false);
  const [emptyUserStatus, setEmptyUserStatus] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [emptyConfirmPassword, setEmptyConfirmPassword] = useState(false);
  const [emptyProgramme, setEmptyProgramme] = useState(false);
  const [emptyCourse, setEmptyCourse] = useState(false);
  const [emptyProgrammeIntake, setEmptyProgrammeIntake] = useState(false);
  const [emptyStudentCourseProgrammeIntakeStatus, setEmptyStudentCourseProgrammeIntakeStatus] = useState(false);
  const [emptyUpdateStudentCourseProgrammeIntakeStatus, setEmptyUpdateStudentCourseProgrammeIntakeStatus] = useState(false);


  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidEmailFormat, setInvalidEmailFormat] = useState(false);
  const [isStudentCourseProgrammeIntakeExist, setIsStudentCourseProgrammeIntakeExist] = useState(false);
  const [isUpdateStudentCourseProgrammeIntakeActiveExist, setIsUpdateStudentCourseProgrammeIntakeActiveExist] = useState(false);
  const [isEnrollmentSubjectTypesScheduleClashed, setIsEnrollmentSubjectTypesScheduleClashed] = useState(false);

  const [isPasswordMatched, setIsPasswordMatched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("Student Information");

  const [enrollmentSubjectTypesScheduleClashed, setEnrollmentSubjectTypesScheduleClashed] = useState<string[]>([]);

  const navigate = useNavigate();
  const skipReset = useRef(false);
  const [searchParams] = useSearchParams();
  const isAdmin: boolean = searchParams.get("admin") === "true";

  const { authToken, admin, loading } = useAdmin();



  useEffect(() => {
    const setupEditStudentForm = async (token: string, studentId: number) => {
      if (activeTab === "Student Information") {
        await setupStudentInformationTab(token, studentId);
      } else if (activeTab === "Course History") {
        await setupCourseHistoryTab(token, studentId);
      } else if (activeTab === "Enroll in Subjects") {
        await setupEnrollSubjectsTab(token, studentId);
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
      setUserStatus({
        value: data.userStatusId,
        label: data.userStatus,
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

  async function setupStudentInformationTab(token: string, studentId: number) {
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
    setUserStatus({
      value: data.userStatusId,
      label: data.userStatus,
    });
  }

  async function setupCourseHistoryTab(token: string, studentId: number) {
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

    // ??? WHAT IS THIS!?
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
  }

  async function setupEnrollSubjectsTab(token: string, studentId: number) {
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

      // TODO: WHAT IS THIS!?
      if (enrollmentSubjectTypesResponse?.status === 404) {
        toast.error("No enrollment at the moment");
        return;
      } else {
        toast.error("Failed to fetch student enrollment subjects");
        return;
      }
    }

    const enrollmentSubjectTypesJson = await enrollmentSubjectTypesResponse.json();
    const enrolledSubjectsResponseJson = await enrolledSubjectsResponse.json();
    const enrollmentSubjectTypesData: StudentEnrollmentSubject[] = await enrollmentSubjectTypesJson.data.enrollmentSubjectTypes;
    const enrolledSubjectsResponseData: StudentEnrollmentSubject[] = enrolledSubjectsResponseJson.data.timetable;

    const enrollmentSubjectTypesOptions: { value: number; label: string }[] = [];
    for (const enrollmentSubjectType of enrollmentSubjectTypesData) {
      enrollmentSubjectTypesOptions.push({
        value: enrollmentSubjectType.enrollmentSubjectTypeId, label:
          enrollmentSubjectType.subjectCode +
          " " +
          enrollmentSubjectType.subjectName +
          " (CH: " +
          enrollmentSubjectType.creditHours +
          ")" +
          " - " +
          enrollmentSubjectType.classType +
          " • " +
          (enrollmentSubjectType.lecturerTitle === "None"
            ? ""
            : enrollmentSubjectType.lecturerTitle + " ") +
          enrollmentSubjectType.lecturerLastName +
          " " +
          enrollmentSubjectType.lecturerFirstName +
          " - " +
          enrollmentSubjectType.day +
          " " +
          enrollmentSubjectType.startTime +
          "-" +
          enrollmentSubjectType.endTime +
          " • Group " +
          enrollmentSubjectType.grouping +
          ""
      })
    }

    setEnrollmentSubjectTypesOptions(enrollmentSubjectTypesOptions);
    const enrolledSubjects: { value: number; label: string }[] = [];
    for (const enrolledSubject of enrolledSubjectsResponseData) {
      enrolledSubjects.push({
        value: enrolledSubject.enrollmentSubjectTypeId,
        label:
          enrolledSubject.subjectCode +
          " " +
          enrolledSubject.subjectName +
          " (CH: " +
          enrolledSubject.creditHours +
          ")" +
          " - " +
          enrolledSubject.classType +
          " • " +
          (enrolledSubject.lecturerTitle === "None"
            ? ""
            : enrolledSubject.lecturerTitle + " ") +
          enrolledSubject.lecturerFirstName +
          " " +
          enrolledSubject.lecturerLastName +
          " - " +
          enrolledSubject.day +
          " " +
          enrolledSubject.startTime +
          "-" +
          enrolledSubject.endTime +
          " • Group " +
          enrolledSubject.grouping +
          ""
      })
    }

    setEnrollmentSubjectTypes(enrolledSubjects);
  }

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
            <p>
              {status}
            </p>
          </span>
        );
      case "Dropped":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
            <p>
              {status}
            </p>
          </span>
        );
      case "Completed":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
            <p>
              {status}
            </p>
          </span>
        );
      default:
        return <p>{status}</p>;
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
        userStatus.value,
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
          userStatus.value,
        );
      }
    } else {
      navigate("/admin/users");
      return;
    }

    // TODO: 500?
    if (response) {
      if (response.status === 409) {
        setIsLoading(false);
        setInvalidEmail(true);
        toast.error("Email already exist!");
        return;
      } else if (response.status === 400) {
        const data = await response.json();
        if (data.message === "Invalid email format") {
          setIsLoading(false);
          setInvalidEmailFormat(true);
          return;
        }
      } else if (response.ok) {
        setIsLoading(false);
        navigate("/admin/users");
        toast.success(
          `${type === "Add" ? "Created new" : "Updated"} ${isAdmin ? "Admin" : "Student"
          }`,
        );
        return;
      }

    }

    navigate("/admin/users");
    toast.error(
      `Failed to ${type === "Add" ? "Create new" : "Update"} ${isAdmin ? "Admin" : "Student"
      }`,
    );
    return;
  }

  async function handleSubmitCourse(e: FormEvent<HTMLFormElement>, close: () => void) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (setCourseEmptyInputs()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const response: Response | undefined =
      await createStudentCourseProgrammeIntakeAPI(
        authToken as string,
        id,
        course.value,
        programmeIntake.value,
        studentCourseProgrammeIntakeStatus.value
      );

    // TODO: 500?
    if (response) {
      if (response.status === 409) {
        setIsStudentCourseProgrammeIntakeExist(true);
        setIsLoading(false);
        toast.error("Course existed");
        return;
      } else if (response.ok) {
        setIsStudentCourseProgrammeIntakeExist(false);
        setIsLoading(false);
        setupCourseHistoryTab(authToken, id);
        close();
        toast.success("Updated student's course");
        return;
      }
    }

    navigate("/admin/users");
    toast.error(
      `Failed to add course`,
    );
  }

  async function handleUpdateCourse(e: FormEvent<HTMLFormElement>, close: () => void, studentId: number, courseId: number, programmeIntakeId: number) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyUpdateStudentCourseProgrammeIntakeStatus) {
      setIsLoading(false);
      return;
    }

    if (!updateStudentCourseProgrammeIntakeStatus.value || updateStudentCourseProgrammeIntakeStatus.value === -1) {
      setEmptyStudentCourseProgrammeIntakeStatus(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // TODO: HERE the ids
    const response: Response | undefined =
      await updateStudentCourseProgrammeIntakeAPI(
        authToken as string,
        studentId,
        courseId,
        programmeIntakeId,
        updateStudentCourseProgrammeIntakeStatus.value
      );

    // TODO: 500?
    if (response) {
      if (response.status === 409) {
        setIsUpdateStudentCourseProgrammeIntakeActiveExist(true);
        setIsLoading(false);
        const data = await response.json();
        toast.error(data.message);
        return;
      } else if (response.ok) {
        setIsUpdateStudentCourseProgrammeIntakeActiveExist(false);
        setIsLoading(false);
        setupCourseHistoryTab(authToken, id);
        close();
        toast.success("Updated student's course");
        return;
      }
    }
    navigate("/admin/users");
    toast.error(
      `Failed to update course`,
    );
  }

  async function handleSubmitEnrollmentSubjectTypes(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    // if (emptyEnrollmentSubjectTypes) {
    //   setIsLoading(false);
    //   return;
    // }

    // if (setEnrollmentSubjectTypesEmptyInputs()) {
    //   setIsLoading(false);
    //   return;
    // }

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
      // TODO: FIX CLASHING!!!
      const data = await response.json();

      const message = data.message;

      const clashedIds = JSON.parse(message.slice(message.indexOf('['), message.lastIndexOf(']') + 1));

      const clashedLabels: string[] = clashedIds
        .map((id: number) => {
          const option = enrollmentSubjectTypesOptions.find((est) => est.value === id);
          return option ? option.label : null;
        })
        .filter(Boolean) as string[];

      if (clashedLabels.length === 0) {
        clashedLabels.push("Unknown Subjects");
      }

      setIsEnrollmentSubjectTypesScheduleClashed(true);
      setIsLoading(false);
      setEnrollmentSubjectTypesScheduleClashed(clashedLabels);
      return;
    } else {
      setIsEnrollmentSubjectTypesScheduleClashed(false);
      setEnrollmentSubjectTypesScheduleClashed([]);
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
      setupCourseHistoryTab(authToken, id);
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

    if (userStatus.value === -1) {
      setEmptyUserStatus(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function setCourseEmptyInputs() {
    let emptyInput: boolean = false;


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

    if (!studentCourseProgrammeIntakeStatus.value || studentCourseProgrammeIntakeStatus.value === -1) {
      setEmptyStudentCourseProgrammeIntakeStatus(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  // function setEnrollmentSubjectTypesEmptyInputs() {
  //   let emptyInput: boolean = false;

  //   if (!enrollmentSubjectTypes.values || enrollmentSubjectTypes.length === 0) {
  //     setEmptyEnrollmentSubjectTypes(true);
  //     emptyInput = true;
  //   }

  //   return emptyInput;
  // }

  function onChangeUserStatus(userStatus: SingleValue<reactSelectOptionType>) {
    if (!userStatus) {
      return;
    }
    setUserStatus(userStatus);
    setEmptyUserStatus(false);
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
      setInvalidEmailFormat(false);
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

  function onChangeProgramme(onChangeProgramme: SingleValue<reactSelectOptionType>) {
    if (!onChangeProgramme) {
      return;
    }

    setEmptyProgramme(false);

    if (onChangeProgramme.value === programme.value) {
      return;
    }

    setIsStudentCourseProgrammeIntakeExist(false);
    setProgramme(onChangeProgramme);
    setCourseOptions([]);
    setProgrammeIntakeOptions([]);
  }

  function onChangeCourse(onChangeCourse: SingleValue<reactSelectOptionType>) {
    if (!onChangeCourse) {
      return;
    }

    if (onChangeCourse.value !== course.value) {
      setIsStudentCourseProgrammeIntakeExist(false);
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

    if (onChangeProgrammeIntake.value !== programmeIntake.value) {
      setIsStudentCourseProgrammeIntakeExist(false);
    }

    setProgrammeIntake(onChangeProgrammeIntake);
    setEmptyProgrammeIntake(false);
  }

  function onChangeStudentCourseProgrammeIntakeStatus(studentCourseProgrammeIntakeStatus: SingleValue<reactSelectOptionType>) {
    if (!studentCourseProgrammeIntakeStatus) {
      return;
    }
    setStudentCourseProgrammeIntakeStatus(studentCourseProgrammeIntakeStatus);
    setEmptyStudentCourseProgrammeIntakeStatus(false);
  }

  function onChangeUpdateStudentCourseProgrammeIntakeStatus(updateStudentCourseProgrammeIntakeStatus: SingleValue<reactSelectOptionType>) {
    if (!updateStudentCourseProgrammeIntakeStatus) {
      return;
    }
    setUpdateStudentCourseProgrammeIntakeStatus(updateStudentCourseProgrammeIntakeStatus);
    setEmptyUpdateStudentCourseProgrammeIntakeStatus(false);
    setIsUpdateStudentCourseProgrammeIntakeActiveExist(false);
  }

  function onChangeEnrollmentSubjectTypes(
    onChangeEnrollmentSubjectTypes: MultiValue<reactSelectOptionType>,
  ) {
    const onChangeEnrollmentSubjectTypesValues: reactSelectOptionType[] = [];
    // if (onChangeEnrollmentSubjectTypes.length !== 0) {
    //   setEmptyEnrollmentSubjectTypes(false);
    // }
    for (let i = 0; i < onChangeEnrollmentSubjectTypes.length; i++) {
      onChangeEnrollmentSubjectTypesValues.push(
        onChangeEnrollmentSubjectTypes[i],
      );
    }
    setEnrollmentSubjectTypes(onChangeEnrollmentSubjectTypesValues);
  }

  function closeEnrollCourseModal() {
    setProgramme({ value: -1, label: "" });
    setCourse({ value: -1, label: "" });
    setProgrammeIntake({ value: -1, label: "" });
    setStudentCourseProgrammeIntakeStatus({ value: -1, label: "" });

    setProgrammeOptions([]);
    setCourseOptions([]);
    setProgrammeIntakeOptions([]);
  }

  function openUpdateCourseModal(studentCourseProgrammeIntakeStatusId: number) {
    const option = STUDENTCOURSEPROGRAMMEINTAKESTATUSOPTIONS.find(
      (option) => option.value === studentCourseProgrammeIntakeStatusId
    );

    if (option) {
      setUpdateStudentCourseProgrammeIntakeStatus(option);
    } else {
      navigate("/admin/users");
      toast.error(
        `Failed to update course`,
      );
    }
  }

  function closeUpdateCourseModal() {
    setUpdateStudentCourseProgrammeIntakeStatus({value: -1, label: ""});
    setIsUpdateStudentCourseProgrammeIntakeActiveExist(false);
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

    const options = data
      .filter((programmeIntake: ProgrammeIntake) =>
        !studentCoursesHistory.some(
          (history) => history.programmeIntakeId === programmeIntake.programmeIntakeId
        )
      )
      .map((programmeIntake: ProgrammeIntake) => ({
        value: programmeIntake.programmeIntakeId,
        label: programmeIntake.intakeId + " - Semester " + programmeIntake.semester,
      }));

    setProgrammeIntakeOptions(options);
  }

  return (
    <section className="mx-auto max-w-5xl">
      {isLoading && <LoadingOverlay />}
      {/* Header */}
      <div>
        <h1 className="font-bold text-slate-900">
          {type === "Edit" ? "Edit" : "Create New"}{" "}
          {!isAdmin ? "Student" : "Admin"}
          {type === "Edit" &&
            !isAdmin &&
            activeTab === "Student Information" &&
            "'s Information"}
          {type === "Edit" &&
            !isAdmin &&
            activeTab === "Course History" &&
            "'s Course"}
          {type === "Edit" &&
            !isAdmin &&
            activeTab === "Enroll in Subjects" &&
            "'s Subjects"}
        </h1>

        {type === "Edit" ? (
          <p className="mt-1 text-slate-400">
            {`Make changes to the ${!isAdmin ? "student's" : "admin's"} ${activeTab === "Student Information" ? "personal information" : activeTab === "Course History" ? "course history" : activeTab === "Enroll in Subjects" ? "enrolled subjects" : ""} below.`}
          </p>
        ) : (
          <p className="mt-1 text-slate-400">
            Create a new student by filling in the form below.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border mt-4 shadow-lg">
        <div className="flex flex-col w-full">
          {type == "Edit" && !isAdmin && (
            <div className="flex space-x-8 border-b border-gray-300 mt-4 px-8">
              {tabs.map(
                (
                  role:
                    | "Student Information"
                    | "Course History"
                    | "Enroll in Subjects",
                ) => (
                  <button
                    key={role}
                    className={`pb-2 font-semibold cursor-pointer text-sm ${activeTab === role
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

        {activeTab === "Student Information" && (
          <form
            onSubmit={handleSubmitUser}
            className="py-10 px-8 gap-y-8 flex flex-col"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <AdminInputFieldWrapper isEmpty={emptyFirstName}>
                <NormalTextField
                  text={firstName}
                  onChange={onChangeFirstName}
                  isInvalid={emptyFirstName}
                  placeholder="First Name"
                  maxWidth="max-w-full"
                />
              </AdminInputFieldWrapper>

              <AdminInputFieldWrapper isEmpty={emptyLastName}>
                <NormalTextField
                  text={lastName}
                  onChange={onChangeLastName}
                  isInvalid={emptyLastName}
                  placeholder="Last Name"
                  maxWidth="max-w-full"
                />
              </AdminInputFieldWrapper>

              <AdminInputFieldWrapper
                isEmpty={emptyEmail}
                isInvalid={invalidEmail || invalidEmailFormat}
                invalidMessage={invalidEmail ? "Email already exists." : invalidEmailFormat ? "Invalid Email format." : ""}>
                <NormalTextField
                  text={email}
                  onChange={onChangeEmail}
                  isInvalid={emptyEmail || invalidEmail || invalidEmailFormat}
                  placeholder="Email (e.g., john@example.com)"
                  maxWidth="max-w-full"
                />
              </AdminInputFieldWrapper>

              <AdminInputFieldWrapper isEmpty={emptyPhoneNumber}>
                <NormalTextField
                  text={phoneNumber}
                  onChange={onChangePhoneNumber}
                  isInvalid={emptyPhoneNumber}
                  placeholder="Phone Number (e.g., 0123456789)"
                  maxWidth="max-w-full"
                />
              </AdminInputFieldWrapper>

              {type === "Add" && (
                <>
                  <AdminInputFieldWrapper isEmpty={emptyPassword}>
                    <PasswordTextField
                      password={password}
                      onChange={onChangePassword}
                      invalidPassword={emptyPassword}
                      placeholder="Password"
                      maxWidth="max-w-full"
                    />
                    {!isPasswordMatched && (
                      <p className="text-red-500 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </AdminInputFieldWrapper>

                  <AdminInputFieldWrapper isEmpty={emptyConfirmPassword}>
                    <PasswordTextField
                      password={confirmPassword}
                      onChange={onChangeConfirmPassword}
                      invalidPassword={emptyConfirmPassword}
                      placeholder="Confirm Password"
                      maxWidth="max-w-full"
                    />
                  </AdminInputFieldWrapper>
                </>
              )}

              {!isAdmin && (
                <div className="md:col-span-2">
                  <AdminInputFieldWrapper isEmpty={emptyUserStatus}>
                    <SingleFilter
                      placeholder="Select Student Status"
                      options={USERSTATUSOPTIONS}
                      value={userStatus}
                      isInvalid={emptyUserStatus}
                      onChange={onChangeUserStatus}
                      maxWidth="max-w-full"
                    />
                  </AdminInputFieldWrapper>
                </div>
              )}
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <SmallButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Student"
                }
                submit={true}
                backgroundColor="bg-blue-500"
                hoverBgColor="hover:bg-blue-600"
                textColor="text-white"
              />
              <SmallButton
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
          <div className="pb-10 pt-4 px-8 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-900 self-start">
                Student's Course Enrollment
              </h2>
              <DialogTrigger onOpenChange={(isOpen) => {
                if (!isOpen) closeEnrollCourseModal();
              }}>
                <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
                  <Button onClick={() => { getAllProgrammes(authToken); }}
                    className="font-nunito-sans px-4 py-2 bg-blue-500 text-white font-bold text-base flex gap-x-2 justify-center items-center rounded-sm hover:bg-blue-600 cursor-pointer"
                  >
                    Create New Enrollment
                  </Button>
                </div>
                <ModalOverlay isDismissable
                  className={({ isEntering, isExiting }) => `
                              fixed inset-0 w-full min-h-screen z-20 bg-black/50 isolate flex flex-col justify-center
                              ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                              ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                              `}>
                  <Modal
                    className={({ isEntering, isExiting }) => `
                                flex flex-col max-h-screen overflow-auto pointer-events-none mx-6
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                              `}>
                    <Dialog
                      className="bg-white rounded-2xl flex flex-col mx-auto pointer-events-auto"
                    >
                      {({ close }) => (
                        <Form
                          onSubmit={(e) => { handleSubmitCourse(e, close) }}
                          className="pb-10 pt-4 px-8 flex flex-col justify-center items-center"
                        >
                          <div className="flex flex-col items-center text-black gap-y-8 p-8">
                            <div className="flex flex-col items-center gap-y-2">
                              <h2 className="font-bold">Enroll Student's Course</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 w-xl mt-4">
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

                              <AdminInputFieldWrapper
                                isEmpty={emptyStudentCourseProgrammeIntakeStatus}
                                invalidMessage="Please Select a Different Programme Status"
                              >
                                <SingleFilter
                                  placeholder="Select Programme Status"
                                  value={studentCourseProgrammeIntakeStatus}
                                  options={STUDENTCOURSEPROGRAMMEINTAKESTATUSOPTIONS}
                                  isInvalid={
                                    emptyStudentCourseProgrammeIntakeStatus
                                  }
                                  onChange={onChangeStudentCourseProgrammeIntakeStatus}
                                />
                              </AdminInputFieldWrapper>

                            </div>

                            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0 mt-6">


                              <Button
                                className="font-nunito-sans px-4 py-2 bg-blue-500 text-white font-bold text-base flex gap-x-2 justify-center items-center rounded-sm hover:bg-blue-600 cursor-pointer"
                                type="submit"
                              >Save Changes
                              </Button>

                              <Button slot="close"
                                className="font-nunito-sans px-4 py-2 bg-slate-400 text-white font-bold text-base flex gap-x-2 justify-center items-center rounded-sm hover:bg-slate-600 cursor-pointer"
                              >
                                Cancel
                              </Button>

                            </div>

                          </div>
                        </Form>
                      )}
                    </Dialog>
                  </Modal>
                </ModalOverlay>

              </DialogTrigger>


            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white mt-4">
              <div className="h-128 overflow-y-auto">
                <table className="w-full text-left rounded-4x table-fixed">
                  <thead className="bg-blue-alice text-slate-500 border-b border-slate-100">
                    <tr className="text-sm">
                      <th className="px-6 py-4 font-medium w-2/7">Course</th>
                      <th className="px-6 py-4 font-medium">Programme</th>
                      <th className="px-6 py-4 font-medium w-27">
                        Intake
                      </th>
                      <th className="px-6 py-4 font-medium w-27">
                        Semester
                      </th>
                      <th className="px-6 py-4 font-medium">
                        Semester Period
                      </th>
                      <th className="px-6 py-4 font-medium w-32">Status</th>
                      <th className="px-6 py-4 font-medium w-22">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
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
                          <tr key={student.studentId + student.courseId + student.programmeIntakeId}
                            className="text-sm border-b border-slate-100"
                          >
                            <td className="px-6 py-5">
                              {student.courseName}
                            </td>
                            <td className="px-6 py-5">
                              {student.programmeName}
                            </td>
                            <td className="px-6 py-5">
                              {student.intakeId}
                            </td>
                            <td className="px-6 py-5">
                              {student.semester}
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
                              <div className="flex gap-x-2 items-center">
                                {getStatusBadge(student.studentCourseProgrammeIntakeStatus)}
                                <DialogTrigger onOpenChange={(isOpen) => {
                                  if (isOpen) {openUpdateCourseModal(student.studentCourseProgrammeIntakeStatusId)} else {
                                    closeUpdateCourseModal()
                                  };
                                }}>
                                  <Button>
                                    <Pencil size={16} className="cursor-pointer text-gray-500 hover:text-gray-700" />
                                  </Button>
                                  <ModalOverlay isDismissable
                                    className={({ isEntering, isExiting }) => `
                              fixed inset-0 w-full min-h-screen z-20 bg-black/50 isolate flex flex-col justify-center
                              ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                              ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                              `}>
                                    <Modal
                                      className={({ isEntering, isExiting }) => `
                                flex flex-col max-h-screen overflow-auto pointer-events-none mx-6
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                              `}>
                                      <Dialog
                                        className="bg-white rounded-2xl flex flex-col mx-auto pointer-events-auto w-2xl"
                                      >
                                        {({ close }) => (
                                          <Form
                                            onSubmit={(e) => { handleUpdateCourse(e, close, student.studentId, student.courseId, student.programmeIntakeId) }}
                                            className="pb-10 pt-4 px-8 flex flex-col justify-center items-center"
                                          >

                                            <div className="flex flex-col items-center text-black gap-y-8 p-8">
                                              <div className="flex flex-col items-center gap-y-2">
                                                <h2 className="font-bold">Edit Student's Course</h2>
                                              </div>

                                              <div className="grid grid-cols-[auto_1fr] gap-y-4 gap-x-4">
                                                <p className="font-bold">COURSE:</p>
                                                <p className="font-bold text-slate-500">{student.courseName}</p>
                                                <p className="font-bold">PROGRAMME:</p>
                                                <p className="font-bold text-slate-500">{student.programmeName}</p>
                                                <p className="font-bold">INTAKE:</p>
                                                <p className="font-bold text-slate-500">{student.intakeId}</p>
                                                <p className="font-bold">SEMESTER:</p>
                                                <p className="font-bold text-slate-500">{student.semester}</p>
                                                <p className="font-bold">SEMESTER PERIOD:</p>
                                                <p className="font-bold text-slate-500">{new Date(
                                                  student.semesterStartDate,
                                                ).toLocaleDateString()}{" "}
                                                  -{" "}
                                                  {new Date(
                                                    student.semesterEndDate,
                                                  ).toLocaleDateString()}
                                                </p>
                                                <p className="font-bold self-center">STATUS:</p>
                                                <AdminInputFieldWrapper
                                                  isEmpty={emptyUpdateStudentCourseProgrammeIntakeStatus}
                                                  isInvalid={isUpdateStudentCourseProgrammeIntakeActiveExist}
                                                  invalidMessage="Please Select a Different Programme Status"
                                                >
                                                  <SingleFilter
                                                    placeholder="Update Programme Status"
                                                    value={updateStudentCourseProgrammeIntakeStatus}
                                                    options={STUDENTCOURSEPROGRAMMEINTAKESTATUSOPTIONS}
                                                    isInvalid={
                                                      emptyUpdateStudentCourseProgrammeIntakeStatus || isUpdateStudentCourseProgrammeIntakeActiveExist
                                                    }
                                                    onChange={onChangeUpdateStudentCourseProgrammeIntakeStatus}
                                                    maxWidth="max-w-full"
                                                    animation={false}
                                                  />
                                                </AdminInputFieldWrapper>
                                              </div>

                                              <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0 mt-6">

                                                <Button
                                                  className="font-nunito-sans px-4 py-2 bg-blue-500 text-white font-bold text-base flex gap-x-2 justify-center items-center rounded-sm hover:bg-blue-600 cursor-pointer"
                                                  type="submit"
                                                >Save Changes
                                                </Button>

                                                <Button slot="close"
                                                  className="font-nunito-sans px-4 py-2 bg-slate-400 text-white font-bold text-base flex gap-x-2 justify-center items-center rounded-sm hover:bg-slate-600 cursor-pointer"
                                                >
                                                  Cancel
                                                </Button>

                                              </div>

                                            </div>
                                          </Form>
                                        )}
                                      </Dialog>
                                    </Modal>
                                  </ModalOverlay>

                                </DialogTrigger>
                              </div>
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
        )}

        {!isAdmin && activeTab === "Enroll in Subjects" && (
          <form
            onSubmit={handleSubmitEnrollmentSubjectTypes}
            className="pb-10 pt-4 px-8 flex flex-col"
          >
            <h2 className="font-bold text-slate-900">
              Subject Enrollment
            </h2>
            <div className="pt-4">
              <AdminInputFieldWrapper
                isEmpty={false}
                isInvalid={isEnrollmentSubjectTypesScheduleClashed}
                invalidMessage={['Class schedule clash:', ...enrollmentSubjectTypesScheduleClashed]}
              >
                <MultiFilter
                  placeholder="Select a Subject to Enroll"
                  options={enrollmentSubjectTypesOptions}
                  value={enrollmentSubjectTypes}
                  isInvalid={
                    false ||
                    isEnrollmentSubjectTypesScheduleClashed
                  }
                  onChange={onChangeEnrollmentSubjectTypes}
                  maxWidth="max-w-full"
                />
              </AdminInputFieldWrapper>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0 mt-6">
              <SmallButton
                buttonText="Save Changes"
                submit={true}
                backgroundColor="bg-blue-500"
                hoverBgColor="hover:bg-blue-600"
                textColor="text-white"
              />
              <SmallButton
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
    </section >
  );
}
