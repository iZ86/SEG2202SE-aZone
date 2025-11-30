import LoadingOverlay from "@components/LoadingOverlay";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import {
  createEnrollmentAPI,
  getEnrollmentByIdAPI,
  updateEnrollmentByIdAPI,
} from "../api/enrollments";
import DatePicker from "@components/DatePicker";
import {
  parseAbsoluteToLocal,
  ZonedDateTime,
  type CalendarDateTime,
} from "@internationalized/date";
import CustomDatePicker from "@components/DatePicker";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";

export default function EnrollmentForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [enrollmentStartDateTime, setEnrollmentStartDateTime] = useState<
    CalendarDateTime | ZonedDateTime | null
  >(null);
  const [enrollmentEndDateTime, setEnrollmentEndDateTime] = useState<
    CalendarDateTime | ZonedDateTime | null
  >(null);
  const [emptyEnrollmentStartDateTime, setEmptyEnrollmentStartDateTime] =
    useState(false);
  const [emptyEnrollmentEndDateTime, setEmptyEnrollmentEndDateTime] =
    useState(false);

  const [invalidEnrollmentDateTimes, setInvalidEnrollmentDateTimes] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken, admin, loading } = useAdmin();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (emptyEnrollmentEndDateTime || emptyEnrollmentStartDateTime) {
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
      response = await createEnrollmentAPI(
        authToken as string,
        enrollmentStartDateTime as CalendarDateTime,
        enrollmentEndDateTime as CalendarDateTime
      );
    } else if (type === "Edit") {
      response = await updateEnrollmentByIdAPI(
        authToken as string,
        id,
        enrollmentStartDateTime as CalendarDateTime,
        enrollmentEndDateTime as CalendarDateTime
      );
    }

    if (response && response.status === 409) {
      setIsLoading(false);
      setInvalidEnrollmentDateTimes(true);
      toast.error("Enrollment Start and End Date Time Existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/enrollments");
      toast.success(
        `${type === "Add" ? "Created new" : "Updated"} enrollment period`
      );
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (!enrollmentStartDateTime) {
      setEmptyEnrollmentStartDateTime(true);
      emptyInput = true;
    }

    if (!enrollmentEndDateTime) {
      setEmptyEnrollmentEndDateTime(true);
      emptyInput = true;
    }

    return emptyInput;
  }

  function onChangeEnrollmentStartDateTime(
    value: CalendarDateTime | ZonedDateTime | null
  ) {
    if (value !== null) {
      setEmptyEnrollmentStartDateTime(false);
    }
    setEnrollmentStartDateTime(value);
  }

  function onChangeEnrollmentEndDateTime(
    value: CalendarDateTime | ZonedDateTime | null
  ) {
    if (value !== null) {
      setEmptyEnrollmentEndDateTime(false);
    }
    setEnrollmentEndDateTime(value);
  }

  const setupEditEnrollmentForm = useCallback(
    async (token: string, enrollmentId: number) => {
      const response: Response | undefined = await getEnrollmentByIdAPI(
        token,
        enrollmentId
      );

      if (!response?.ok) {
        navigate("/admin/enrollments");
        toast.error("Failed to fetch enrollment");
        return;
      }

      const { data } = await response.json();

      setEnrollmentStartDateTime(
        data.enrollmentStartDateTime
          ? parseAbsoluteToLocal(data.enrollmentStartDateTime)
          : null
      );

      setEnrollmentEndDateTime(
        data.enrollmentEndDateTime
          ? parseAbsoluteToLocal(data.enrollmentEndDateTime)
          : null
      );
    },
    [navigate]
  );

  useEffect(() => {
    if (!authToken) return;

    if (type === "Edit" && id > 0) {
      setupEditEnrollmentForm(authToken, id);
    }
  }, [type, id, setupEditEnrollmentForm, authToken]);

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
            {type === "Edit" ? "Edit" : "Create New"} Enrollment Period
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the enrollment information below."
              : "Fill in the details below to create a new enrollment period."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyEnrollmentStartDateTime}
                  isInvalid={invalidEnrollmentDateTimes}
                  invalidMessage="Enrollmet Start Date Time Existed"
                >
                  <CustomDatePicker
                    value={enrollmentStartDateTime}
                    onChange={onChangeEnrollmentStartDateTime}
                    isInvalid={
                      emptyEnrollmentStartDateTime || invalidEnrollmentDateTimes
                    }
                    placeholder="Select Enrollment Start Date & Time"
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyEnrollmentEndDateTime}
                  isInvalid={invalidEnrollmentDateTimes}
                  invalidMessage="Enrollmet End Date Time Existed"
                >
                  <DatePicker
                    value={enrollmentEndDateTime}
                    onChange={onChangeEnrollmentEndDateTime}
                    isInvalid={
                      emptyEnrollmentEndDateTime || invalidEnrollmentDateTimes
                    }
                    placeholder="Select Enrollment End Date & Time"
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit"
                    ? "Save Changes"
                    : "Create New Enrollment Period"
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
                link="/admin/enrollments"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
