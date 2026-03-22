"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  
  // Quick redirect check: if they somehow hit a missing route and ARE NOT authenticated, redirect them out immediately
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Small timeout to allow hydration checks to finish
      const timer = setTimeout(() => {
        router.push("/login");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="h-full flex flex-col items-center justify-center pt-16 pb-20 text-center px-4">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-xl w-full">
        <div className="text-6xl mb-6 flex justify-center space-x-2">
           <span className="animate-bounce" style={{ animationDelay: "0ms" }}>🚧</span>
           <span className="animate-bounce" style={{ animationDelay: "150ms" }}>🛠️</span>
           <span className="animate-bounce" style={{ animationDelay: "300ms" }}>✨</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#2B2B2B] mb-4">Under Construction!</h1>
        <p className="text-[#7B7B7B] text-[15px] font-medium leading-relaxed mb-8 max-w-md mx-auto">
          We are currently brewing up something magical for this page. Our AI teachers are working hard behind the scenes!
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center space-x-2 bg-[#E8572A] hover:bg-[#D4471C] text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-[0_4px_16px_rgba(232,87,42,0.3)] hover:shadow-[0_6px_20px_rgba(232,87,42,0.4)] hover:-translate-y-0.5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
