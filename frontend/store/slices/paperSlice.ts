import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AssignmentFormData, GeneratedPaper } from "@/types";
import { createAssignment } from "@/lib/api";

interface PaperState {
  step: 1 | 2;
  formData: Partial<AssignmentFormData>;
  jobId: string | null;
  assignmentId: string | null;
  jobStatus: "idle" | "pending" | "processing" | "done" | "failed";
  result: GeneratedPaper | null;
  error: string | null;
  isSubmitting: boolean;
}

const initialState: PaperState = {
  step: 1,
  formData: {
    questionTypes: [{ type: "Multiple Choice Questions", numQuestions: 4, marksPerQuestion: 1 }],
  },
  jobId: null,
  assignmentId: null,
  jobStatus: "idle",
  result: null,
  error: null,
  isSubmitting: false,
};

export const submitAssignment = createAsyncThunk(
  "paper/submit",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await createAssignment(formData);
      return response.data; // { success: true, data: { assignmentId, jobId } }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit assignment"
      );
    }
  }
);

const paperSlice = createSlice({
  name: "paper",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<1 | 2>) => {
      state.step = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<AssignmentFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setJobStarted: (
      state,
      action: PayloadAction<{ jobId: string; assignmentId: string }>
    ) => {
      state.jobId = action.payload.jobId;
      state.assignmentId = action.payload.assignmentId;
      state.jobStatus = "pending";
      state.error = null;
    },
    setJobProcessing: (state) => {
      state.jobStatus = "processing";
    },
    setJobDone: (state, action: PayloadAction<{ result: GeneratedPaper }>) => {
      state.jobStatus = "done";
      state.result = action.payload.result;
    },
    setJobFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.jobStatus = "failed";
      state.error = action.payload.error;
    },
    resetPaper: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAssignment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.jobId = action.payload.data.jobId;
        state.assignmentId = action.payload.data.assignmentId;
        state.jobStatus = "pending";
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setStep,
  updateFormData,
  setJobStarted,
  setJobProcessing,
  setJobDone,
  setJobFailed,
  resetPaper,
} = paperSlice.actions;

export default paperSlice.reducer;
