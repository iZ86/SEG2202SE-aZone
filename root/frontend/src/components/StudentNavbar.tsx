import { Menu } from "lucide-react";
import logo from "@images/logo.png";
import { Link } from "react-router-dom";


function NavbarItem({ text, link }: { text: string, link: string }) {
  return (
    <Link to={link}>
      <h6 className="text-xl font-semibold text-white">{text}</h6>
    </Link>
  );

}

export default function StudentNavbar() {
  return (
    <div className="flex bg-blue-yinmn px-12 py-2 items-center">
      <div className="flex gap-x-12 items-center">

        <Menu size={48} className="cursor-pointer" />
        <img src={logo} className="cursor-pointer" />
        <div className="flex gap-x-8 items-center">
          <NavbarItem text={"Home"} link={"/login"} />
          <NavbarItem text={"Academic"} link={"/login"} />
          <NavbarItem text={"Fees Summary"} link={"/login"} />
          <NavbarItem text={"Help & Contact"} link={"/login"} />
        </div>
      </div>
    </div>
  );
}
