import type { LucideIcon } from "lucide-react";

/**
 * default width is full.
 * default minWidth is 48.
 * default maxWidth is 74.
 */
export default function NormalTextField({
  text,
  onChange,
  isInvalid,
  placeholder,
  Icon = undefined,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
  isDisabled = false,
}: {
  text: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
  placeholder: string;
  Icon?: LucideIcon;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  isDisabled?: boolean;
}) {
  let attributes: {
    type: string;
    pattern?: string;
    title?: string;
    maxLength?: number;
    minLength?: number;
  };
  switch (placeholder) {
    case "Subject Code (e.g., SEG1024)":
      attributes = {
        type: "text",
        pattern: "^[A-Z]{3}\\d{4}$", // 3 uppercase letters + 4 digits
        title: "Subject code must be in the format ABC1234",
        maxLength: 7,
        minLength: 7,
      };
      break;
    case "Email (e.g., john@example.com)":
      attributes = { type: "email" };
      break;
    case "Phone Number (e.g., 0123456789)":
      attributes = {
        type: "tel",
        pattern: "^01\\d{8,9}$", // Regex: only numbers, length must be between 10 and 11.
        title: "Phone number must start with 01 and contain 10-11 digits",
        maxLength: 11,
      };
      break;
    case "Intake ID":
      attributes = {
        type: "text",
        pattern: "^\\d{6}$",
        title: "Intake ID must be in the format YYYYMM",
        maxLength: 6,
        minLength: 6,
      };
      break;
    default:
      attributes = { type: "text" };
  }

  return (
    <div>
      <div
        className={`relative w-${width} max-w-${maxWidth} min-w-${minWidth} text-base text-gray-battleship`}
      >
        <input
          disabled={isDisabled}
          {...attributes}
          value={text}
          className={`min-h-12 w-${width} max-w-${maxWidth} min-w-${minWidth} rounded-2xl border-2 px-4 outline-hidden peer
                    ${
                      text.length === 0
                        ? isInvalid
                          ? "border-red-tomato"
                          : "border-gray-battleship focus:border-blue-air-superiority focus:text-blue-air-superiority"
                        : isInvalid
                        ? "border-red-tomato text-red-tomato"
                        : "border-blue-air-superiority text-blue-air-superiority"
                    }`}
          onChange={(e) => onChange(e.target.value)}
        />
        <div
          className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none
                    ${
                      text.length === 0
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
          {Icon ? <Icon /> : undefined}
          <span>{placeholder}</span>
        </div>
      </div>
    </div>
  );
}
