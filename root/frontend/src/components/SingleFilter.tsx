import Select, { type SingleValue } from "react-select";
import type { reactSelectOptionType } from "datatypes/reactSelectOptionType";
import { type ReactElement, useState } from "react";

export default function SingleFilter({
  placeholder,
  icon = undefined,
  options,
  value,
  isInvalid,
  onChange,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
}: {
  placeholder: string;
  icon?: ReactElement;
  options: reactSelectOptionType[];
  value: reactSelectOptionType;
  isInvalid: boolean;
  onChange: (choice: SingleValue<reactSelectOptionType>) => void;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const customStyles = {
    option: (styles: object) => ({
      ...styles,
      cursor: "pointer",
    }),
    control: (styles: object) => ({
      ...styles,
      cursor: "pointer",
    }),
  };
  return (
    <div>
      <div
        className={`relative w-${width} max-w-${maxWidth} min-w-${minWidth} text-base text-gray-battleship`}
      >
        <Select
          styles={customStyles}
          classNames={{
            control: () => `${
              value.value === -1 && !isFocused
                ? isInvalid
                  ? "text-red-tomato border-red-tomato"
                  : "text-gray-davy border-gray-davy"
                : isInvalid
                ? "text-red-tomato border-red-tomato"
                : "text-blue-marian border-blue-marian"
            }
            px-4 h-12 w-${width} max-w-${maxWidth} min-w-${minWidth} border-2 rounded-2xl outline-hidden`,
            menu: () =>
              `text-gray-davy bg-white border-blue-marian border-2 mt-1 w-${width} min-w-${minWidth} max-w-${maxWidth} rounded-2xl p-2`,
            option: (state) =>
              `${
                state.isFocused ? "bg-neutral-200" : "bg-white"
              } py-2 px-4 rounded-xl text-davy-gray`,
            valueContainer: () => "flex gap-x-2 gap-y-2",
          }}
          unstyled
          options={options}
          onChange={onChange}
          value={value.value === -1 ? null : value}
          placeholder={null}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        />

        <div
          className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none transition-all
                    ${
                      value.value === -1 && !isFocused
                        ? `top-3 ${
                            isInvalid ? "text-red-tomato" : "text-gray-davy"
                          }`
                        : `-top-3 ${
                            isInvalid ? "text-red-tomato" : "text-blue-marian"
                          }`
                    }`}
        >
          {icon}
          <span>{placeholder}</span>
        </div>
      </div>
    </div>
  );
}
