"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { resetPaper } from "@/store/slices/paperSlice";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StepOne from "@/components/form/StepOne";
import StepTwo from "@/components/form/StepTwo";
import Link from "next/link";

export default function CreateAssignment() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { step, jobStatus, assignmentId } = useSelector((state: RootState) => state.paper);

  useEffect(() => {
    // Reset form when mounting
    dispatch(resetPaper());
  }, [dispatch]);

  // When job starts, redirect to results page which will handle socket loading state
  useEffect(() => {
    if (jobStatus === "pending" || jobStatus === "processing") {
      if (assignmentId) {
        router.push(`/results/${assignmentId}`);
      }
    }
  }, [jobStatus, assignmentId, router]);

  return (
    <div className="max-w-4xl mx-auto w-full pt-4 pb-12">
      <div className="flex items-center space-x-4 mb-10">
        <Link href="/assignments" className="p-2 bg-white rounded-full border border-card-border hover:bg-gray-50 transition cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-primary">
             <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Create Assignment</h1>
          <p className="text-sm text-text-secondary mt-0.5">Set up a new assignment for your students</p>
        </div>
      </div>

      <div className="mb-10 px-4">
        <div className="flex items-center">
          <div className="flex-1">
             <div className={`h-1.5 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
          <div className="w-4"></div>
          <div className="flex-1">
             <div className={`h-1.5 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>

      <div className="transition-all duration-300">
        {step === 1 ? <StepOne /> : <StepTwo />}
      </div>
    </div>
  );
}
