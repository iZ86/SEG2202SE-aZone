import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createIntakeAPI,
  getIntakeByIdAPI,
  updateIntakeByIdAPI,
} from "../api/intakes";
import YearMonthPicker from "@components/YearMonthPicker";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

export default function IntakeForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [intakeId, setIntakeId] = useState("");

  const [emptyIntakeId, setEmptyIntakeId] = useState(false);
  const [invalidIntakeId, setInvalidIntakeId] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  useEffect(() => {
    const setupEditIntakeForm = async (token: string, intakeId: number) => {
      const response: Response | undefined = await getIntakeByIdAPI(
        token,
        intakeId
      );

      if (!response?.ok) {
        navigate("/admin/intakes");
        toast.error("Failed to fetch intake");
        return;
      }

      const { data } = await response.json();

      setIntakeId(data.intakeId.toString());
    };

    if (!authToken) {
      return;
    }

    if (type === "Edit" && id > 0) {
      setupEditIntakeForm(authToken, id);
    }
  }, [authToken, type, id, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyIntakeId) {
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
      response = await createIntakeAPI(authToken as string, parseInt(intakeId));
    } else if (type === "Edit") {
      response = await updateIntakeByIdAPI(
        authToken as string,
        id,
        parseInt(intakeId)
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidIntakeId(true);
      toast.error("IntakeId existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/intakes");
      toast.success(`${type === "Add" ? "Created new" : "Updated"} intake`);
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (intakeId === "" || isNaN(Number(intakeId))) {
      setEmptyIntakeId(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeIntakeId(onChangeIntakeId: string) {
    if (onChangeIntakeId !== "") {
      setEmptyIntakeId(false);
      setInvalidIntakeId(false);
    }
    setIntakeId(onChangeIntakeId);
  }

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Intake
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the intake information below."
              : "Fill in the details below to create a new intake."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="mt-6 gap-y-8 flex flex-col mx-auto"
          >
            <AdminInputFieldWrapper
              isEmpty={emptyIntakeId}
              isInvalid={invalidIntakeId}
              invalidMessage="Intake ID already exists."
            >
              <YearMonthPicker
                value={intakeId}
                onChange={onChangeIntakeId}
                isInvalid={emptyIntakeId || invalidIntakeId}
                placeholder="Select Year & Month"
              />
            </AdminInputFieldWrapper>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit" ? "Save Changes" : "Create New Intake"
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
                link="/admin/intakes"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
