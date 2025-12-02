import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import NormalTextField from "@components/NormalTextField";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createProgrammeAPI,
  getProgrammeByIdAPI,
  updateProgrammeByIdAPI,
} from "../api/programmes";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

export default function ProgrammeForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [programmeName, setProgrammeName] = useState("");

  const [emptyProgrammeName, setEmptyProgrammeName] = useState(false);
  const [invalidProgrammeName, setInvalidProgrammeName] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  useEffect(() => {
    const setupEditProgrammeForm = async (
      token: string,
      programmeId: number
    ) => {
      const response: Response | undefined = await getProgrammeByIdAPI(
        token,
        programmeId
      );

      if (!response?.ok) {
        navigate("/admin/programmes");
        toast.error("Failed to fetch programme");
        return;
      }
      const { data } = await response.json();

      setProgrammeName(data.programmeName);
    };

    if (!authToken) {
      return;
    }

    if (type === "Edit" && id > 0) {
      setupEditProgrammeForm(authToken, id);
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

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidProgrammeName(true);
      toast.error("Programme Name already exists!");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/programmes");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} programme`);
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
      setInvalidProgrammeName(false);
    }
    setProgrammeName(onChangeProgrammeName);
  }

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
            <div className="flex flex-col sm:flex-row w-xs sm:w-xl md:w-2xl gap-x-10 gap-y-8 sm:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyProgrammeName}
                  isInvalid={invalidProgrammeName}
                  invalidMessage="Programme Name already exists."
                >
                  <NormalTextField
                    text={programmeName}
                    onChange={onChangeProgrammeName}
                    isInvalid={emptyProgrammeName || invalidProgrammeName}
                    placeholder="Programme Name"
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Programme"
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
                link="/admin/programmes"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
