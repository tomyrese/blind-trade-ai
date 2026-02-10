// OpenRouter AI Service for Pokemon Chat
import { Market } from '../../domain/models/Market';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Bạn là Poké-AI, trợ lý chuyên về Pokémon Trading Card Game (TCG).

QUY TẮC QUAN TRỌNG:
- CHỈ trả lời câu hỏi liên quan đến Pokémon TCG, thẻ bài Pokémon, giá cả, độ hiếm, chiến thuật chơi bài
- KHÔNG trả lời câu hỏi về chủ đề khác như thời tiết, toán học, lịch sử, v.v.
- Nếu người dùng hỏi ngoài phạm vi Pokémon, lịch sự từ chối: "Xin lỗi, tôi chỉ có thể hỗ trợ về Pokémon TCG. Bạn có câu hỏi gì về thẻ bài Pokémon không?"

Bạn có quyền truy cập vào dữ liệu thị trường real-time của các thẻ bài Pokémon hiện có.

Trả lời bằng tiếng Việt, ngắn gọn (2-3 câu), thân thiện và chuyên nghiệp.`;

export class OpenRouterService {
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

      // Call OpenRouter API
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://blindtrade.ai', // Optional
          'X-Title': 'BlindTrade Pokemon AI', // Optional
        },
        body: JSON.stringify({
          model: 'arcee-ai/trinity-large-preview:free',
          messages: [
            {
              role: 'system',
              content: contextMessage,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Không thể trả lời câu hỏi này.';
    } catch (error) {
      console.error('OpenRouter API Error:', error);
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

export const openRouterService = new OpenRouterService();
