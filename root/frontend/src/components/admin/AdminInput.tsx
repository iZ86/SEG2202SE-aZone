import type { MultiValue, SingleValue } from "react-select";
import Select from "react-select";

type reactSelectOption = { value: number; label: string };

export function SingleSelect({
  headerText = undefined,
  options,
  value,
  isEmpty,
  onChange,
}: {
  headerText?: string;
  options: { value: number; label: string }[];
  value: reactSelectOption;
  isEmpty: boolean;
  onChange: (choice: SingleValue<{ value: number; label: string }>) => void;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      {headerText && (
        <p className="text-md font-medium text-black">{headerText}</p>
      )}
      <div className="flex flex-col">
        <Select
          classNames={{
            control: () =>
              `${
                isEmpty
                  ? "text-red-tomato border-red-tomato"
                  : "text-gray-battleship"
              } px-4 py-2 max-w-full border rounded-xl outline-hidden`,
            menu: () =>
              "mt-1 text-gray-battleship bg-white border max-w-full rounded-xl p-2",
            option: (state) =>
              `${
                state.isFocused ? "bg-neutral-200" : "bg-white"
              } py-2 px-4 rounded-xl text-gray-battleship`,
            multiValue: () =>
              "flex gap-x-1 bg-neutral-200 text-gray-battleship py-1 px-4 rounded-xl",
            valueContainer: () => "flex gap-x-2 gap-y-2 text-black",
          }}
          unstyled
          options={options}
          onChange={onChange}
          value={value}
        />
        {isEmpty && (
          <p className="text-red-tomato pl-2">This field is required.</p>
        )}
      </div>
    </div>
  );
}

export function Filter({
  filterName,
  options,
  value,
  isEmpty,
  onChange,
}: {
  filterName: string;
  options: { value: number; label: string }[];
  value: reactSelectOption[];
  isEmpty: boolean;
  onChange: (choice: MultiValue<{ value: number; label: string }>) => void;
}) {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-md font-medium">{filterName}</p>
      <div className="flex flex-col">
        <Select
          classNames={{
            control: () =>
              `${
                isEmpty
                  ? "text-red-tomato border-red-tomato"
                  : "text-gray-battleship border-border-light"
              } px-4 py-2 text-gray-battleship max-w-full border rounded-xl outline-hidden`,
            menu: () =>
              "mt-1 text-gray-battleship bg-white border border-border-light max-w-full rounded-xl p-2",
            option: (state) =>
              `${
                state.isFocused ? "bg-neutral-200" : "bg-white"
              } py-2 px-4 rounded-xl text-gray-battleship`,
            multiValue: () =>
              "flex gap-x-1 bg-neutral-200 text-gray-battleship py-1 px-4 rounded-xl",
            valueContainer: () => "flex gap-x-2 gap-y-2",
          }}
          unstyled
          options={options}
          isMulti
          onChange={onChange}
          value={value}
        />
        {isEmpty && (
          <p className="text-red-tomato pl-2">This field is required.</p>
        )}
      </div>
    </div>
  );
}

export function ShortTextInput({
  headerText,
  placeHolderText,
  isEmpty,
  onChange,
  value,
}: {
  headerText: string;
  placeHolderText: string;
  isEmpty: boolean;
  onChange: (value: string) => void;
  value: string | number;
}) {
  let attributes: {
    type: string;
    pattern?: string;
    title?: string;
    maxLength?: number;
    minLength?: number;
  };
  switch (headerText) {
    case "Email":
      attributes = { type: "email" };
      break;
    case "Phone Number":
      attributes = {
        type: "tel",
        pattern: "^[0-9]{10,11}$", // Regex: only numbers, length must be between 10 and 11.
        title: "Phone number must be between 10 to 11 digits.",
        maxLength: 11,
      };
      break;
    case "Password":
    case "Confirm Password":
      attributes = {
        type: "password",
        pattern: "^{8,}$", // Regex: at least 8 characters.
        title: "Password must be at least 8 characters long.",
        minLength: 8,
      };
      break;
    default:
      attributes = { type: "text" };
  }

  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-md font-medium text-black">{headerText}</p>
      <div className="flex flex-col">
        <input
          {...attributes}
          className={`${
            isEmpty
              ? "text-red-tomato border-red-tomato placeholder:text-red-tomato"
              : "border-gray-battleship text-black"
          } outline-hidden max-w-full border rounded-xl px-4 h-10 text-md`}
          placeholder={placeHolderText}
          onChange={(e) => onChange(e.target.value)}
          style={{
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
          value={value}
        ></input>
        {isEmpty && (
          <p className="text-red-tomato pl-2">This field is required.</p>
        )}
      </div>
    </div>
  );
}
