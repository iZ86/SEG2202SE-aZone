import AdminInputFieldWrapper from "@components/admin/AdminInputFieldWrapper";
import NormalTextField from "@components/NormalTextField";
import SingleFilter from "@components/SingleFilter";
import SmallButton from "@components/SmallButton";
import TimePicker from "@components/TimePicker";
import type { reactSelectOptionType } from "@datatypes/reactSelectOptionType";
import { Time } from "@internationalized/date";
import { useEffect, useState } from "react";
import type { SingleValue } from "react-select";
import { getAllVenuesAPI } from "../api/venues";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import type { Venue } from "@datatypes/venueType";

export default function EnrollmentSubjectTypeForm({
  index,
  data,
  isEmpty,
  isInvalid,
  isInvalidTime,
  onChange,
  onRemove,
}: {
  index: number;
  data: {
    classType: reactSelectOptionType;
    venue: reactSelectOptionType;
    day: reactSelectOptionType;
    startTime: Time | null;
    endTime: Time | null;
    numberOfSeats: number;
    grouping: number;
  };
  isEmpty: {
    classType: boolean;
    venue: boolean;
    day: boolean;
    startTime: boolean;
    endTime: boolean;
    numberOfSeats: boolean;
    grouping: boolean;
  };
  isInvalid: {
    classType: boolean;
    venue: boolean;
    day: boolean;
    startTime: boolean;
    endTime: boolean;
    numberOfSeats: boolean;
    grouping: boolean;
  };
  isInvalidTime: {
    startTime: boolean;
    endTime: boolean;
  };
  onChange: (
    index: number,
    field: string,
    value: string | SingleValue<reactSelectOptionType> | Time | null
  ) => void;
  onRemove: (index: number) => void;
}) {
  const { authToken, admin, loading } = useAdmin();
  const navigate = useNavigate();
  const classTypeOptions: reactSelectOptionType[] = [
    { value: 1, label: "Lecture" },
    { value: 2, label: "Practical" },
    { value: 3, label: "Tutorial" },
    { value: 4, label: "Workshop" },
  ];
  const [venueOptions, setVenueOptions] = useState<reactSelectOptionType[]>([]);
  const dayOptions: reactSelectOptionType[] = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
  ];

  const [emptyClassType, setEmptyClassType] = useState<boolean>(false);
  const [emptyVenue, setEmptyVenue] = useState<boolean>(false);
  const [emptyDay, setEmptyDay] = useState<boolean>(false);
  const [emptyNumberOfSeats, setEmptyNumberOfSeats] = useState<boolean>(false);
  const [emptyGrouping, setEmptyGrouping] = useState<boolean>(false);
  const [emptyStartTime, setEmptyStartTime] = useState<boolean>(false);
  const [emptyEndTime, setEmptyEndTime] = useState<boolean>(false);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    getAllVenues(authToken);
  }, [authToken, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  function onChangeClassType(
    onChangeClassType: SingleValue<reactSelectOptionType>
  ) {
    if (!onChangeClassType) {
      return;
    }
    onChange(index, "classType", onChangeClassType);
    setEmptyClassType(false);
  }

  function onChangeVenue(onChangeVenue: SingleValue<reactSelectOptionType>) {
    if (!onChangeVenue) {
      return;
    }
    onChange(index, "venue", onChangeVenue);
    setEmptyVenue(false);
  }

  function onChangeDay(onChangeDay: SingleValue<reactSelectOptionType>) {
    if (!onChangeDay) {
      return;
    }
    onChange(index, "day", onChangeDay);
    setEmptyDay(false);
  }

  function onChangeNumberOfSeats(value: string) {
    const isNumeric = /^\d*$/.test(value);

    if (isNumeric) {
      const numValue = Number(value);

      if (value === "" || (numValue > 0 && numValue <= 2000)) {
        onChange(index, "numberOfSeats", value);
        if (value !== "") {
          setEmptyNumberOfSeats(false);
        }
      }
    }
  }

  function onChangeGrouping(value: string) {
    const isNumeric = /^\d*$/.test(value);

    if (isNumeric) {
      const numValue = Number(value);

      if (value === "" || (numValue > 0 && numValue <= 50)) {
        onChange(index, "grouping", value);
        if (value !== "") {
          setEmptyGrouping(false);
        }
      }
    }
  }

  function onChangeStartTime(value: Time | null) {
    if (value !== null) {
      setEmptyStartTime(false);
    }
    onChange(index, "startTime", value);
  }

  function onChangeEndTime(value: Time | null) {
    if (value !== null) {
      setEmptyEndTime(false);
    }
    onChange(index, "endTime", value);
  }

  async function getAllVenues(token: string) {
    const response: Response | undefined = await getAllVenuesAPI(token);

    if (!response || !response.ok) {
      setVenueOptions([]);
      return;
    }

    const { data } = await response.json();

    if (!data.venues || data.venues.length === 0) {
      setVenueOptions([]);
      return;
    }

    const options = data.venues.map((venue: Venue) => ({
      value: venue.venueId,
      label: venue.venue,
    }));

    setVenueOptions(options);
  }

  return (
    <>
      <div className="font-semibold text-slate-700">Class #{index + 1}</div>
      <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyClassType || isEmpty.classType}
            isInvalid={isInvalid.classType}
            invalidMessage="Class session duplicated!"
          >
            <SingleFilter
              placeholder="Select Class Type"
              options={classTypeOptions}
              value={data.classType}
              isInvalid={
                emptyClassType || isEmpty.classType || isInvalid.classType
              }
              onChange={onChangeClassType}
            />
          </AdminInputFieldWrapper>
        </div>
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyVenue || isEmpty.venue}
            isInvalid={isInvalid.venue}
            invalidMessage="Class session duplicated!"
          >
            <SingleFilter
              placeholder="Select Venue"
              options={venueOptions}
              value={data.venue}
              isInvalid={emptyVenue || isEmpty.venue || isInvalid.venue}
              onChange={onChangeVenue}
            />
          </AdminInputFieldWrapper>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyStartTime || isEmpty.startTime}
            isInvalid={isInvalid.startTime || isInvalidTime.startTime}
            invalidMessage={`${
              isInvalidTime.startTime
                ? "Time should be before end time"
                : "Class session duplicated"
            }`}
          >
            <TimePicker
              placeholder="Select Class Start Time"
              value={data.startTime}
              onChange={onChangeStartTime}
              isInvalid={
                emptyStartTime ||
                isEmpty.startTime ||
                isInvalid.startTime ||
                isInvalidTime.startTime
              }
            />
          </AdminInputFieldWrapper>
        </div>
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyEndTime || isEmpty.endTime}
            isInvalid={isInvalid.endTime || isInvalidTime.endTime}
            invalidMessage={`${
              isInvalidTime.endTime
                ? "Time should be after start time"
                : "Class session duplicated"
            }`}
          >
            <TimePicker
              placeholder="Select Class End Time"
              value={data.endTime}
              onChange={onChangeEndTime}
              isInvalid={
                emptyEndTime ||
                isEmpty.endTime ||
                isInvalid.endTime ||
                isInvalidTime.endTime
              }
            />
          </AdminInputFieldWrapper>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row w-xs sm:w-xl xl:w-5xl gap-x-10 gap-y-8 xl:gap-y-0">
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyDay || isEmpty.day}
            isInvalid={isInvalid.day}
            invalidMessage="Class session duplicated!"
          >
            <SingleFilter
              placeholder="Select Day"
              options={dayOptions}
              value={data.day}
              isInvalid={emptyDay || isEmpty.day || isInvalid.day}
              onChange={onChangeDay}
            />
          </AdminInputFieldWrapper>
        </div>
        <div className="flex-1">
          <AdminInputFieldWrapper
            isEmpty={emptyNumberOfSeats || isEmpty.numberOfSeats}
          >
            <NormalTextField
              placeholder="Insert number of seats"
              isInvalid={emptyNumberOfSeats || isEmpty.numberOfSeats}
              text={data.numberOfSeats.toString()}
              onChange={onChangeNumberOfSeats}
            />
          </AdminInputFieldWrapper>
        </div>

        <div className="flex-1">
          <AdminInputFieldWrapper isEmpty={emptyGrouping || isEmpty.grouping}>
            <NormalTextField
              placeholder="Insert grouping (e.g. 1, 2, 3)"
              isInvalid={emptyGrouping || isEmpty.grouping}
              text={data.grouping.toString()}
              onChange={onChangeGrouping}
            />
          </AdminInputFieldWrapper>
        </div>
      </div>

      <div>
        <SmallButton
          onClick={() => onRemove(index)}
          buttonText="Remove Class"
          submit={false}
          backgroundColor="bg-red-500"
          hoverBgColor="hover:bg-red-600"
          textColor="text-white"
        />
      </div>
    </>
  );
}
