import { createSlice } from '@reduxjs/toolkit';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const initialState = {
  messages: [],
  isLoading: false,
  extractionProgress: 0,
  isExtracting: false,
  threadId: generateUUID()
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setExtractionProgress: (state, action) => {
      state.extractionProgress = action.payload;
    },
    setIsExtracting: (state, action) => {
      state.isExtracting = action.payload;
    },
    resetChat: (state) => {
      state.messages = [];
      state.threadId = generateUUID();
      state.isLoading = false;
      state.extractionProgress = 0;
      state.isExtracting = false;
    }
  }
});

export const { addMessage, setLoading, setExtractionProgress, setIsExtracting, resetChat } = chatSlice.actions;

export default chatSlice.reducer;
