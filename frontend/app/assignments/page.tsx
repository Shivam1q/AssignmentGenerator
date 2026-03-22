"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAssignments } from "@/store/slices/assignmentSlice";
import AssignmentCard from "@/components/AssignmentCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import noAssignmentsIcon from "@/app/icons/web/no_assignments.svg";

export default function AssignmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { assignments, loading } = useSelector((state: RootState) => state.assignments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"name" | "date-created" | "date-due">("name");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  let filteredAssignments = [...assignments];

  if (searchTerm) {
    filteredAssignments = filteredAssignments.filter((a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filteredAssignments.sort((a, b) => {
    if (filterType === "name") {
      return a.title.localeCompare(b.title);
    } else if (filterType === "date-created") {
      const dateA = a.assignedOn ? new Date(a.assignedOn).getTime() : 0;
      const dateB = b.assignedOn ? new Date(b.assignedOn).getTime() : 0;
      return dateB - dateA; // Descending
    } else if (filterType === "date-due") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA; // Descending
    }
    return 0;
  });

  return (
    <div className="h-full flex flex-col pt-0 md:pt-6 w-full max-w-[1200px] mx-auto relative pb-24 md:pb-6 px-4 md:px-8">
      
      {/* Mobile top header integration */}
      <div className="md:hidden flex items-center mb-6 pt-2">
         <button onClick={() => router.push("/")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-text-primary mr-4">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="15 18 9 12 15 6"></polyline>
           </svg>
         </button>
         <h1 className="text-[20px] font-extrabold text-[#2B2B2B] flex-1 text-center pr-14">Assignments</h1>
      </div>

      {assignments.length > 0 && !loading && (
        <>
          {/* Desktop Info header */}
          <div className="hidden md:block mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></div>
              <h1 className="text-[22px] font-extrabold text-[#2B2B2B] tracking-tight">Assignments</h1>
            </div>
            <p className="text-[14px] text-[#A0A0A0] mt-1 ml-5 font-medium">Manage and create assignments for your classes.</p>
          </div>

          {/* Unified Filter and Search Row */}
          <div className="flex items-center justify-between bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-2 md:p-3 mb-8 md:mb-10 w-full relative z-30 border border-gray-100/50">
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-2 text-[#7B7B7B] hover:text-[#2B2B2B] px-3 py-2 transition-all bg-transparent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span className="text-[14px] font-medium hidden md:inline">
                  Filter By
                </span>
                <span className="text-[14px] font-medium md:hidden">
                  Filter
                </span>
              </button>

              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <button onClick={() => { setFilterType("name"); setShowFilterMenu(false); }} className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition ${filterType === 'name' ? 'bg-[#F5F5F5] text-[#2B2B2B]' : 'text-[#7B7B7B] hover:bg-gray-50'}`}>By Name</button>
                  <button onClick={() => { setFilterType("date-created"); setShowFilterMenu(false); }} className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition ${filterType === 'date-created' ? 'bg-[#F5F5F5] text-[#2B2B2B]' : 'text-[#7B7B7B] hover:bg-gray-50'}`}>By Date Created</button>
                  <button onClick={() => { setFilterType("date-due"); setShowFilterMenu(false); }} className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition ${filterType === 'date-due' ? 'bg-[#F5F5F5] text-[#2B2B2B]' : 'text-[#7B7B7B] hover:bg-gray-50'}`}>By Date Due</button>
                </div>
              )}
            </div>

            {/* Search Bar Pill */}
            <div className="w-[60%] md:w-[400px]">
              <div className="bg-white rounded-full border border-[#EBEBEB] flex items-center h-[44px] md:h-[48px] px-4 md:px-5 focus-within:border-gray-300 focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#A0A0A0]" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder={typeof window !== 'undefined' && window.innerWidth < 768 ? "Search Name" : "Search Assignment"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[14px] text-[#2B2B2B] placeholder-[#A0A0A0] pl-3 h-full font-medium"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pb-[140px] md:pb-32 w-full mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-[180px] w-full border border-gray-100/50 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse mt-2"></div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="h-4 bg-gray-100 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto mt-6 md:mt-20 px-4">
          <div className="relative mb-8 md:mb-10 flex justify-center">
            <Image src={noAssignmentsIcon} alt="No Assignments" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
          </div>
          
          <h2 className="text-[20px] md:text-[22px] font-bold text-[#2B2B2B] mb-3 md:mb-4">No assignments yet</h2>
          <p className="text-[#7B7B7B] text-[14px] md:text-[15px] mb-8 md:mb-10 leading-relaxed max-w-md font-medium px-2 md:px-0">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <Link
            href="/assignments/create"
            className="hidden md:flex bg-[#1E1E1E] text-white px-8 py-3.5 rounded-full font-medium hover:bg-black transition shadow-[0_4px_16px_rgba(0,0,0,0.15)] items-center space-x-2"
          >
            <span className="text-xl leading-none -mt-0.5">+</span>
            <span className="text-[15px]">Create Your First Assignment</span>
          </Link>
          <Link
            href="/assignments/create"
            className="md:hidden bg-[#1E1E1E] text-white px-8 py-3.5 rounded-full font-medium active:scale-95 transition shadow-lg flex items-center space-x-2 mx-auto w-auto"
          >
            <span className="text-xl leading-none -mt-0.5">+</span>
            <span className="text-[15px]">Create Your First Assignment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pb-[140px] md:pb-32 w-full">
          {filteredAssignments.map((assignment) => (
             <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}

          {filteredAssignments.length === 0 && (
             <div className="col-span-full py-12 text-center text-[#7B7B7B] font-medium">
               No assignments match your search.
             </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons */}
      {assignments.length > 0 && !loading && (
        <>
          {/* Desktop Fixed Bottom Button */}
          <div className="hidden md:flex fixed bottom-8 left-1/2 md:left-[calc(50%+140px)] -translate-x-1/2 z-40">
            <Link
              href="/assignments/create"
              className="bg-[#2D2D2D] text-white px-7 py-3.5 rounded-full font-medium hover:bg-black transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center space-x-2 border border-black"
            >
              <span className="text-xl leading-none font-light">+</span>
              <span className="text-[15px]">Create Assignment</span>
            </Link>
          </div>
          
          {/* Mobile Floating Action Button */}
          <div className="md:hidden fixed bottom-28 right-6 z-40">
             <Link
                href="/assignments/create"
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 active:scale-95 transition-transform"
             >
                <div className="w-8 h-8 rounded-full border border-gray-100 shadow flex items-center justify-center bg-white text-[#E8572A]">
                     <span className="text-2xl leading-none font-light -mt-1">+</span>
                </div>
             </Link>
          </div>
        </>
      )}
    </div>
  );
}
