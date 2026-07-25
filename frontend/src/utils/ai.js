import {
  updateFields,
  setAssessment,
  setCompleteness,
  setDuplicates,
  setRootCauses,
  setCAPAActions,
  addTimelineEvent
} from '../features/complaint/complaintSlice';
import { addMessage } from '../features/chat/chatSlice';

export function applyAIResponse(dispatch, data) {
  if (data.form_update) dispatch(updateFields(data.form_update));
  if (data.assessment) dispatch(setAssessment(data.assessment));
  if (data.completeness) dispatch(setCompleteness(data.completeness));
  if (data.duplicates) dispatch(setDuplicates(data.duplicates));
  if (data.root_causes) dispatch(setRootCauses(data.root_causes));
  if (data.capa_actions) dispatch(setCAPAActions(data.capa_actions));
  if (data.timeline_event) dispatch(addTimelineEvent(data.timeline_event));
  if (data.message) {
    dispatch(addMessage({
      role: 'bot',
      content: data.message,
      timestamp: new Date().toISOString()
    }));
  }
}
