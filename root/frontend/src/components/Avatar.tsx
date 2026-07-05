import type { User } from "@datatypes/userType";

export default function Avatar({ user, isDropdownOpen, setIsDropdownOpen }: { user: User; isDropdownOpen: boolean; setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;}) {

  return (
    <button
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="cursor-pointer hover:opacity-80 transition-all focus:outline-none select-none text-left rounded-xl px-3 py-1.5 hover:bg-blue-icy/10"
      id="user-profile-menu-button"
    >
      <div className="flex items-center gap-3">
        <div className="text-right font-semibold">
          <p className="">{user.lastName + " " + user.firstName}</p>
        </div>
        <img
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:opacity-70 transition-opacity"
          src={user.profilePictureUrl}
          alt={`${user.lastName + " " + user.firstName}'s profile`}
        />
      </div>
    </button>

  );
}
