
import aZoneLogoWhite from "@images/aZone-logo-white.png";


export default function UserNavbar({
  userRole, children,
}: {
  userRole: number, children?: React.ReactNode;
}) {
  return (
    <nav className="flex items-center justify-between bg-blue-yinmn px-8 py-2 text-white shadow-md">
      {/* Left side: Logo + Sidebar toggle */}
      <div className="flex items-center gap-x-8">
        {children}
        <img src={aZoneLogoWhite} alt="aZone White Logo" />
      </div>


      {/* Right side: Profile / settings */}
      {
        userRole === 2 ?
          <div className="flex items-center gap-x-4">
            <span className="font-semibold">Admin</span>
          </div>
          :
          undefined
      }

    </nav>
  );
}
