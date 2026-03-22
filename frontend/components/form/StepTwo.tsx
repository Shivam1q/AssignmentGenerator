"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { updateFormData, setStep, submitAssignment } from "@/store/slices/paperSlice";
import { useState, useRef, useEffect } from "react";

export default function StepTwo() {
  const dispatch = useDispatch<AppDispatch>();
  const { formData, isSubmitting } = useSelector((state: RootState) => state.paper);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate totals
  useEffect(() => {
    const totalQ = formData.questionTypes?.reduce((acc, qt) => acc + (qt.numQuestions || 0), 0) || 0;
    const totalM = formData.questionTypes?.reduce((acc, qt) => acc + ((qt.numQuestions || 0) * (qt.marksPerQuestion || 0)), 0) || 0;
    
    dispatch(updateFormData({ totalQuestions: totalQ, totalMarks: totalM }));
  }, [formData.questionTypes, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      dispatch(updateFormData({ file: e.target.files[0] }));
    }
  };

  const handleUpdateLine = (index: number, field: string, value: string | number) => {
    const newQTypes = [...(formData.questionTypes || [])];
    newQTypes[index] = { ...newQTypes[index], [field]: value };
    dispatch(updateFormData({ questionTypes: newQTypes }));
  };

  const addLine = () => {
    dispatch(
      updateFormData({
        questionTypes: [
          ...(formData.questionTypes || []),
          { type: "Short Questions", numQuestions: 1, marksPerQuestion: 2 },
        ],
      })
    );
  };

  const removeLine = (index: number) => {
    const newQTypes = (formData.questionTypes || []).filter((_, i) => i !== index);
    dispatch(updateFormData({ questionTypes: newQTypes }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (!formData.questionTypes || formData.questionTypes.length === 0) {
      newErrors.questionTypes = "At least one question type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const multipart = new FormData();
    multipart.append("title", formData.title || "");
    multipart.append("schoolName", formData.schoolName || "");
    multipart.append("subject", formData.subject || "");
    multipart.append("className", formData.className || "");
    multipart.append("dueDate", formData.dueDate || "");
    multipart.append("questionTypes", JSON.stringify(formData.questionTypes));
    multipart.append("totalQuestions", String(formData.totalQuestions || 0));
    multipart.append("totalMarks", String(formData.totalMarks || 0));
    multipart.append("additionalInstructions", formData.additionalInstructions || "");

    if (formData.file) {
      multipart.append("file", formData.file);
    }

    dispatch(submitAssignment(multipart));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-card-border p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-1">Assignment Details</h2>
        <p className="text-sm text-text-secondary">Basic information about your assignment</p>
      </div>

      <div className="space-y-8">
        {/* File Upload */}
        <div>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white p-3 rounded-full shadow-sm mb-4 border border-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-primary">
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold text-text-primary mb-1">
              Choose a file or drag & drop it here
            </p>
            <p className="text-xs text-text-secondary mb-4">JPEG, PNG, upto 10MB</p>
            <button className="px-4 py-2 border border-input-border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              {formData.file ? formData.file.name : "Browse Files"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2 text-center">Upload images of your preferred document/image</p>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Due Date *</label>
          <input
            type="date"
            value={formData.dueDate || ""}
            onChange={(e) => {
              dispatch(updateFormData({ dueDate: e.target.value }));
              if (errors.dueDate) setErrors({ ...errors, dueDate: "" });
            }}
            className={`w-full p-3 border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${errors.dueDate ? "border-red-500" : "border-input-border"}`}
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>

        {/* Question Types */}
        <div>
          <div className="flex justify-between items-end mb-4 text-sm font-semibold text-text-primary px-1">
            <span>Question Type</span>
            <div className="flex space-x-[72px] mr-[30px]">
              <span>No. of Questions</span>
              <span>Marks</span>
            </div>
          </div>

          <div className="space-y-4">
            {formData.questionTypes?.map((qt, index) => (
              <div key={index} className="flex items-center space-x-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <select
                  value={qt.type}
                  onChange={(e) => handleUpdateLine(index, "type", e.target.value)}
                  className="flex-1 p-3 bg-white border border-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm appearance-none cursor-pointer"
                  style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="%236B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                >
                  <option value="Multiple Choice Questions">Multiple Choice Questions</option>
                  <option value="Short Questions">Short Questions</option>
                  <option value="Long Questions">Long Questions</option>
                  <option value="Diagram/Graph-Based Questions">Diagram/Graph-Based Questions</option>
                  <option value="Numerical Problems">Numerical Problems</option>
                </select>
                
                <button onClick={() => removeLine(index)} className="text-text-secondary hover:text-red-500 transition px-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4 bg-white border border-input-border rounded-lg px-4 py-2">
                    <button onClick={() => handleUpdateLine(index, "numQuestions", Math.max(1, qt.numQuestions - 1))} className="text-text-secondary hover:text-text-primary text-xl font-medium">−</button>
                    <span className="w-4 text-center font-bold">{qt.numQuestions}</span>
                    <button onClick={() => handleUpdateLine(index, "numQuestions", qt.numQuestions + 1)} className="text-text-secondary hover:text-text-primary text-xl font-medium">+</button>
                  </div>
                  <div className="flex items-center space-x-4 bg-white border border-input-border rounded-lg px-4 py-2">
                    <button onClick={() => handleUpdateLine(index, "marksPerQuestion", Math.max(1, qt.marksPerQuestion - 1))} className="text-text-secondary hover:text-text-primary text-xl font-medium">−</button>
                    <span className="w-4 text-center font-bold">{qt.marksPerQuestion}</span>
                    <button onClick={() => handleUpdateLine(index, "marksPerQuestion", qt.marksPerQuestion + 1)} className="text-text-secondary hover:text-text-primary text-xl font-medium">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {errors.questionTypes && <p className="text-red-500 text-xs mt-2">{errors.questionTypes}</p>}

          <div className="mt-4">
             <button 
              onClick={addLine}
              className="flex items-center space-x-2 text-sm font-semibold text-text-primary hover:text-primary transition bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
            >
              <div className="bg-text-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs pb-0.5">+</div>
              <span>Add Question Type</span>
            </button>
          </div>

          <div className="mt-6 flex flex-col items-end pr-8 text-sm gap-1">
            <p className="font-semibold text-text-secondary">Total Questions = <span className="text-text-primary ml-1">{formData.totalQuestions}</span></p>
            <p className="font-semibold text-text-secondary bg-gray-100 px-3 py-1 rounded inline-block">Total Marks = <span className="text-text-primary ml-1">{formData.totalMarks}</span></p>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Additional Information (For better output)</label>
          <div className="relative">
            <textarea
              value={formData.additionalInstructions || ""}
              onChange={(e) => dispatch(updateFormData({ additionalInstructions: e.target.value }))}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              className="w-full p-4 border border-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow min-h-[120px] resize-none bg-gray-50/50"
            />
            <button className="absolute bottom-4 right-4 p-2 bg-text-primary text-white rounded-lg hover:bg-black transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V13M12 2C10.3431 2 9 3.34315 9 5V10C9 11.6569 10.3431 13 12 13M12 2C13.6569 2 15 3.34315 15 5V10C15 11.6569 13.6569 13 12 13M19 10V11C19 14.866 15.866 18 12 18M5 10V11C5 14.866 8.13401 18 12 18M12 18V22M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between items-center">
        <button
          onClick={() => dispatch(setStep(1))}
          className="px-6 py-3 border border-input-border rounded-full font-medium text-text-primary hover:bg-gray-50 transition flex items-center"
        >
          <svg className="mr-2 w-4 h-4" transform="scale(-1, 1)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-text-primary text-white px-8 py-3 rounded-full font-medium hover:bg-black transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center shadow-lg"
        >
          {isSubmitting ? "Generating..." : "Next"}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
