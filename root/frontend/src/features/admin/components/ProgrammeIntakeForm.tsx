import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MediumButton from "@components/MediumButton";
import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import { getAllProgrammesAPI } from "../api/programmes";
import {
  createProgrammeIntakeAPI,
  getProgrammeIntakeByIdAPI,
  updateProgrammeIntakeByIdAPI,
} from "../api/programmes";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import type { SingleValue } from "react-select";
import type { Programme } from "@datatypes/programmeType";
import SingleFilter from "@components/SingleFilter";
import { useAdmin } from "../hooks/useAdmin";
import { toast } from "react-toastify";
import {
  parseAbsoluteToLocal,
  toCalendarDate,
  type CalendarDate,
  type CalendarDateTime,
  type ZonedDateTime,
} from "@internationalized/date";
import DatePicker from "@components/DatePicker";
import { getAllIntakesAPI } from "../api/intakes";
import type { Intake } from "@datatypes/intakeType";

export default function ProgrammeIntakeForm({
  type,
  id = 0,
}: {
  type: "Add" | "Edit";
  id?: number;
}) {
  const [programme, setProgramme] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [intake, setIntake] = useState({
    value: -1,
    label: "",
  });
  const [studyMode, setStudyMode] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [semester, setSemester] = useState<reactSelectOptionType>({
    value: -1,
    label: "",
  });
  const [semesterStartDate, setSemesterStartDate] = useState<
    CalendarDate | CalendarDateTime | ZonedDateTime | null
  >(null);
  const [semesterEndDate, setSemesterEndDate] = useState<
    CalendarDate | CalendarDateTime | ZonedDateTime | null
  >(null);

  const [emptyProgramme, setEmptyProgramme] = useState(false);
  const [emptyIntake, setEmptyIntake] = useState(false);
  const [emptyStudyMode, setEmptyStudyMode] = useState(false);
  const [emptySemester, setEmptySemester] = useState(false);
  const [emptySemesterStartDate, setEmptySemesterStartDate] = useState(false);
  const [emptySemesterEndDate, setEmptySemesterEndDate] = useState(false);

  const [invalidProgrammeIntake, setInvalidProgrammeIntake] = useState(false);

  const [programmeOptions, setProgrammeOptions] = useState<
    reactSelectOptionType[]
  >([]);
  const [intakeOptions, setIntakeOptions] = useState<reactSelectOptionType[]>(
    []
  );
  const studyModeOptions: reactSelectOptionType[] = [
    { value: 1, label: "Full-time" },
    { value: 2, label: "Part-time" },
  ];
  const semesterOptions: reactSelectOptionType[] = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
    { value: 11, label: "11" },
    { value: 12, label: "12" },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { authToken, admin, loading } = useAdmin();

  useEffect(() => {
    const setupEditProgrammeIntakeForm = async (
      token: string,
      programmeIntakeId: number
    ) => {
      const response: Response | undefined = await getProgrammeIntakeByIdAPI(
        token,
        programmeIntakeId
      );

      if (!response?.ok) {
        navigate("/admin/programme-intakes");
        toast.error("Failed to fetch programme intake");
        return;
      }

      const { data } = await response.json();

      setProgramme({
        label: data.programmeName,
        value: data.programmeId,
      });
      setIntake({
        label: data.intakeId.toString(),
        value: data.intakeId,
      });
      setStudyMode({
        label: data.studyMode,
        value: data.studyModeId,
      });
      setSemester({
        label: data.semester.toString(),
        value: data.semester,
      });
      setSemesterStartDate(
        data.semesterStartDate
          ? toCalendarDate(parseAbsoluteToLocal(data.semesterStartDate))
          : null
      );
      setSemesterEndDate(
        data.semesterEndDate
          ? toCalendarDate(parseAbsoluteToLocal(data.semesterEndDate))
          : null
      );
    };

    if (!authToken) {
      return;
    }

    getAllProgrammes(authToken);
    getAllIntakes(authToken);
    if (type === "Edit" && id > 0) {
      setupEditProgrammeIntakeForm(authToken, id);
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

    if (
      emptyProgramme ||
      emptyIntake ||
      emptyStudyMode ||
      emptySemester ||
      emptySemesterStartDate ||
      emptySemesterEndDate
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
      response = await createProgrammeIntakeAPI(
        authToken as string,
        programme.value,
        intake.value,
        studyMode.value,
        semester.value,
        semesterStartDate as CalendarDateTime,
        semesterEndDate as CalendarDateTime
      );
    } else if (type === "Edit") {
      response = await updateProgrammeIntakeByIdAPI(
        authToken as string,
        id,
        programme.value,
        intake.value,
        studyMode.value,
        semester.value,
        semesterStartDate as CalendarDateTime,
        semesterEndDate as CalendarDateTime
      );
    }

    if (response && response.status === 409) {
      setInvalidProgrammeIntake(true);
      setIsLoading(false);
      toast.error("ProgrammeIntake name existed");
      return;
    }

    if (response && response.ok) {
      setIsLoading(false);
      navigate("/admin/programme-intakes");
      toast.success(
        `${type === "Add" ? "Created new" : "Updated"} programme intake`
      );
      return;
    }
  }

  function setEmptyInputs(): boolean {
    let emptyInput: boolean = false;

    if (!programme.value || programme.value === -1) {
      setEmptyProgramme(true);
      emptyInput = true;
    }

    if (!intake.value || intake.value === -1) {
      setEmptyIntake(true);
      emptyInput = true;
    }

    if (!studyMode.value || studyMode.value === -1) {
      setEmptyStudyMode(true);
      emptyInput = true;
    }

    if (!semester.value || semester.value === -1) {
      setEmptySemester(true);
      emptyInput = true;
    }

    if (!semesterStartDate) {
      setEmptySemesterStartDate(true);
      emptyInput = true;
    }

    if (!semesterEndDate) {
      setEmptySemesterEndDate(true);
      emptyInput = true;
    }
    return emptyInput;
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

  function onChangeIntake(onChangeIntake: SingleValue<reactSelectOptionType>) {
    if (!onChangeIntake) {
      return;
    }
    setIntake(onChangeIntake);
    setEmptyIntake(false);
  }

  function onChangeStudyMode(
    onChangeStudyMode: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeStudyMode) {
      return;
    }
    setStudyMode(onChangeStudyMode);
    setEmptyStudyMode(false);
  }

  function onChangeSemester(
    onChangeSemester: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeSemester) {
      return;
    }
    setSemester(onChangeSemester);
    setEmptySemester(false);
  }

  function onChangeSemesterStartDate(
    value: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) {
    if (value !== null) {
      setEmptySemesterStartDate(false);
    }
    setSemesterStartDate(value);
  }

  function onChangeSemesterEndDate(
    value: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) {
    if (value !== null) {
      setEmptySemesterEndDate(false);
    }
    setSemesterEndDate(value);
  }

  async function getAllProgrammes(token: string) {
    const response: Response | undefined = await getAllProgrammesAPI(token);

    if (!response?.ok) {
      setProgrammeOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.programmes.length === 0) {
      setProgrammeOptions([]);
      return;
    }

    const options = data.programmes.map((programme: Programme) => ({
      value: programme.programmeId,
      label: programme.programmeName,
    }));

    setProgrammeOptions(options);
  }

  async function getAllIntakes(token: string) {
    const response: Response | undefined = await getAllIntakesAPI(token);

    if (!response?.ok) {
      setIntakeOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data || data.intakes.length === 0) {
      setIntakeOptions([]);
      return;
    }

    const options = data.intakes.map((intake: Intake) => ({
      value: intake.intakeId,
      label: intake.intakeId.toString(),
    }));

    setIntakeOptions(options);
  }

  return (
    <section className="flex-1 bg-white rounded-lg border">
      {isLoading && <LoadingOverlay />}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col w-full px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {type === "Edit" ? "Edit" : "Create New"} Programme Intake
          </h1>
          <p className="mt-1 text-slate-400">
            {type === "Edit"
              ? "Make changes to the programme intake information below."
              : "Fill in the details below to create a new programme intake."}
          </p>
        </div>

        <hr className="border-slate-200 w-full border" />

        <div className="flex flex-col px-10 py-6 justify-center items-center">
          <form onSubmit={handleSubmit} className="mt-6 gap-y-8 flex flex-col">
            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyProgramme}
                  isInvalid={invalidProgrammeIntake}
                  invalidMessage="Programme Intake Existed."
                >
                  <SingleFilter
                    placeholder="Select Programme"
                    options={programmeOptions}
                    value={programme}
                    isInvalid={emptyProgramme || invalidProgrammeIntake}
                    onChange={onChangeProgramme}
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptyIntake}
                  isInvalid={invalidProgrammeIntake}
                  invalidMessage="Programme Intake Existed."
                >
                  <SingleFilter
                    placeholder="Select Intake"
                    options={intakeOptions}
                    value={intake}
                    isInvalid={emptyIntake || invalidProgrammeIntake}
                    onChange={onChangeIntake}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptyStudyMode}>
                  <SingleFilter
                    placeholder="Select Study Mode"
                    options={studyModeOptions}
                    value={studyMode}
                    isInvalid={emptyStudyMode}
                    onChange={onChangeStudyMode}
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper
                  isEmpty={emptySemester}
                  isInvalid={invalidProgrammeIntake}
                  invalidMessage="Programme Intake Existed."
                >
                  <SingleFilter
                    placeholder="Select Semester"
                    options={semesterOptions}
                    value={semester}
                    isInvalid={emptySemester || invalidProgrammeIntake}
                    onChange={onChangeSemester}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptySemesterStartDate}>
                  <DatePicker
                    value={semesterStartDate}
                    onChange={onChangeSemesterStartDate}
                    isInvalid={emptySemesterStartDate}
                    placeholder="Select Semester Start Date & Time"
                    isMinuteGranularity={false}
                  />
                </AdminInputFieldWrapper>
              </div>
              <div className="flex-1">
                <AdminInputFieldWrapper isEmpty={emptySemesterEndDate}>
                  <DatePicker
                    value={semesterEndDate}
                    onChange={onChangeSemesterEndDate}
                    isInvalid={emptySemesterEndDate}
                    placeholder="Select Semester End Date & Time"
                    isMinuteGranularity={false}
                  />
                </AdminInputFieldWrapper>
              </div>
            </div>

            <div className="justify-center flex gap-x-10 flex-col gap-y-4 sm:flex-row sm:gap-y-0">
              <MediumButton
                buttonText={
                  type === "Edit"
                    ? "Save Changes"
                    : "Create New Programme Intake"
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
                link="/admin/programme-intakes"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
