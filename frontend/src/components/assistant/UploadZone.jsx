import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { setIsExtracting, setExtractionProgress, addMessage } from '../../features/chat/chatSlice';
import { extractDocument } from '../../services/api';
import { applyAIResponse } from '../../utils/ai';
import { UploadCloud } from 'lucide-react';

const UploadZone = () => {
  const dispatch = useDispatch();
  const { threadId } = useSelector((state) => state.chat);
  const { fields, duplicates } = useSelector((state) => state.complaint);
  const [fileInfo, setFileInfo] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    dispatch(setIsExtracting(true));
    dispatch(setExtractionProgress(0));

    // Simulate progress
    const interval = setInterval(() => {
      dispatch(setExtractionProgress((prev) => Math.min(prev + 10, 90)));
    }, 200);

    try {
      const data = await extractDocument({
        file,
        threadId,
        currentFields: fields,
        existingComplaints: duplicates
      });
      clearInterval(interval);
      dispatch(setExtractionProgress(100));
      applyAIResponse(dispatch, data);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      dispatch(addMessage({
        role: 'bot',
        content: 'Sorry, there was an error processing your document.',
        timestamp: new Date().toISOString()
      }));
    } finally {
      setTimeout(() => {
        dispatch(setIsExtracting(false));
        setFileInfo(null);
      }, 500);
    }
  }, [dispatch, threadId, fields, duplicates]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'message/rfc822': ['.eml']
    }
  });

  return (
    <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <UploadCloud size={32} color="var(--color-primary)" style={{ marginBottom: '12px' }} />
      {fileInfo ? (
        <p style={{ fontWeight: 500 }}>{fileInfo}</p>
      ) : (
        <>
          <p style={{ fontWeight: 500 }}>Drag & drop complaint document here</p>
          <p style={{ color: 'var(--color-primary)', fontSize: '0.875rem', marginTop: '4px' }}>or click to browse</p>
        </>
      )}
    </div>
  );
};

export default UploadZone;
