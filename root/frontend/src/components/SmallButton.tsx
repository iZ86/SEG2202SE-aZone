import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

/** Small button format. */
export default function SmallButton({
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
        ? "pl-2 pr-4"
        : undefined
      : hasPadding
      ? "px-4"
      : undefined
  } ${
    hasPadding ? "py-2" : undefined
  } ${backgroundColor} ${textColor} font-bold text-base flex  gap-x-2 justify-center items-center rounded-sm ${hoverBgColor} ${
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
