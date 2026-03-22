import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Assignment } from "@/types";
import { fetchAssignments as fetchAssignmentsApi, deleteAssignment as deleteAssignmentApi } from "@/lib/api";

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  loading: false,
  error: null,
};

export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAssignmentsApi();
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch assignments"
      );
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  "assignments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteAssignmentApi(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete assignment"
      );
    }
  }
);

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAssignments.fulfilled,
        (state, action: PayloadAction<Assignment[]>) => {
          state.loading = false;
          state.assignments = action.payload;
        }
      )
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(
        deleteAssignment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.assignments = state.assignments.filter(
            (a) => a._id !== action.payload
          );
        }
      );
  },
});

export default assignmentSlice.reducer;
