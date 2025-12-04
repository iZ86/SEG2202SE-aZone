import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components";
import type { PopoverProps } from "react-aria-components";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  CalendarDate,
  CalendarDateTime,
  ZonedDateTime,
} from "@internationalized/date";
import { useState } from "react";

export default function DateTimePicker({
  value,
  onChange,
  isInvalid,
  placeholder,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
  isMinuteGranularity = true,
}: {
  value: CalendarDate | CalendarDateTime | ZonedDateTime | null;
  onChange: (
    value: CalendarDate | CalendarDateTime | ZonedDateTime | null
  ) => void;
  isInvalid: boolean;
  placeholder: string;
  isMinuteGranularity: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <DatePicker
      value={value}
      onChange={onChange}
      granularity={isMinuteGranularity ? "minute" : "day"}
      className={`relative max-w-${maxWidth} min-w-${minWidth} w-${width}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div
        className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none transition-all -top-3 ${
          isFocused || value
            ? "text-blue-air-superiority"
            : "text-gray-battleship"
        } ${isInvalid ? "text-red-tomato" : ""}`}
      >
        <span>{placeholder}</span>
      </div>
      <Group
        className={`text-base min-h-12 rounded-2xl border-2 px-4 flex items-center gap-x-2 cursor-pointer
        ${
          !value && !isFocused
            ? isInvalid
              ? "border-red-tomato text-red-tomato"
              : "border-gray-battleship text-gray-battleship"
            : isInvalid
            ? "border-red-tomato text-red-tomato"
            : "border-blue-air-superiority text-blue-air-superiority"
        }
      `}
      >
        <Button className="cursor-pointer">
          <CalendarIcon size={24} />
        </Button>

        {/** React-Aria automatically displays dd/mm/yyyy HH:mm */}
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </Group>

      <MyPopover>
        <Dialog>
          <div className="flex flex-col gap-4">
            {/** Calendar section */}
            <Calendar className="flex flex-col items-center">
              <header className="flex justify-center items-center gap-x-4 text-gray-battleship">
                <Button slot="previous">
                  <ChevronLeft size={24} />
                </Button>
                <Heading />
                <Button slot="next">
                  <ChevronRight size={24} />
                </Button>
              </header>

              <CalendarGrid>
                <CalendarGridHeader>
                  {(day) => (
                    <CalendarHeaderCell className="font-semibold p-1">
                      {day}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>

                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className="flex outside-month:text-gray-300 justify-center py-1 w-8 text-gray-battleship rounded-lg hover:bg-gray-300 cursor-pointer selected:bg-blue-air-superiority selected:text-white"
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </Calendar>
          </div>
        </Dialog>
      </MyPopover>
    </DatePicker>
  );
}

function MyPopover(props: PopoverProps) {
  return (
    <Popover
      {...props}
      className={({ isEntering, isExiting }) => `
        overflow-auto rounded-2xl border-2 border-blue-air-superiority p-4 px-8 bg-white min-h-64
        ${
          isEntering
            ? "animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 ease-out duration-200"
            : ""
        }
        ${
          isExiting
            ? "animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 ease-in duration-150"
            : ""
        }
      `}
    />
  );
}
