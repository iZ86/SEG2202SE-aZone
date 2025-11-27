import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createLecturerAPI,
  getAllLecturerTitlesAPI,
  getLecturerByIdAPI,
  updateLecturerByIdAPI,
} from "../api/lecturers";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import SingleFilter from "@components/SingleFilter";
import type { SingleValue } from "react-select";
import type { LecturerTitle } from "@datatypes/lecturerType";

export default function LecturerForm({
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
  const [lecturerTitle, setLecturerTitle] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });

  const [emptyFirstName, setEmptyFirstName] = useState(false);
  const [emptyLastName, setEmptyLastName] = useState(false);
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [emptyPhoneNumber, setEmptyPhoneNumber] = useState(false);
  const [emptyLecturerTitle, setEmptyLecturerTitle] = useState(false);

  const [lecturerTitleOptions, setLecturerTitleOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [invalidEmail, setInvalidEmail] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (
      emptyFirstName ||
      emptyLastName ||
      emptyLecturerTitle ||
      emptyEmail ||
      emptyPhoneNumber
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
      response = await createLecturerAPI(
        authToken as string,
        firstName,
        lastName,
        lecturerTitle.value,
        email,
        phoneNumber
      );
    } else if (type === "Edit") {
      response = await updateLecturerByIdAPI(
        authToken as string,
        id,
        firstName,
        lastName,
        lecturerTitle.value,
        email,
        phoneNumber
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidEmail(true);
      toast.error("Email Existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/lecturers");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} lecturer`);
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

    if (!lecturerTitle.value || lecturerTitle.value === -1) {
      setEmptyLecturerTitle(true);
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

    return emptyInput;
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

  function onChangeLecturerTitle(
    onChangeProgramme: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeProgramme) {
      return;
    }
    setLecturerTitle(onChangeProgramme);
    setEmptyLecturerTitle(false);
  }

  async function getAllLecturerTitles(token: string) {
    const response: Response | undefined = await getAllLecturerTitlesAPI(token);

    if (!response?.ok) {
      setLecturerTitleOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.length === 0) {
      setLecturerTitleOptions([]);
      return;
    }

    const options = data.lecturerTitles.map((lecturerTitle: LecturerTitle) => ({
      value: lecturerTitle.lecturerTitleId,
      label: lecturerTitle.lecturerTitle,
    }));

    setLecturerTitleOptions(options);
  }

  const setupEditLecturerForm = useCallback(
    async (token: string, lecturerId: number) => {
      const response: Response | undefined = await getLecturerByIdAPI(
        token,
        lecturerId
      );

      if (!response?.ok) {
        navigate("/admin/lecturers");
        toast.error("Failed to fetch lecturer");
        return;
      }
      const { data } = await response.json();

      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber);
      setLecturerTitle({
        value: data.lecturerTitleId,
        label: data.lecturerTitle,
      });
    },
    [navigate]
  );

  useEffect(() => {
    if (!authToken) {
      return;
    }

    getAllLecturerTitles(authToken);

    if (type === "Edit" && id > 0) {
      setupEditLecturerForm(authToken, id);
    }
  }, [authToken, type, id, setupEditLecturerForm]);

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
            {type === "Edit" ? "Edit" : "Create New"} Lecturer
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the lecturer information below."
              : "Fill in the details below to create a new lecturer."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex w-5xl gap-x-10">
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

            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyEmail}
                  isInvalid={invalidEmail}
                  invalidMessage="Email existed"
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
                <AdminInputFieldWrapper isEmpty={emptyLastName}>
                  <SingleFilter
                    options={lecturerTitleOptions}
                    value={lecturerTitle}
                    onChange={onChangeLecturerTitle}
                    isInvalid={emptyLecturerTitle}
                    placeholder="Lecturer Title"
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex w-5xl gap-x-10">
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
            <div className="justify-center flex mt-10 gap-x-10">
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/lecturers"
              />
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Lecturer"
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
