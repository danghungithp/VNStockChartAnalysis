
import { StockData, HistoricalData } from '../components/StockDataSummary';

export const fetchStockData = async (ticker: string): Promise<StockData> => {
  const yahooApiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`;
  // Reverted to a different CORS proxy to resolve the 403 Forbidden error.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooApiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        const errorText = await response.text();
        // Try to parse error from Yahoo Finance response if possible
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson?.chart?.error?.description) {
                throw new Error(errorJson.chart.error.description);
            }
        } catch(e) {
            // Ignore parsing error, throw generic error below
        }
        throw new Error(`Yêu cầu đến Yahoo Finance thất bại với mã lỗi: ${response.status}`);
    }
    const data = await response.json();

    if (!data.chart.result || data.chart.result.length === 0 || data.chart.error) {
      throw new Error(data.chart.error?.description || 'Không tìm thấy dữ liệu cho mã cổ phiếu này.');
    }

    const result = data.chart.result[0];
    const { meta, timestamp } = result;
    const { open, high, low, close, volume } = result.indicators.quote[0];

    // Filter out null values which can appear for some tickers on certain dates (e.g., holidays)
    const historicalData: HistoricalData[] = [];
    timestamp.forEach((ts: number, i: number) => {
      if (open[i] !== null && high[i] !== null && low[i] !== null && close[i] !== null && volume[i] !== null) {
        historicalData.push({
          date: ts * 1000, // Convert to milliseconds
          open: open[i],
          high: high[i],
          low: low[i],
          close: close[i],
          volume: volume[i],
        });
      }
    });


    if (historicalData.length === 0) {
       throw new Error('Dữ liệu lịch sử rỗng sau khi lọc.');
    }
    
    // Some tickers might not have meta.regularMarketPrice. Fallback to the last close price.
    if (!meta.regularMarketPrice && historicalData.length > 0) {
        meta.regularMarketPrice = historicalData[historicalData.length - 1].close;
    }
    if (!meta.previousClose && historicalData.length > 1) {
        meta.previousClose = historicalData[historicalData.length - 2].close;
    }


    return { meta, historicalData };
  } catch (error) {
    console.error("Error fetching stock data from Yahoo Finance:", error);
    // Re-throw the error to be caught by the component
    if (error instanceof Error) {
        // Add a more user-friendly layer to network errors
        if (error.message.includes('Failed to fetch')) {
             throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
        }
        throw error;
    }
    throw new Error('Đã xảy ra lỗi không xác định khi tải dữ liệu.');
  }
};
