"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import homeIcon from "@/app/icons/web/home.svg";
import assignmentIcon from "@/app/icons/app/assignment.svg";
import libraryIcon from "@/app/icons/app/library.svg";
import aiToolkitIcon from "@/app/icons/app/ai_toolkit.svg";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: <Image src={homeIcon} alt="Home" className="w-6 h-6 object-contain" /> },
    { name: "Assignments", href: "/assignments", icon: <Image src={assignmentIcon} alt="Assignments" className="w-6 h-6 object-contain" /> },
    { name: "Library", href: "/library", icon: <Image src={libraryIcon} alt="Library" className="w-6 h-6 object-contain" /> },
    { name: "AI Toolkit", href: "/ai-toolkit", icon: <Image src={aiToolkitIcon} alt="AI Toolkit" className="w-6 h-6 object-contain" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2C2C2C] text-gray-400 rounded-t-3xl pb-safe shadow-lg z-50 px-6 py-4 flex justify-between items-center text-[10px] font-medium">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center space-y-1 ${isActive ? "text-white" : "hover:text-gray-200 transition"}`}
          >
            <div className={`transition-all ${isActive ? "opacity-100 scale-110 brightness-0 invert" : "opacity-50 grayscale"}`}>
              {link.icon}
            </div>
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
