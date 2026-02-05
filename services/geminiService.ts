
import { GoogleGenAI } from "@google/genai";
import { HistoricalData } from '../components/StockDataSummary';

// Safely access the API key from environment variables.
const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;


if (!API_KEY) {
  throw new Error("Khóa API Gemini chưa được định cấu hình. Vui lòng tạo tệp .env và thêm vào dòng: API_KEY=\"YOUR_GEMINI_API_KEY_HERE\"");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-3-flash-preview';

const analysisPrompt = `
Bạn là một chuyên gia phân tích thị trường chứng khoán chuyên về phân tích kỹ thuật. Dựa vào dữ liệu giao dịch hàng ngày (theo định dạng CSV: Date,Open,High,Low,Close,Volume) được cung cấp, hãy thực hiện một phân tích chi tiết.

Trình bày kết quả phân tích của bạn một cách rõ ràng, có cấu trúc, sử dụng các tiêu đề được bôi đậm (sử dụng cú pháp markdown **Tiêu đề**).

Phân tích bao gồm các mục sau:

**1. Phân tích Dòng tiền**
Dựa vào cột 'Volume' kết hợp với sự thay đổi của giá 'Close', nhận xét về dòng tiền đang vào hay ra khỏi cổ phiếu. Xác định các giai đoạn có khối lượng đột biến và giải thích ý nghĩa của chúng (ví dụ: khối lượng lớn vào ngày tăng giá cho thấy sự tích lũy, khối lượng lớn vào ngày giảm giá cho thấy sự phân phối).

**2. Mẫu hình Kỹ thuật**
Từ chuỗi dữ liệu 'High' và 'Low', hãy suy luận và xác định các mẫu hình giá tiềm năng (ví dụ: hai đỉnh/hai đáy, vai đầu vai, kênh giá, tam giác). Bạn không nhìn thấy biểu đồ, vì vậy hãy phân tích dựa trên sự biến động của các con số.

**3. Các Ngưỡng Quan trọng**
Xác định các ngưỡng kháng cự (resistance) và hỗ trợ (support) chính. Đây là những vùng giá mà giá đã nhiều lần kiểm tra nhưng không vượt qua được. Tìm các cụm giá xuất hiện nhiều trong dữ liệu 'High' và 'Low'.

**4. Đỉnh và Đáy**
Xác định các vùng đỉnh và đáy quan trọng (swing highs and lows) trong khung thời gian của dữ liệu.

**5. Tín hiệu Giao dịch**
Dựa trên phân tích tổng thể (ví dụ: giá phá vỡ ngưỡng kháng cự với khối lượng lớn, hoàn thành mẫu hình đảo chiều), đưa ra các tín hiệu MUA hoặc BÁN tiềm năng. Nêu rõ lý do cho từng tín hiệu.

**6. Dự báo Xu hướng**
Dự báo xu hướng giá có khả năng xảy ra cho tuần tới và tháng tới, dựa trên xu hướng hiện tại và các tín hiệu đã phân tích. Đưa ra kịch bản tích cực và tiêu cực nếu có thể.
`;

const imageAnalysisPrompt = `
Bạn là một chuyên gia phân tích thị trường chứng khoán chuyên về phân tích kỹ thuật. Dựa vào HÌNH ẢNH BIỂU ĐỒ GIAO DỊCH được cung cấp, hãy thực hiện một phân tích chi tiết.

Trình bày kết quả phân tích của bạn một cách rõ ràng, có cấu trúc, sử dụng các tiêu đề được bôi đậm (sử dụng cú pháp markdown **Tiêu đề**).

Phân tích hình ảnh biểu đồ để xác định các mục sau:

**1. Phân tích Dòng tiền**
Dựa vào biểu đồ khối lượng (volume bars) ở phía dưới, nhận xét về dòng tiền đang vào hay ra khỏi cổ phiếu. Xác định các giai đoạn có khối lượng đột biến và giải thích ý nghĩa của chúng so với hành động giá.

**2. Mẫu hình Kỹ thuật**
Nhìn vào biểu đồ giá, xác định các mẫu hình giá tiềm năng (ví dụ: hai đỉnh/hai đáy, vai đầu vai, kênh giá, tam giác, cờ đuôi nheo). Mô tả mẫu hình bạn thấy.

**3. Các Ngưỡng Quan trọng**
Xác định các ngưỡng kháng cự (resistance) và hỗ trợ (support) chính dựa trên các vùng giá mà biểu đồ đã phản ứng nhiều lần.

**4. Đỉnh và Đáy**
Xác định các vùng đỉnh và đáy quan trọng (swing highs and lows) trong khung thời gian của biểu đồ.

**5. Tín hiệu Giao dịch**
Dựa trên phân tích tổng thể (ví dụ: giá phá vỡ ngưỡng kháng cự với khối lượng lớn, hoàn thành mẫu hình đảo chiều), đưa ra các tín hiệu MUA hoặc BÁN tiềm năng. Nêu rõ lý do cho từng tín hiệu.

**6. Dự báo Xu hướng**
Dựa trên xu hướng hiện tại và các tín hiệu đã phân tích, dự báo xu hướng giá có khả năng xảy ra cho tuần tới và tháng tới.
`;


const formatDataToCSV = (data: HistoricalData[]): string => {
  let csvContent = "Date,Open,High,Low,Close,Volume\n";
  data.forEach(row => {
    const date = new Date(row.date).toISOString().split('T')[0];
    const line = `${date},${row.open.toFixed(2)},${row.high.toFixed(2)},${row.low.toFixed(2)},${row.close.toFixed(2)},${row.volume}\n`;
    csvContent += line;
  });
  return csvContent;
};


export const analyzeStockData = async (historicalData: HistoricalData[]): Promise<string> => {
  try {
    const dataAsCSV = formatDataToCSV(historicalData);
    const fullPrompt = analysisPrompt + "\n\n Dưới đây là dữ liệu giao dịch:\n" + dataAsCSV;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });
    
    if (response.text) {
        return response.text;
    } else {
        throw new Error("AI did not return a valid response.");
    }
    
  } catch (error) {
    console.error("Error analyzing data with Gemini:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};

export const analyzeStockChartImage = async (imageData: { mimeType: string; data: string }): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.data,
      },
    };
    const textPart = {
      text: imageAnalysisPrompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("AI did not return a valid response from image analysis.");
    }
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};
