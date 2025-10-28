import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminEmptyInput from "@components/admin/AdminEmptyInput";
import {
  createProgrammeAPI,
  getProgrammeByIdAPI,
  updateProgrammeByIdAPI,
} from "../api/programmes";

export default function ProgrammeForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [programmeName, setProgrammeName] = useState("");

  const [emptyProgrammeName, setEmptyProgrammeName] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyProgrammeName) {
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
      response = await createProgrammeAPI(authToken as string, programmeName);
    } else if (type === "Edit") {
      response = await updateProgrammeByIdAPI(
        authToken as string,
        id,
        programmeName
      );
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/programmes");
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (!programmeName) {
      setEmptyProgrammeName(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeProgrammeName(onChangeProgrammeName: string) {
    if (onChangeProgrammeName !== "") {
      setEmptyProgrammeName(false);
    }
    setProgrammeName(onChangeProgrammeName);
  }

  const setupEditProgrammeForm = useCallback(
    async (token: string, programmeId: number) => {
      const response: Response | undefined = await getProgrammeByIdAPI(
        token,
        programmeId
      );

      if (!response?.ok) {
        navigate("/admin/programmes");
        return;
      }
      const { data } = await response.json();

      setProgrammeName(data.programmeName);
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
      setupEditProgrammeForm(token, id);
    }
  }, [navigate, type, id, setupEditProgrammeForm]);

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Programme
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the programme information below."
              : "Fill in the details below to create a new programme."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex w-5xl gap-x-10">
              <div className="flex-1">
                <AdminEmptyInput isInvalid={emptyProgrammeName}>
                  <NormalTextField
                    text={programmeName}
                    onChange={onChangeProgrammeName}
                    isInvalid={emptyProgrammeName}
                    placeholder="Programme Name"
                  />
                </AdminEmptyInput>
              </div>
            </div>

            <div className="justify-center flex mt-10 gap-x-10">
              <MediumButton
                buttonText="Cancel"
                submit={false}
                backgroundColor="bg-slate-400"
                hoverBgColor="hover:bg-slate-600"
                textColor="text-white"
                link="/admin/programmes"
              />
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Programme"
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
