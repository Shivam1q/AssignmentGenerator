"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useEffect } from "react";
import { fetchAssignments } from "@/store/slices/assignmentSlice";
import Image from "next/image";
import homeIcon from "@/app/icons/web/home.svg";
import myGroupsIcon from "@/app/icons/web/my_groups.svg";
import assignmentIcon from "@/app/icons/web/assignment.svg";
import aiToolkitIcon from "@/app/icons/web/ai_teacher_toolkit.svg";
import myLibraryIcon from "@/app/icons/web/my_library.svg";
import createIcon from "@/app/icons/web/create_assignment_sidebar.svg";
import webLogo from "@/app/icons/web/web_logo.svg";

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { assignments } = useSelector((state: RootState) => state.assignments);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const navLinks = [
    { 
      name: "Home", 
      href: "/", 
      icon: <Image src={homeIcon} alt="Home" className="w-[22px] h-[22px] object-contain" /> 
    },
    { 
      name: "My Groups", 
      href: "/groups", 
      icon: <Image src={myGroupsIcon} alt="My Groups" className="w-[22px] h-[22px] object-contain" /> 
    },
    { 
      name: "Assignments", 
      href: "/assignments", 
      icon: <Image src={assignmentIcon} alt="Assignments" className="w-[22px] h-[22px] object-contain" />,
      badge: assignments ? assignments.length : 0
    },
    { 
      name: "AI Teacher's Toolkit", 
      href: "/ai-toolkit", 
      icon: <Image src={aiToolkitIcon} alt="AI Teacher's Toolkit" className="w-[22px] h-[22px] object-contain" /> 
    },
    { 
      name: "My Library", 
      href: "/library", 
      icon: <Image src={myLibraryIcon} alt="My Library" className="w-[22px] h-[22px] object-contain" /> 
    },
  ];

  return (
    <aside className="w-[280px] bg-white m-4 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between hidden md:flex h-[calc(100vh-2rem)] flex-shrink-0 z-20">
      <div>
        <div className="p-8 flex items-center space-x-3">
          <div className="relative shadow-sm flex items-center justify-center">
             <Image src={webLogo} alt="VedaAI" className="w-[50px] h-[50px] object-contain" />
          </div>
          <span className="font-extrabold text-[22px] tracking-tight text-[#2B2B2B]">VedaAI</span>
        </div>

        <div className="px-6 mb-8">
          <Link
            href="/assignments/create"
            className="w-full flex items-center justify-center space-x-2 bg-[#2D2D2D] py-[14px] rounded-full text-white hover:bg-black border-2 border-[#E8572A]/30 transition-all duration-300 shadow-[0_4px_16px_rgba(232,87,42,0.2)]"
          >
            <Image src={createIcon} alt="Create" className="w-5 h-5 object-contain" />
            <span className="font-medium text-[15px]">Create Assignment</span>
          </Link>
        </div>

        <nav className="space-y-1.5 px-6 font-medium">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href) && link.href !== "/" || (pathname === link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl transition-all active:bg-[#EBEBEB] ${
                  isActive
                    ? "bg-[#F5F5F5] text-[#2B2B2B] active:text-black"
                    : "text-[#7B7B7B] hover:text-[#4B4B4B] active:text-black"
                }`}
              >
                <div className={`w-[22px] h-[22px] flex items-center justify-center transition-all group-active:brightness-0 opacity-100 ${isActive ? "scale-105 group-active:scale-95" : "opacity-60 grayscale group-hover:opacity-80 group-active:grayscale-0 group-active:scale-95"}`}>
                  {link.icon}
                </div>
                <span className={`text-[15px] transition-all group-active:font-bold ${isActive ? "font-semibold" : ""}`}>{link.name}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="bg-[#E8572A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        <Link href="/settings" className="flex items-center space-x-3.5 text-[15px] font-medium text-[#7B7B7B] hover:text-[#2B2B2B] px-4 py-3 mb-4 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
        </Link>
        
        <div className="bg-[#F6F6F6] rounded-2xl p-3 flex items-center space-x-3">
          <div className="w-11 h-11 bg-orange-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
             <span className="text-xl">{user?.avatar || '🏫'}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-[14px] font-bold text-[#2B2B2B] leading-tight mb-0.5 truncate">{user?.schoolName || 'Your School'}</p>
            <p className="text-[12px] text-[#7B7B7B] font-medium leading-none truncate">{user?.city || 'City'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
