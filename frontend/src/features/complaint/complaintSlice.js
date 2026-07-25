import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fields: {
    complaint_source: '', customer_name: '', product_name: '',
    product_strength: '', batch_number: '', manufacturing_date: '',
    expiry_date: '', quantity_affected: '', complaint_type: '',
    complaint_date: '', description: '', severity: '', priority: ''
  },
  updatedFields: [],
  assessment: null,
  completeness: { score: 0, missing: [] },
  duplicates: [],
  rootCauses: [],
  capaActions: [],
  timeline: [],
  savedId: null,
  saveStatus: 'idle'
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFields: (state, action) => {
      const updates = action.payload;
      const updatedKeys = [];
      Object.keys(updates).forEach(key => {
        if (updates[key] !== null && updates[key] !== undefined) {
          state.fields[key] = updates[key];
          updatedKeys.push(key);
        }
      });
      state.updatedFields = [...new Set([...state.updatedFields, ...updatedKeys])];
    },
    setAssessment: (state, action) => { state.assessment = action.payload; },
    setCompleteness: (state, action) => { state.completeness = action.payload; },
    setDuplicates: (state, action) => { state.duplicates = action.payload; },
    setRootCauses: (state, action) => { state.rootCauses = action.payload; },
    setCAPAActions: (state, action) => { state.capaActions = action.payload; },
    addTimelineEvent: (state, action) => { 
      state.timeline.unshift({ event: action.payload, timestamp: new Date().toISOString() }); 
    },
    clearUpdatedFields: (state) => { state.updatedFields = []; },
    resetForm: () => initialState,
    setSaveStatus: (state, action) => { 
      if (action.payload.status) state.saveStatus = action.payload.status;
      if (action.payload.savedId) state.savedId = action.payload.savedId;
    },
    setField: (state, action) => {
      const { key, value } = action.payload;
      state.fields[key] = value;
    }
  }
});

export const {
  updateFields, setAssessment, setCompleteness, setDuplicates,
  setRootCauses, setCAPAActions, addTimelineEvent, clearUpdatedFields,
  resetForm, setSaveStatus, setField
} = complaintSlice.actions;

export default complaintSlice.reducer;
