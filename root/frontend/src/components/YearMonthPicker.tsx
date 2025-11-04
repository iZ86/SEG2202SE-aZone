import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Popover,
  type PopoverProps,
} from "react-aria-components";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function YearMonthPicker({
  value,
  onChange,
  isInvalid,
  placeholder,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
  placeholder: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [isFocused, setIsFocused] = useState(false);
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  return (
    <DialogTrigger onOpenChange={setIsFocused}>
      <div
        className={`relative w-${width} max-w-${maxWidth} min-w-${minWidth} text-base text-gray-battleship`}
      >
        <Button
          className={`${
            !value && !isFocused
              ? isInvalid
                ? "text-red-tomato border-red-tomato"
                : "border-gray-battleship"
              : isInvalid
              ? "text-red-tomato border-red-tomato"
              : "border-blue-air-superiority text-blue-air-superiority"
          } px-4 h-12 w-${width} max-w-${maxWidth} min-w-${minWidth} border-2 rounded-2xl outline-hidden`}
        >
          {value && <div className="flex gap-x-2 gap-y-2">{value}</div>}
        </Button>
        <div
          className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none transition-all
                    ${
                      value === "" && !isFocused
                        ? `top-3 transition-all peer-focus:-top-3 ${
                            isInvalid
                              ? "text-red-tomato"
                              : "peer-focus:text-blue-air-superiority"
                          }`
                        : `peer-focus:transition-all -top-3 ${
                            isInvalid
                              ? "text-red-tomato"
                              : "text-blue-air-superiority"
                          }`
                    }`}
        >
          <CalendarIcon size={24} />
          <span>{placeholder}</span>
        </div>
      </div>

      <MyPopover>
        <Dialog>
          <div className="flex flex-col items-center">
            <header className="flex justify-center items-center gap-x-4 mb-3">
              <Button
                onPress={() => setYear((y) => y - 1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft size={24} />
              </Button>
              <Heading className="text-lg font-semibold">{year}</Heading>
              <Button
                onPress={() => setYear((y) => y + 1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight size={24} />
              </Button>
            </header>

            <div className="grid grid-cols-3 gap-2">
              {months.map((m, i) => (
                <Button
                  key={i}
                  onPress={() => {
                    onChange(year + m);
                  }}
                  className="p-3 rounded-xl border border-gray-300 hover:bg-gray-100 w-20 text-center text-sm"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
        </Dialog>
      </MyPopover>
    </DialogTrigger>
  );
}

function MyPopover(props: PopoverProps) {
  return (
    <Popover
      {...props}
      className={({ isEntering, isExiting }) => `
        overflow-auto rounded-2xl border-2 border-blue-air-superiority p-4 px-8 bg-white min-h-64 text-blue-air-superiority
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
