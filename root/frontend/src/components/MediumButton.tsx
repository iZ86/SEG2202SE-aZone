import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

/** Medium button format. */
export default function MediumButton({
  buttonText,
  Icon = undefined,
  submit = false,
  backgroundColor = "bg-blue-air-superiority",
  hoverBgColor = "hover:bg-blue-yinmn",
  borderColor = "",
  textColor = "text-white",
  link = "",
  hasPadding = true,
  onClick = undefined,
}: {
  buttonText: string;
  Icon?: LucideIcon;
  submit?: boolean;
  backgroundColor?: string;
  hoverBgColor?: string;
  borderColor?: string;
  textColor?: string;
  link?: string;
  hasPadding?: boolean;
  onClick?: () => void;
}) {
  const commonClasses = `font-nunito-sans ${
    Icon
      ? hasPadding
        ? "pl-4 pr-6"
        : undefined
      : hasPadding
      ? "px-6"
      : undefined
  } ${
    hasPadding ? "py-3" : undefined
  } ${backgroundColor} ${textColor} font-bold text-xl flex gap-x-2 justify-center items-center rounded-md ${hoverBgColor} ${
    borderColor.length === 0 ? "" : "border-2 " + borderColor
  } cursor-pointer`;

  if (link.length > 0) {
    return (
      <Link to={link} className={commonClasses}>
        {Icon ? <Icon /> : undefined}
        <span>{buttonText}</span>
      </Link>
    );
  } else {
    return (
      <button
        type={`${submit ? "submit" : "button"}`}
        className={commonClasses}
        onClick={onClick}
      >
        {Icon ? <Icon /> : undefined}
        <span>{buttonText}</span>
      </button>
    );
  }
}
