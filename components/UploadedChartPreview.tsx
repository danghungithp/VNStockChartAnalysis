
import React from 'react';

interface UploadedChartPreviewProps {
  imageUrl: string;
}

export const UploadedChartPreview: React.FC<UploadedChartPreviewProps> = ({ imageUrl }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-4 text-white">Biểu đồ đã tải lên</h2>
      <div className="bg-white rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Biểu đồ chứng khoán đã tải lên"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
};
