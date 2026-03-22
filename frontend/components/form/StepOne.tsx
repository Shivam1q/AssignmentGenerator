"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateFormData, setStep } from "@/store/slices/paperSlice";
import { useState } from "react";

export default function StepOne() {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.paper.formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFormData({ [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = "Assignment title is required";
    if (!formData.schoolName?.trim()) newErrors.schoolName = "School name is required";
    if (!formData.subject?.trim()) newErrors.subject = "Subject is required";
    if (!formData.className?.trim()) newErrors.className = "Class is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch(setStep(2));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-card-border p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-1">Assignment Details</h2>
        <p className="text-sm text-text-secondary">Basic information about your assignment</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Assignment Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            placeholder="e.g., Quiz on Electricity"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${errors.title ? "border-red-500" : "border-input-border"}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">School Name *</label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName || ""}
            onChange={handleChange}
            placeholder="e.g., Delhi Public School"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${errors.schoolName ? "border-red-500" : "border-input-border"}`}
          />
          {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject || ""}
              onChange={handleChange}
              placeholder="e.g., Science"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${errors.subject ? "border-red-500" : "border-input-border"}`}
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Class *</label>
            <input
              type="text"
              name="className"
              value={formData.className || ""}
              onChange={handleChange}
              placeholder="e.g., 8th Grade"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${errors.className ? "border-red-500" : "border-input-border"}`}
            />
            {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={handleNext}
          className="bg-text-primary text-white px-8 py-3 rounded-full font-medium hover:bg-black transition flex items-center shadow-lg"
        >
          Next
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
