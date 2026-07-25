import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetForm, clearUpdatedFields, setSaveStatus, addTimelineEvent } from '../../features/complaint/complaintSlice';
import { saveComplaint } from '../../services/api';

const ComplaintForm = () => {
  const dispatch = useDispatch();
  const { fields, updatedFields, completeness, assessment, timeline } = useSelector((state) => state.complaint);

  useEffect(() => {
    if (updatedFields.length > 0) {
      const timer = setTimeout(() => {
        dispatch(clearUpdatedFields());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [updatedFields, dispatch]);

  const handleSave = async () => {
    dispatch(setSaveStatus({ status: 'saving' }));
    try {
      const payload = {
        ...fields,
        completeness_score: completeness.score,
        assessment_json: assessment || {},
        timeline_json: timeline || []
      };
      const data = await saveComplaint(payload);
      dispatch(setSaveStatus({ status: 'saved', savedId: data.id }));
      dispatch(addTimelineEvent('Complaint saved to database'));
    } catch (error) {
      console.error(error);
      dispatch(setSaveStatus({ status: 'error' }));
    }
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  const renderField = (key, label, type = 'text', options = []) => {
    const isUpdated = updatedFields.includes(key);
    let className = 'form-control';
    if (key === 'severity' && fields[key]) {
      className += ` severity-${fields[key].toLowerCase()}`;
    }

    return (
      <div className={`form-group ${isUpdated ? 'ai-populating' : ''}`} title="Edit via AI Assistant">
        <label className="form-label">{label}</label>
        {type === 'select' ? (
          <select className={className} value={fields[key] || ''} disabled>
            <option value="">Awaiting AI extraction...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea className={className} value={fields[key] || ''} disabled placeholder="Awaiting AI extraction..." rows={4} />
        ) : (
          <input className={className} type={type} value={fields[key] || ''} disabled placeholder="Awaiting AI extraction..." />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="form-section-header">1. ORIGIN & CUSTOMER DETAILS</div>
      <div className="form-row">
        {renderField('complaint_source', 'Complaint Source')}
        {renderField('customer_name', 'Customer Name')}
      </div>

      <div className="form-section-header">2. PRODUCT & BATCH IDENTIFICATION</div>
      <div className="form-row">
        {renderField('product_name', 'Product Name')}
        {renderField('product_strength', 'Product Strength/Grade')}
      </div>
      <div className="form-row">
        {renderField('batch_number', 'Batch/Lot Number')}
        {renderField('manufacturing_date', 'Manufacturing Date')}
      </div>
      <div className="form-row">
        {renderField('expiry_date', 'Expiry Date')}
        {renderField('quantity_affected', 'Quantity Affected')}
      </div>

      <div className="form-section-header">3. COMPLAINT DETAILS</div>
      <div className="form-row">
        {renderField('complaint_type', 'Complaint Type', 'select', ['Physical', 'Chemical', 'Microbiological', 'Labeling', 'Packaging', 'Regulatory', 'Other'])}
        {renderField('complaint_date', 'Complaint Date')}
      </div>
      <div className="form-row">
        {renderField('description', 'Detailed Complaint Description', 'textarea')}
      </div>

      <div className="form-section-header">4. INITIAL ASSESSMENT & PRIORITY</div>
      <div className="form-row">
        {renderField('severity', 'Initial Severity', 'select', ['Critical', 'Major', 'Minor'])}
        {renderField('priority', 'Priority', 'select', ['Urgent', 'High', 'Medium', 'Low'])}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-secondary" onClick={handleReset}>Reset Form</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Complaint</button>
      </div>
    </div>
  );
};

export default ComplaintForm;
