"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setJobStarted, setJobFailed, setJobDone } from "@/store/slices/paperSlice";
import { useSocket } from "@/hooks/useSocket";
import { fetchResult, downloadPdf, regenerateAssignment } from "@/lib/api";
import PaperHeader from "@/components/result/PaperHeader";
import StudentInfo from "@/components/result/StudentInfo";
import QuestionSection from "@/components/result/QuestionSection";
import AnswerKey from "@/components/result/AnswerKey";
import Link from "next/link";

export default function ResultPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const assignmentId = params.assignmentId as string;
  const [initialLoading, setInitialLoading] = useState(true);
  const [showRegenOpts, setShowRegenOpts] = useState(false);

  const { jobStatus, result, jobId, error } = useSelector((state: RootState) => state.paper);
  const { user } = useSelector((state: RootState) => state.auth);

  useSocket(assignmentId);

  useEffect(() => {
    // Initial load: determine if result exists or if we need to poll job
    fetchResult(assignmentId)
      .then((res) => {
        if (res.data.pending) {
          // Result not ready yet. If we don't have a jobId in Redux, we have no way to listen, so we error out.
          if (!jobId) {
            dispatch(setJobFailed({ error: "Result not found and no active job detected." }));
          }
        } else {
          // Result is ready
          dispatch(setJobDone({ result: res.data.data }));
        }
        setInitialLoading(false);
      })
      .catch((err) => {
        dispatch(setJobFailed({ error: err.message }));
        setInitialLoading(false);
      });
  }, [assignmentId, dispatch, jobId]);

  const handlePrint = async () => {
    // Generate native localized PDF Blob securely via standard Cookie credentials.
    if (result?.pdfUrl) {
      try {
        const res = await downloadPdf(assignmentId);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `QuestionPaper_${assignmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") console.error("Failed to download PDF over API", err);
        window.print(); // Fallback
      }
    } else {
      window.print(); // Fallback if backend PDF is disabled or failed
    }
  };

  const handleRegenerate = async (modifier: 'same' | 'harder' | 'easier') => {
    setShowRegenOpts(false);
    try {
      const res = await regenerateAssignment(assignmentId, modifier);
      if (res.data.success) {
        dispatch(setJobStarted({ jobId: res.data.data.jobId, assignmentId }));
      } else {
        alert("Failed to regenerate: " + res.data.message);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      // @ts-expect-error Axios error typing mismatch
      alert("Failed to regenerate: " + (err.response?.data?.message || err.message));
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-[800px] mx-auto w-full pb-20 pt-4">
        {/* Skeleton Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#2B2B2B] p-5 md:p-6 rounded-2xl mb-8 shadow-xl">
           <div className="h-4 bg-gray-600 rounded w-full max-w-xl animate-pulse flex-1 mb-5 md:mb-0"></div>
           <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 ml-auto">
             <div className="h-11 w-32 bg-gray-600 rounded-full flex-shrink-0 animate-pulse"></div>
             <div className="h-11 w-40 bg-gray-300 rounded-full flex-shrink-0 animate-pulse"></div>
           </div>
        </div>
        
        {/* Skeleton Paper Body */}
        <div className="bg-white rounded-2xl shadow-sm border border-card-border p-10 md:p-14 min-h-[1056px]">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-12 animate-pulse"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-[80%] animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-[90%] animate-pulse"></div>
            <div className="h-20 bg-gray-50 rounded w-full mt-10 animate-pulse"></div>
            <div className="h-20 bg-gray-50 rounded w-full animate-pulse"></div>
            <div className="h-20 bg-gray-50 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (jobStatus === "pending" || jobStatus === "processing") {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-20 max-w-md mx-auto text-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-card-border mb-6">
           <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="animate-spin w-full h-full text-gray-200" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75 text-primary" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
           </div>
           <h2 className="text-xl font-bold text-text-primary mb-2">Generating Question Paper...</h2>
           <p className="text-text-secondary text-sm">Our AI is currently curating the best questions based on your rubrics. This usually takes 10-15 seconds.</p>
        </div>
      </div>
    );
  }

  if (jobStatus === "failed" || error) {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-20 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md">
          <h2 className="text-lg font-bold mb-2">Generation Failed</h2>
          <p className="text-sm">{error || "Something went wrong while generating the paper."}</p>
          <Link href="/assignments/create" className="mt-4 inline-block bg-white text-text-primary px-6 py-2 rounded-lg font-medium border shadow-sm hover:bg-gray-50">Try Again</Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="max-w-[800px] mx-auto w-full pb-20 pt-4">
      
      {/* Action Bar - Hidden during print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#2B2B2B] text-white p-5 md:p-6 rounded-2xl mb-8 shadow-xl print:hidden sticky top-4 z-50">
        <p className="text-[14px] font-medium leading-relaxed md:max-w-xl lg:max-w-2xl mb-5 md:mb-0 md:mr-4 flex-1">
          Certainly, {user?.name || "Teacher"}! Here are customized Question Paper for your {result.className} {result.subject} classes on the NCERT chapters:
        </p>
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 w-full md:w-auto relative">
          <button 
            onClick={() => setShowRegenOpts(!showRegenOpts)}
            className="w-11 h-11 md:w-auto md:px-5 md:py-2.5 rounded-full bg-[#424242] hover:bg-gray-700 text-white font-bold text-sm transition shadow flex items-center justify-center flex-shrink-0 border border-gray-600 md:border-none"
            title="Regenerate Options"
          >
            <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline whitespace-nowrap">Regenerate</span>
          </button>
          
          {showRegenOpts && (
            <div className="absolute top-12 md:top-14 right-0 md:right-auto md:left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 text-gray-800">
              <button onClick={() => handleRegenerate('same')} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium transition-colors">Same Difficulty</button>
              <button onClick={() => handleRegenerate('harder')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors">Make it Harder</button>
              <button onClick={() => handleRegenerate('easier')} className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm font-medium text-green-600 transition-colors">Make it Easier</button>
            </div>
          )}
          
          <button 
            onClick={handlePrint}
            className="w-11 h-11 md:w-auto md:px-5 md:py-2.5 bg-white text-text-primary rounded-full font-bold text-sm hover:bg-gray-100 transition shadow flex items-center justify-center flex-shrink-0"
            title="Download as PDF"
          >
            <svg className="w-5 h-5 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden md:inline whitespace-nowrap">Download as PDF</span>
          </button>
        </div>
      </div>

      {/* The Paper output */}
      <div className="bg-white rounded-2xl shadow-sm border border-card-border p-10 md:p-14 print:p-0 print:border-none print:shadow-none min-h-[1056px]">
        <PaperHeader 
          schoolName={result.schoolName}
          subject={result.subject}
          className={result.className}
          timeAllowed={result.timeAllowed}
          maximumMarks={result.maximumMarks}
        />

        <StudentInfo generalInstruction={result.generalInstruction} />

        {result.sections.map((section, idx) => (
          <QuestionSection key={idx} section={section} />
        ))}

        <div className="text-center font-bold mt-12 mb-6">
          End of Question Paper
        </div>

        <AnswerKey answerKey={result.answerKey} />
      </div>
    </div>
  );
}
