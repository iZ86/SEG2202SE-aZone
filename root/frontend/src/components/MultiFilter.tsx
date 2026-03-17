import Select, { type MultiValue } from "react-select";
import type { reactSelectOptionType } from "datatypes/reactSelectOptionType";
import { type ReactElement, useState } from "react";

export function MultiFilter({
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
  value: reactSelectOptionType[];
  isInvalid: boolean;
  onChange: (choice: MultiValue<reactSelectOptionType>) => void;
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
      minHeight: "48px",
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
              value.length === 0 && !isFocused
                ? isInvalid
                  ? "text-red-tomato border-red-tomato"
                  : "border-slate-300 focus:border-blue-air-superiority focus:text-blue-air-superiority"
                : isInvalid
                ? "text-red-tomato border-red-tomato"
                : "border-blue-air-superiority text-blue-air-superiority"
            }
            px-4 w-${width} max-w-${maxWidth} min-w-${minWidth} border rounded-xl outline-hidden ${
              value.length > 0 ? "py-1.5" : undefined
            }`,
            menu: () =>
              `text-blue-air-superiority bg-white border-blue-air-superiority focus:text-blue-air-superiority border border-blue-marian mt-1 w-${width} min-w-${minWidth} max-w-${maxWidth} rounded-xl p-2`,
            option: (state) =>
              `${
                state.isFocused ? "bg-neutral-200" : "bg-white"
              } py-2 px-4 rounded-xl border-slate-300 focus:border-blue-air-superiority focus:text-blue-air-superiority`,
            multiValue: () =>
              `${
                isInvalid
                  ? "bg-red-100 text-red-tomato"
                  : "bg-neutral-200 text-blue-air-superiority"
              } flex gap-x-1 py-1 px-4 rounded-xl`,
            valueContainer: () => "flex gap-x-2 gap-y-2",
          }}
          unstyled
          options={options}
          isMulti
          onChange={onChange}
          value={value}
          placeholder={null}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
        />
        <div
          className={`flex justify-center items-center gap-x-2 absolute bg-white max-h-3 left-3 px-1 pointer-events-none transition-all
                    ${
                      value.length === 0 && !isFocused
                        ? `top-4.5 ${
                            isInvalid
                              ? "text-red-tomato"
                              : "peer-focus:text-blue-air-superiority"
                          }`
                        : `-top-1.5 ${
                            isInvalid
                              ? "text-red-tomato"
                              : "text-blue-air-superiority"
                          }`
                    }`}
        >
          {icon}
          <span className="">{placeholder}</span>
        </div>
      </div>
    </div>
  );
}
