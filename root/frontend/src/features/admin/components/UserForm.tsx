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
  getStudentCourseProgrammeIntakeByStudentIdAPI,
  updateStudentByIdAPI,
} from "../api/students";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { Programme, ProgrammeIntake } from "@datatypes/programmeType";
import type { Course } from "@datatypes/courseType";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import PasswordTextField from "@components/PasswordTextField";
import SingleFilter from "@components/SingleFilter";
import AdminEmptyInput from "@components/admin/AdminEmptyInput";
import { getAdminByIdAPI, updateAdminByIdAPI } from "../api/admins";
import { getAllProgrammesAPI, getProgrammeIntakesByProgrammeIdAPI } from "../api/programmes";
import { getCoursesByProgrammeIdAPI } from "../api/courses";

export default function AdminUserForm({
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
  const [courseStatus, setCourseStatus] = useState<reactSelectOptionType>({
    value: 1,
    label: "Active",
  });
  const statusOptions: reactSelectOptionType[] = [
    { value: 0, label: "Inactive" },
    { value: 1, label: "Active" },
  ];
  const [programmeOptions, setProgrammeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [courseOptions, setCourseOptions] = useState<reactSelectOptionType[]>(
    []
  );
  const [programmeIntakeOptions, setProgrammeIntakeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const courseStatusOptions: reactSelectOptionType[] = [
    { value: 0, label: "Completed" },
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
  const [emptyCourseStatus, setEmptyCourseStatus] = useState(false);

  const [isPasswordMatched, setIsPasswordMatched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const skipReset = useRef(false);
  const [searchParams] = useSearchParams();
  const isAdmin: boolean = searchParams.get("admin") === "true";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      emptyConfirmPassword ||
      emptyProgramme ||
      emptyCourse ||
      emptyProgrammeIntake
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
      response = await createStudentAPI(
        authToken as string,
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        status.value,
        programme.value,
        course.value,
        programmeIntake.value,
        courseStatus.value
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
          status.value,
          programme.value,
          course.value,
          programmeIntake.value,
          courseStatus.value
        );
      }
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/users");
      return;
    }
  }

  function setEmptyInputs(): boolean {
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

    if (!isAdmin) {
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

  function onChangeCourseStatus(
    onChangeCourseStatus: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeCourseStatus) {
      return;
    }
    setCourseStatus(onChangeCourseStatus);
    setEmptyCourseStatus(false);
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

    const options = data.map((programme: Programme) => ({
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
      const response: Response | undefined =
        await getStudentCourseProgrammeIntakeByStudentIdAPI(token, studentId);

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
      setProgramme({
        value: data.programmeId,
        label: data.programmeName,
      });
      setCourse({
        value: data.courseId,
        label: data.courseName,
      });
      setProgrammeIntake({
        value: data.programmeIntakeId,
        label: data.intakeId + " - Semester " + data.semester,
      });
      setCourseStatus({
        value: data.courseStatus,
        label: data.courseStatus === 1 ? "Active" : "Completed",
      });
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
    if (programme.value === 0 || !authToken) {
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
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Student
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the student information below."
              : "Fill in the details below to create a new student."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminEmptyInput isInvalid={emptyFirstName}>
                  <NormalTextField
                    text={firstName}
                    onChange={onChangeFirstName}
                    isInvalid={emptyFirstName}
                    placeholder="First Name"
                  />
                </AdminEmptyInput>
              </div>

              <div className="flex-1">
                <AdminEmptyInput isInvalid={emptyLastName}>
                  <NormalTextField
                    text={lastName}
                    onChange={onChangeLastName}
                    isInvalid={emptyLastName}
                    placeholder="Last Name"
                  />
                </AdminEmptyInput>
              </div>
            </div>

            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminEmptyInput isInvalid={emptyEmail}>
                  <NormalTextField
                    text={email}
                    onChange={onChangeEmail}
                    isInvalid={emptyEmail}
                    placeholder="Email (e.g., john@example.com)"
                  />
                </AdminEmptyInput>
              </div>
              <div className="flex-1">
                <AdminEmptyInput isInvalid={emptyPhoneNumber}>
                  <NormalTextField
                    text={phoneNumber}
                    onChange={onChangePhoneNumber}
                    isInvalid={emptyPhoneNumber}
                    placeholder="Phone Number (e.g., 0123456789)"
                  />
                </AdminEmptyInput>
              </div>
            </div>

            {type === "Add" && (
              <div className="flex w-5xl gap-x-10">
                <div className="flex-1">
                  <AdminEmptyInput isInvalid={emptyPassword}>
                    <PasswordTextField
                      password={password}
                      onChange={onChangePassword}
                      invalidPassword={emptyPassword}
                      placeholder="Password"
                    />
                  </AdminEmptyInput>
                  {!isPasswordMatched && (
                    <p className="text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                <div className="flex-1">
                  <AdminEmptyInput isInvalid={emptyConfirmPassword}>
                    <PasswordTextField
                      password={confirmPassword}
                      onChange={onChangeConfirmPassword}
                      invalidPassword={emptyConfirmPassword}
                      placeholder="Confirm Password"
                    />
                  </AdminEmptyInput>
                </div>
              </div>
            )}

            {!isAdmin && (
              <>
                <div className="flex w-5xl gap-x-10">
                  <div className="flex-1">
                    <AdminEmptyInput isInvalid={emptyProgramme}>
                      <SingleFilter
                        placeholder="Select Student Programme"
                        options={programmeOptions}
                        value={programme}
                        isInvalid={emptyProgramme}
                        onChange={onChangeProgramme}
                      />
                    </AdminEmptyInput>
                  </div>
                  <div className="flex-1">
                    <AdminEmptyInput isInvalid={emptyCourse}>
                      <SingleFilter
                        placeholder="Select Student Course"
                        options={courseOptions}
                        value={course}
                        isInvalid={emptyCourse}
                        onChange={onChangeCourse}
                      />
                    </AdminEmptyInput>
                  </div>
                </div>

                <div className="flex w-5xl gap-x-10">
                  <div className="flex-1">
                    <AdminEmptyInput isInvalid={emptyProgrammeIntake}>
                      <SingleFilter
                        placeholder="Select Student Intake"
                        options={programmeIntakeOptions}
                        value={programmeIntake}
                        isInvalid={emptyProgrammeIntake}
                        onChange={onChangeProgrammeIntake}
                      />
                    </AdminEmptyInput>
                  </div>
                </div>
              </>
            )}

            {!isAdmin && (
              <>
                <div className="flex w-5xl gap-x-10">
                  <div className="flex-1">
                    <SingleFilter
                      placeholder="Select Student Status"
                      options={statusOptions}
                      value={status}
                      isInvalid={emptyStatus}
                      onChange={onChangeStatus}
                    />
                  </div>

                  <div className="flex-1">
                    <SingleFilter
                      placeholder="Select Course Status"
                      options={courseStatusOptions}
                      value={courseStatus}
                      isInvalid={emptyCourseStatus}
                      onChange={onChangeCourseStatus}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="justify-center flex mt-10 gap-x-10">
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/users"
              />
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Student"
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
