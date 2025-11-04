import LoadingOverlay from "@components/LoadingOverlay";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { SingleValue } from "react-select";
import {
  createStudentAPI,
  createStudentCourseProgrammeIntakeAPI,
  deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeIdAPI,
  getStudentByIdAPI,
  getStudentCourseProgrammeIntakeByStudentIdAPI,
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
import type { StudentCourseProgrammeIntake } from "@datatypes/userType";
import { Trash2 } from "lucide-react";
import {
  getAllProgrammesAPI,
  getProgrammeIntakesByProgrammeIdAPI,
} from "../api/programmes";
import { getCoursesByProgrammeIdAPI } from "../api/courses";

export default function UserForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
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
    }
  );

  const [studentCoursesHistory, setStudentCoursesHistory] = useState<
    StudentCourseProgrammeIntake[]
  >([]);

  const [programmeOptions, setProgrammeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [courseOptions, setCourseOptions] = useState<reactSelectOptionType[]>(
    []
  );
  const [programmeIntakeOptions, setProgrammeIntakeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const statusOptions: reactSelectOptionType[] = [
    { value: 0, label: "Inactive" },
    { value: 1, label: "Active" },
  ];

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
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [
    isStudentCourseProgrammeIntakeExist,
    setIsStudentCourseProgrammeIntakeExist,
  ] = useState(false);

  const [isPasswordMatched, setIsPasswordMatched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const skipReset = useRef(false);
  const [searchParams] = useSearchParams();
  const isAdmin: boolean = searchParams.get("admin") === "true";

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
        status.value
      );
    } else if (type === "Edit") {
      if (isAdmin) {
        response = await updateAdminByIdAPI(
          authToken as string,
          id,
          firstName,
          lastName,
          email,
          phoneNumber
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
          status.value
        );
      }
    } else {
      navigate("/admin/users");
      return;
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidEmail(true);
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/users");
      return;
    } else {
      navigate("/admin/users");
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
        programmeIntake.value
      );

    if (response?.status === 400) {
      setIsStudentCourseProgrammeIntakeExist(true);
      setIsLoading(false);
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
    return;
  }

  const handleDeleteStudentCourseProgrammeIntake = async (
    courseId: number,
    programmeIntakeId: number
  ) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete course history for Student ID ${id}?`
    );
    if (!confirmDelete) return;

    const response =
      await deleteStudentCourseProgrammeIntakeByStudentIdAndCourseIdAndProgrammeIntakeIdAPI(
        authToken,
        id,
        courseId,
        programmeIntakeId
      );

    if (response && response.ok) {
      navigate("/admin/users");
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
    onChangeProgramme: SingleValue<reactSelectOptionType>
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
    onChangeProgrammeIntake: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeProgrammeIntake) {
      return;
    }
    setProgrammeIntake(onChangeProgrammeIntake);
    setEmptyProgrammeIntake(false);
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
      programmeId
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
    programmeId: number
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

  const setupEditStudentForm = useCallback(
    async (token: string, studentId: number) => {
      const studentCourseProgrammeIntakeResponse: Response | undefined =
        await getStudentCourseProgrammeIntakeByStudentIdAPI(token, studentId);
      const studentResponse: Response | undefined = await getStudentByIdAPI(
        token,
        studentId
      );

      if (!studentCourseProgrammeIntakeResponse?.ok || !studentResponse?.ok) {
        navigate("/admin/users");
        return;
      }

      const studentDataJson = await studentResponse.json();
      const studentData = studentDataJson.data;
      const { data } = await studentCourseProgrammeIntakeResponse.json();

      skipReset.current = true;

      setFirstName(studentData.firstName);
      setLastName(studentData.lastName);
      setEmail(studentData.email);
      setPhoneNumber(studentData.phoneNumber);
      setStatus({
        value: studentData.userStatus ? 1 : 0,
        label: studentData.userStatus ? "Active" : "Inactive",
      });

      // Filter active and history programmes
      const studentCoursesHistory = (data || []).filter(
        (p: StudentCourseProgrammeIntake) => p.courseStatus === 0
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
      setProgrammeIntake(activeProgrammeIntakes[0] || { value: -1, label: "" });
    },
    [navigate]
  );

  const setupEditAdminForm = useCallback(
    async (token: string, adminId: number) => {
      const response: Response | undefined = await getAdminByIdAPI(
        token,
        adminId
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
    },
    [navigate]
  );

  useEffect(() => {
    const token: string = (localStorage.getItem("aZoneAdminAuthToken") ||
      sessionStorage.getItem("aZoneAdminAuthToken")) as string;

    if (!token) {
      navigate("/admin/login");
      return;
    }

    setAuthToken(token);
    getAllProgrammes(token);

    if (type === "Edit" && id > 0) {
      if (isAdmin) {
        setupEditAdminForm(token, id);
      } else {
        setupEditStudentForm(token, id);
      }
    }
  }, [navigate, type, id, setupEditStudentForm, setupEditAdminForm, isAdmin]);

  useEffect(() => {
    if (programme.value <= 0 || !authToken) {
      setCourseOptions([]);
      return;
    }

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
  }, [authToken, programme]);

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
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center gap-y-14">
          <form
            onSubmit={handleSubmitUser}
            className="mt-6 gap-y-8 flex flex-col justify-center items-center"
          >
            <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
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

            <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10  gap-y-8 sm:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptyEmail} isInvalid={invalidEmail} invalidMessage="Email already exists.">
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
              <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
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
                    <p className="text-red-500 mt-1">Passwords do not match</p>
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
                <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
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

            <div className="justify-center flex mt-10 gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
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

          {!isAdmin && type === "Edit" && (
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
                      isEmpty={
                        emptyProgramme || isStudentCourseProgrammeIntakeExist
                      }
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
                      isEmpty={
                        emptyCourse || isStudentCourseProgrammeIntakeExist
                      }
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
                      isEmpty={
                        emptyProgrammeIntake ||
                        isStudentCourseProgrammeIntakeExist
                      }
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
                  <div className="h-[300px] overflow-y-auto">
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
                                    student.semesterStartDate
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    student.semesterEndDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5">
                                  <span
                                    className={`font-bold px-4 py-2 ${
                                      student.courseStatus
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    } rounded-xl`}
                                  >
                                    {student.courseStatus
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-slate-500 text-center">
                                  <button
                                    onClick={() =>
                                      handleDeleteStudentCourseProgrammeIntake(
                                        student.courseId,
                                        student.programmeIntakeId
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
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
