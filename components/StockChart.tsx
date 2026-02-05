
import React from 'react';

interface StockChartProps {
  ticker: string;
  chartUrl: string | null;
}

export const StockChart: React.FC<StockChartProps> = ({ ticker, chartUrl }) => {
  if (!chartUrl) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-4 text-white">Biểu đồ 1 năm của {ticker}</h2>
      <div className="bg-white rounded-lg overflow-hidden">
        <img 
          src={chartUrl} 
          alt={`Biểu đồ chứng khoán của ${ticker}`}
          className="w-full h-auto"
        />
      </div>
       <p className="text-xs text-gray-500 mt-2 text-right">Nguồn: finviz.com</p>
    </div>
  );
};
