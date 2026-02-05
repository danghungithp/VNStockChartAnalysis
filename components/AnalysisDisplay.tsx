
import React from 'react';

interface AnalysisDisplayProps {
  analysis: string | null;
}

// A simple parser to convert markdown-like text to JSX
const renderAnalysis = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  return lines.map((line, index) => {
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-semibold text-green-400 mt-4 mb-2">{line.substring(4)}</h3>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{line.substring(2, line.length - 2)}</h2>;
    }
     if (line.match(/^\d+\.\s/)) { // Matches "1. ", "2. ", etc.
      return <p key={index} className="mb-2 pl-4">{line}</p>;
    }
    if (line.startsWith('* ')) {
      return (
        <li key={index} className="flex items-start mb-2">
          <span className="mr-2 text-green-400">◆</span>
          <span>{line.substring(2)}</span>
        </li>
      );
    }
    return <p key={index} className="mb-3 text-gray-300">{line}</p>;
  });
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Kết quả Phân tích AI</h2>
      {analysis ? (
        <div className="prose prose-invert max-w-none text-gray-300">
          {renderAnalysis(analysis)}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">AI đang chờ để phân tích...</p>
        </div>
      )}
    </div>
  );
};
