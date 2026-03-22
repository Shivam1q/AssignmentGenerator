"use client";

import { Assignment } from "@/types";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { deleteAssignment } from "@/store/slices/assignmentSlice";
import { AppDispatch } from "@/store";

interface Props {
  assignment: Assignment;
}

export default function AssignmentCard({ assignment }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).replace(/\//g, "-");
    } catch {
      return dateString || "20-06-2025";
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      dispatch(deleteAssignment(assignment._id));
    }
    setMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EBEBEB] p-6 relative hover:shadow-md transition-shadow flex flex-col w-full h-[140px] md:h-[150px]">
      <div className="flex justify-between items-start">
        <h3 className="font-extrabold text-xl text-[#2B2B2B] tracking-tight truncate pr-4" style={{ fontFamily: "inherit" }}>
          {assignment.title}
        </h3>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#7B7B7B] hover:text-[#2B2B2B] p-1 -mt-1 -mr-1 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 z-10 overflow-hidden py-2 font-medium">
              <Link 
                href={`/results/${assignment._id}`}
                className="block w-full text-left px-5 py-2.5 text-[13px] text-[#2B2B2B] hover:bg-gray-50 transition"
              >
                View Assignment
              </Link>
              <button 
                onClick={handleDelete}
                className="block w-full text-left px-5 py-2.5 text-[13px] text-[#E8572A] hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto text-[13px] leading-none mb-1 text-[#7B7B7B]">
        <div>
          <span className="font-bold text-[#2B2B2B]">Assigned on : </span>
          {formatDate(assignment.assignedOn)}
        </div>
        <div>
          <span className="font-bold text-[#2B2B2B]">Due : </span>
          {formatDate(assignment.dueDate)}
        </div>
      </div>
    </div>
  );
}
