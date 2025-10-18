import { Link } from 'react-router-dom';


/** Heavy button format. */
export default function HeavyButton({
  buttonText, submit = false, backgroundColor = "blue-air-superiority", hoverBgColor = "blue-yinmn", borderColor = "", textColor = "white", link = "", onClick = undefined
}: {
  buttonText: string, submit?: boolean, backgroundColor?: string, hoverBgColor?: string, borderColor?: string, textColor?: string, link?: string, onClick?: () => {}
}) {

  const commonClasses = `px-8 min-h-12 bg-${backgroundColor} text-${textColor} font-semibold text-2xl flex justify-center items-center rounded-2xl hover:bg-${hoverBgColor} ${borderColor.length === 0 ? "" : "border-2 border-" + borderColor} cursor-pointer`

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
