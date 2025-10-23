import { Link } from 'react-router-dom';


/** Medium button format. */
export default function MediumButton({
  buttonText, submit = false, backgroundColor = "bg-blue-air-superiority", hoverBgColor = "hover:bg-blue-yinmn", borderColor = "", textColor = "text-white", link = "", onClick = undefined
}: {
  buttonText: string, submit?: boolean, backgroundColor?: string, hoverBgColor?: string, borderColor?: string, textColor?: string, link?: string, onClick?: () => {}
}) {

  const commonClasses = `px-6 py-1.5 ${backgroundColor} ${textColor} font-bold text-xl flex justify-center items-center rounded-xl ${hoverBgColor} ${borderColor.length === 0 ? "" : "border-2 " + borderColor} cursor-pointer`

  if (link.length > 0) {
    return (
      <Link to={link} className={commonClasses}>{buttonText}</Link>
    );
  } else {
    return (
      <input type={`${submit ? "submit" : "button"}`} className={commonClasses} value={buttonText} onClick={onClick} />
    );

  }

}
