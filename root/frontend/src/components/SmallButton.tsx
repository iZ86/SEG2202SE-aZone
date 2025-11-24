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
  onClick?: () => void;
}) {
  const commonClasses = `font-nunito-sans ${Icon ? "pl-2 pr-4" : "px-4"} py-2 ${backgroundColor} ${textColor} font-bold text-base flex justify-center items-center rounded-sm ${hoverBgColor} ${borderColor.length === 0 ? "" : "border-2 " + borderColor
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
      <button type={`${submit ? "submit" : "button"}`} className={commonClasses} onClick={onClick}>
        {Icon ? <Icon /> : undefined}
        <span>{buttonText}</span>
      </button>
    );
  }
}
