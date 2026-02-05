
import React from 'react';

export interface HistoricalData {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  meta: {
    currency: string;
    symbol: string;
    regularMarketPrice: number;
    previousClose: number;
    fiftyTwoWeekLow?: number; // Make optional
    fiftyTwoWeekHigh?: number; // Make optional
  };
  historicalData: HistoricalData[];
}


interface StockDataSummaryProps {
  ticker: string;
  data: StockData | null;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

export const StockDataSummary: React.FC<StockDataSummaryProps> = ({ ticker, data }) => {
  if (!data) return null;

  const { meta } = data;
  const lastClose = meta.regularMarketPrice;
  const prevClose = meta.previousClose;
  const change = lastClose - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  const latestVolume = data.historicalData[data.historicalData.length - 1]?.volume;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Tóm tắt Dữ liệu: {ticker}</h2>
      <div className="space-y-3 text-lg">
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400">Giá cuối cùng:</span>
          <span className="font-semibold text-white text-2xl">
            {lastClose.toFixed(2)} <span className="text-sm text-gray-400">{meta.currency}</span>
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400">Thay đổi:</span>
          <span className={`font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </span>
        </div>
         <div className="flex justify-between items-baseline">
          <span className="text-gray-400">Khối lượng GD cuối:</span>
          <span className="font-semibold text-white">
            {latestVolume ? formatNumber(latestVolume) : 'N/A'}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-700"></div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400">Thấp nhất 52 tuần:</span>
          <span className="font-semibold text-white">
            {meta.fiftyTwoWeekLow ? meta.fiftyTwoWeekLow.toFixed(2) : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400">Cao nhất 52 tuần:</span>
          <span className="font-semibold text-white">
            {meta.fiftyTwoWeekHigh ? meta.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}
          </span>
        </div>
      </div>
       <p className="text-xs text-gray-500 mt-4 text-right">Nguồn: Yahoo Finance</p>
    </div>
  );
};
