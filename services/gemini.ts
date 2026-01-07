
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAICustomerSupport(userMessage: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `Bạn là trợ lý ảo hỗ trợ khách hàng của Ergolife - cửa hàng chuyên cung cấp đồ công thái học (ghế, bàn, phụ kiện).
        Hãy trả lời bằng tiếng Việt, lịch sự, chuyên nghiệp.
        Kiến thức về sản phẩm: 
        - Ghế ErgoMaster Pro (8.5tr): Tốt nhất cho thắt lưng.
        - Bàn FlexiDesk V2 (12.5tr): Bàn đứng điện thông minh.
        - Giá treo màn hình (1.85tr).
        - Bàn phím Split (3.2tr).
        Hãy khuyên người dùng về sức khỏe tư thế nếu cần.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, tôi đang gặp chút trục trặc. Bạn có thể gọi hotline 1900-xxxx để được hỗ trợ trực tiếp.";
  }
}
