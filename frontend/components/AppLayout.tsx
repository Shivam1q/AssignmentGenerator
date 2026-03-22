"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return <main className="flex-1 w-full h-full bg-[#EEEEEE]">{children}</main>;
  }

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <MobileHeader />
        <Header />
        <main className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
