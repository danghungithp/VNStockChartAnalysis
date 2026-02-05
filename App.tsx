
import React, { useState, useCallback } from 'react';
import { TickerInputForm } from './components/TickerInputForm';
import { StockDataSummary, StockData } from './components/StockDataSummary';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { analyzeStockData, analyzeStockChartImage } from './services/geminiService';
import { fetchStockData } from './services/yahooFinanceService';
import { fileToBase64 } from './utils/imageHelper';
import { UploadedChartPreview } from './components/UploadedChartPreview';

const App: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const resetState = () => {
    setError(null);
    setAnalysis(null);
    setStockData(null);
    setTicker('');
    setUploadedImagePreview(null);
  };

  const handleTickerAnalysis = useCallback(async (submittedTicker: string) => {
    if (!submittedTicker) return;

    setIsLoading(true);
    resetState();
    setTicker(submittedTicker.toUpperCase());

    try {
      // Step 1: Fetch raw data from Yahoo Finance
      const data = await fetchStockData(submittedTicker);
      setStockData(data);

      // Step 2: Send data to Gemini for analysis
      const analysisResult = await analyzeStockData(data.historicalData);
      setAnalysis(analysisResult);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
      setStockData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleImageAnalysis = useCallback(async (imageFile: File) => {
    if (!imageFile) return;

    setIsLoading(true);
    resetState();
    
    // Create a preview URL for the UI
    setUploadedImagePreview(URL.createObjectURL(imageFile));

    try {
      // Step 1: Convert image to base64
      const imageData = await fileToBase64(imageFile);

      // Step 2: Send image to Gemini for analysis
      const analysisResult = await analyzeStockChartImage(imageData);
      setAnalysis(analysisResult);

    } catch (err) {
      console.error(err);
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
      setUploadedImagePreview(null);
    } finally {
      setIsLoading(false);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            AI Stock Data Analyzer
          </h1>
          <p className="mt-2 text-gray-400">
            Nhận phân tích dữ liệu giao dịch từ AI bằng mã cổ phiếu hoặc hình ảnh biểu đồ
          </p>
        </header>

        <main>
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-8">
            <TickerInputForm onTickerSubmit={handleTickerAnalysis} onImageSubmit={handleImageAnalysis} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-xl shadow-lg">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-gray-300">Đang tải dữ liệu và phân tích bằng AI...</p>
              <p className="text-sm text-gray-500">Quá trình này có thể mất một vài giây.</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-xl relative" role="alert">
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!isLoading && !error && (stockData || uploadedImagePreview) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-8">
                {stockData && <StockDataSummary ticker={ticker} data={stockData} />}
                {uploadedImagePreview && <UploadedChartPreview imageUrl={uploadedImagePreview} />}
              </div>
              <div>
                <AnalysisDisplay analysis={analysis} />
              </div>
            </div>
          )}
           {!isLoading && !stockData && !error && !uploadedImagePreview && (
            <div className="text-center py-16 px-6 bg-gray-800 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-white">Chào mừng bạn</h3>
              <p className="mt-1 text-gray-400">Chọn một phương thức để bắt đầu phân tích.</p>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Dữ liệu được cung cấp bởi Yahoo Finance. Phân tích được tạo bởi Google Gemini.</p>
          <p>Thông tin chỉ mang tính chất tham khảo, không phải lời khuyên đầu tư.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
