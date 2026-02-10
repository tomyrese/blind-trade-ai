// Google Gemini AI Service for Pokemon Chat
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Market } from '../../domain/models/Market';

const GEMINI_API_KEY = 'API_KEY';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là Poké-AI, trợ lý chuyên về Pokémon Trading Card Game (TCG).

QUY TẮC QUAN TRỌNG:
- CHỈ trả lời câu hỏi liên quan đến Pokémon TCG, thẻ bài Pokémon, giá cả, độ hiếm, chiến thuật chơi bài
- KHÔNG trả lời câu hỏi về chủ đề khác như thời tiết, toán học, lịch sử, v.v.
- Nếu người dùng hỏi ngoài phạm vi Pokémon, lịch sự từ chối: "Xin lỗi, tôi chỉ có thể hỗ trợ về Pokémon TCG. Bạn có câu hỏi gì về thẻ bài Pokémon không?"

Bạn có quyền truy cập vào dữ liệu thị trường real-time của các thẻ bài Pokémon hiện có.

Trả lời bằng tiếng Việt, ngắn gọn (2-3 câu), thân thiện và chuyên nghiệp.`;

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200, // Giữ câu trả lời ngắn gọn
      },
    });
  }

  async chat(userMessage: string, marketData?: Market[]): Promise<string> {
    try {
      // Build context from market data
      let contextMessage = SYSTEM_PROMPT;
      
      if (marketData && marketData.length > 0) {
        const priceInfo = marketData.map(card => 
          `- ${card.name}: ${this.formatVND(card.currentPrice)} (Độ hiếm: ${card.rarity})`
        ).join('\n');
        
        contextMessage += `\n\nDỮ LIỆU THỊ TRƯỜNG HIỆN TẠI:\n${priceInfo}`;
      }

      // Create chat session with context
      const chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: contextMessage }],
          },
          {
            role: 'model',
            parts: [{ text: 'Tôi hiểu. Tôi sẽ chỉ trả lời về Pokémon TCG và sử dụng dữ liệu thị trường được cung cấp.' }],
          },
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Không thể kết nối với AI. Vui lòng thử lại sau.');
    }
  }

  private formatVND(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr VNĐ`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k VNĐ`;
    }
    return `${amount} VNĐ`;
  }
}

export const geminiService = new GeminiService();
