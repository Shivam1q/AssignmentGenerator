"use client";

import Image from "next/image";
import appLogo from "@/app/icons/app/app_logo.svg";

export default function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white shadow-sm rounded-b-3xl mb-4 relative z-50">
      <div className="flex items-center space-x-2">
         <Image src={appLogo} alt="VedaAI" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-xl tracking-tight text-text-primary">VedaAI</span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative text-text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
        </button>
        
        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
           <span className="text-sm">👨‍💼</span>
        </div>
        
        <button className="text-text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
  );
}
