import React, { useState } from 'react';

const UploadDialog = ({ isFileUploading, text, percentLoaded }) => {
  return (
    <>
      {isFileUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-10">
          <dialog open className="w-80 bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">{text}</h2>
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Progress: {percentLoaded}%</p>
          </dialog>
        </div>
      )}
    </>
  );
};

export default UploadDialog;



