"use client";

import AdminUserDropdown from "./AdminUserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import Image from "next/image";
import Wallete from "./Wallete";
import Nav from "./Nav";

const user = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  image: "/user.jpeg",
};

const HeaderNav = () => {
  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between h-17 shrink-0 items-center gap-2 border-b border-white/10 bg-black px-4">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="logo"
          width={100}
          height={100}
          className="max-w-[280px] w-full h-full object-contain"
        />
      </div>

      {/* Middle Section: Classic Text Menu */}
      <Nav />

      {/* Right Section: User Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <NotificationDropdown />
        </div>

        <div className="flex items-center gap-4">
          <Wallete />
          <AdminUserDropdown user={user} handleLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
