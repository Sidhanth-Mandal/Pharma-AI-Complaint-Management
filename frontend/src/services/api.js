import axios from 'axios';

// In dev: Vite proxies /api → localhost:8000
// In production (Cloud Run): nginx proxies /api → backend service
// If VITE_API_URL is set at build time it overrides (e.g. direct backend URL)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL
});


export async function sendChatMessage({ threadId, message, currentFields, existingComplaints }) {
  const res = await api.post('/chat/message', {
    thread_id: threadId,
    message,
    current_fields: currentFields,
    existing_complaints: existingComplaints
  });
  return res.data;
}

export async function extractDocument({ file, threadId, currentFields, existingComplaints }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('thread_id', threadId);
  formData.append('current_fields', JSON.stringify(currentFields));
  formData.append('existing_complaints', JSON.stringify(existingComplaints));
  const res = await api.post('/documents/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function fetchComplaints() {
  const res = await api.get('/complaints/');
  return res.data;
}

export async function saveComplaint(fields) {
  const res = await api.post('/complaints/', fields);
  return res.data;
}

export async function updateComplaint(id, fields) {
  const res = await api.put(`/complaints/${id}`, fields);
  return res.data;
}
