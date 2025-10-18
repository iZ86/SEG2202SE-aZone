import { Menu } from "lucide-react";
import aZoneLogoWhite from "@images/aZone-logo-white.png";



export default function StudentNavbar() {
  return (
    <div className="flex bg-blue-yinmn px-12 py-2 items-center">
      <div className="flex gap-x-12 items-center">

        <Menu size={48} className="cursor-pointer" />
        <img src={aZoneLogoWhite} className="cursor-pointer" />
        <div className="flex gap-x-8 items-center">
        </div>
      </div>
    </div>
  );
}
