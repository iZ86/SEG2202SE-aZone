import Select, { type MultiValue } from "react-select";
import type { reactSelectOptionType } from "datatypes/reactSelectOptionType";
import { type ReactElement, useState } from "react";

export function MultiFilter({
  placeholder,
  icon = undefined,
  options,
  value,
  isEmpty,
  onChange,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
}: {
  placeholder: string;
  icon?: ReactElement;
  options: reactSelectOptionType[];
  value: reactSelectOptionType[];
  isEmpty: boolean;
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
                ? isEmpty
                  ? "text-red-tomato border-red-tomato"
                  : "text-gray-davy border-gray-davy"
                : isEmpty
                ? "text-red-tomato border-red-tomato"
                : "text-blue-marian border-blue-marian"
            }
            px-4 w-${width} max-w-${maxWidth} min-w-${minWidth} border-2 rounded-2xl outline-hidden ${
              value.length > 0 ? "py-1.5" : undefined
            }`,
            menu: () =>
              `text-gray-davy bg-white border-2 border-blue-marian mt-1 w-${width} min-w-${minWidth} max-w-${maxWidth} rounded-2xl p-2`,
            option: (state) =>
              `${
                state.isFocused ? "bg-neutral-200" : "bg-white"
              } py-2 px-4 rounded-xl text-davy-gray`,
            multiValue: () =>
              "flex gap-x-1 bg-neutral-200 text-davy-gray py-1 px-4 rounded-xl",
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
        {isEmpty && (
          <p className="text-red-tomato pl-2">This field is required.</p>
        )}
        <div
          className={`flex justify-center items-center gap-x-2 absolute bg-white max-h-3 left-3 px-1 pointer-events-none transition-all
                    ${
                      value.length === 0 && !isFocused
                        ? `top-4.5 ${
                            isEmpty ? "text-red-tomato" : "text-gray-davy"
                          }`
                        : `-top-1.5 ${
                            isEmpty ? "text-red-tomato" : "text-blue-marian"
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
