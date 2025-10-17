export default function AdminNavbar({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <nav className="flex items-center justify-between bg-blue-yinmn text-white px-6 py-4 shadow-md">
      {/* Left side: Logo + Sidebar toggle */}
      <div className="flex items-center gap-x-4">
        {children}
        <img src="/logo.svg" alt="Logo" className="h-8" />
      </div>

      {/* Right side: Profile / settings */}
      <div className="flex items-center gap-x-4">
        <span className="font-semibold">Admin</span>
      </div>
    </nav>
  );
}
