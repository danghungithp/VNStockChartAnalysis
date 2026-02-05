
import React, { useState, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';

interface TickerInputFormProps {
  onTickerSubmit: (ticker: string) => void;
  onImageSubmit: (image: File) => void;
  isLoading: boolean;
}

export const TickerInputForm: React.FC<TickerInputFormProps> = ({ onTickerSubmit, onImageSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'ticker' | 'image'>('ticker');
  const [ticker, setTicker] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ tải lên tệp hình ảnh.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (activeTab === 'ticker' && ticker.trim()) {
      onTickerSubmit(ticker.trim());
    } else if (activeTab === 'image' && imageFile) {
      onImageSubmit(imageFile);
    }
  };

  const isSubmitDisabled = isLoading || (activeTab === 'ticker' && !ticker.trim()) || (activeTab === 'image' && !imageFile);

  const tabButtonClasses = (tabName: 'ticker' | 'image') => 
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
      activeTab === tabName
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`;


  return (
    <div>
      <div className="flex space-x-2 border-b border-gray-700 mb-4">
        <button className={tabButtonClasses('ticker')} onClick={() => setActiveTab('ticker')}>
          Phân tích theo Mã CK
        </button>
        <button className={tabButtonClasses('image')} onClick={() => setActiveTab('image')}>
          Phân tích theo Biểu đồ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-full sm:flex-grow">
          {activeTab === 'ticker' ? (
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Nhập mã cổ phiếu (ví dụ: AAPL, GOOG, VNM...)"
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              disabled={isLoading}
            />
          ) : (
            <div className="w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
              />
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full flex flex-col items-center justify-center gap-2 px-6 py-8 font-semibold text-gray-300 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <UploadIcon className="w-8 h-8"/>
                  Nhấn để chọn hoặc kéo thả ảnh vào đây
                </button>
              ) : (
                <div className="relative w-full sm:w-auto">
                    <img src={imagePreview} alt="Xem trước biểu đồ" className="w-full max-h-48 object-contain rounded-lg bg-white p-1"/>
                    <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition-colors"
                        aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon className="w-5 h-5" />
          {isLoading ? 'Đang phân tích...' : 'Phân tích'}
        </button>
      </form>
    </div>
  );
};
