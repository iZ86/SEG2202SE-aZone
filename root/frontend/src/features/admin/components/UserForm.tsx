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
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import PasswordTextField from "@components/PasswordTextField";
import SingleFilter from "@components/SingleFilter";
import AdminEmptyInput from "@components/admin/AdminEmptyInput";
import { getAdminByIdAPI, updateAdminByIdAPI } from "../api/admins";

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
  const [emptyProgramme] = useState(false);
  const [emptyCourse] = useState(false);
  const [emptyProgrammeIntake] = useState(false);

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

    if (type === "Edit" && id > 0) {
      if (isAdmin) {
        setupEditAdminForm(token, id);
      } else {
        setupEditStudentForm(token, id);
      }
    }
  }, [navigate, type, id, setupEditStudentForm, setupEditAdminForm, isAdmin]);

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
          <form
            onSubmit={handleSubmit}
            className="mt-6 gap-y-8 flex flex-col justify-center items-center"
          >
            <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
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

            <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10  gap-y-8 sm:gap-y-0">
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
              <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
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

                {type === "Edit" && (
                  <>
                    <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
                      <div className="flex-1">
                        <NormalTextField
                          placeholder="Student Programme (Non-editable)"
                          text={programme.label}
                          isInvalid={emptyProgramme}
                          onChange={() => {}}
                          isDisabled={true}
                        />
                      </div>
                      <div className="flex-1">
                        <NormalTextField
                          placeholder="Student Course (Non-editable)"
                          text={course.label}
                          isInvalid={emptyCourse}
                          onChange={() => {}}
                          isDisabled={true}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row w-xs sm:w-5xl gap-x-10 gap-y-8 sm:gap-y-0">
                      <div className="flex-1">
                        <NormalTextField
                          placeholder="Student Intake (Non-editable)"
                          text={programmeIntake.label}
                          isInvalid={emptyProgrammeIntake}
                          onChange={() => {}}
                          isDisabled={true}
                        />
                      </div>
                    </div>
                  </>
                )}
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
        </div>
      </div>
    </section>
  );
}
