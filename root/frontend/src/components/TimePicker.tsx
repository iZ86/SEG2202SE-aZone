import {
  Button,
  DateInput,
  DateSegment,
  Dialog,
  Group,
  Popover,
  TimeField,
} from "react-aria-components";

import type { PopoverProps } from "react-aria-components";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Time } from "@internationalized/date";

export default function TimePicker({
  value,
  onChange,
  isInvalid,
  placeholder,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
}: {
  value: Time | null;
  onChange: (value: Time | null) => void;
  isInvalid: boolean;
  placeholder: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TimeField
      aria-label={placeholder}
      value={value ?? undefined}
      onChange={onChange}
      granularity="minute"
      className={`relative max-w-${maxWidth} min-w-${minWidth} w-${width}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/** Floating Label */}
      <div
        className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none transition-all -top-3
          ${
            isFocused || value
              ? "text-blue-air-superiority"
              : "text-gray-battleship"
          }
          ${isInvalid ? "text-red-tomato" : ""}
        `}
      >
        <span>{placeholder}</span>
      </div>

      {/** Input field */}
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
          <Clock size={24} />
        </Button>

        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </Group>

      <MyPopover>
        <Dialog>
          <div className="flex flex-col gap-4">
            <TimePickerGrid value={value} onChange={onChange} />
          </div>
        </Dialog>
      </MyPopover>
    </TimeField>
  );
}

function TimePickerGrid({
  value,
  onChange,
}: {
  value: Time | null;
  onChange: (value: Time | null) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="flex gap-6">
      {/** Hours */}
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2 text-gray-battleship">Hour</h3>
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-auto">
          {hours.map((h) => (
            <button
              key={h}
              className={`p-2 rounded-lg border text-center cursor-pointer
                ${
                  value?.hour === h
                    ? "bg-blue-air-superiority text-white"
                    : "border-gray-300 text-gray-battleship hover:bg-gray-200"
                }
              `}
              onClick={() => onChange(new Time(h, value?.minute ?? 0))}
            >
              {h.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/** Minutes */}
      <div className="flex flex-col">
        <h3 className="font-semibold mb-2 text-gray-battleship">Minute</h3>
        <div className="grid grid-cols-2 gap-2">
          {minutes.map((m) => (
            <button
              key={m}
              className={`p-2 rounded-lg border text-center cursor-pointer
                ${
                  value?.minute === m
                    ? "bg-blue-air-superiority text-white"
                    : "border-gray-300 text-gray-battleship hover:bg-gray-200"
                }
              `}
              onClick={() => onChange(new Time(value?.hour ?? 0, m))}
            >
              {m.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
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
