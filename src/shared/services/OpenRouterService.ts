// OpenRouter AI Service for Pokemon Chat
import { Market } from '../../domain/models/Market';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are Poké-AI, an expert assistant specializing in the Pokémon Trading Card Game (TCG).

IMPORTANT RULES:
- ONLY answer questions about Pokémon TCG, cards, market prices, rarity, card sets, grading, and game strategies.
- If the question is outside this scope, respond:
  - (VN): "Xin lỗi, tôi chỉ có thể hỗ trợ về Pokémon TCG. Bạn có câu hỏi gì về thẻ bài Pokémon không?"
  - (EN): "Sorry, I can only assist with Pokémon TCG. Do you have any questions about Pokémon cards?"

Response Style:
- Respond in the language used by the user (Vietnamese or English).
- Keep answers concise (2-3 sentences), friendly, and professional.
- Use emojis sparingly when appropriate.

Data Usage:
- You have access to real-time market prices in both VND and USD ($).
- Specify card condition (Raw, PSA 10, PSA 9, etc.) when possible.
- If prices are volatile, provide a price range and trend.

Investment Advice:
- Do not guarantee profits.
- Use suggestive and neutral language.

Gameplay Strategy:
- Mention key combos and meta decks when relevant.

Persona:
- You are a professional Pokémon TCG trader & collector.
- Your goal is to help users buy, sell, and play effectively.
`;

export class OpenRouterService {
  async chat(userMessage: string, marketData?: Market[], language: 'vi' | 'en' = 'vi'): Promise<string> {
    try {
      // Build context from market data
      let contextMessage = SYSTEM_PROMPT;
      contextMessage += `\n\nCURRENT LANGUAGE SETTING: ${language === 'vi' ? 'Vietnamese' : 'English'}`;
      
      if (marketData && marketData.length > 0) {
        const priceInfo = marketData.map(card => {
          const priceVND = this.formatVND(card.currentPrice);
          const priceUSD = this.formatUSD(card.currentPrice);
          return `- ${card.name}: ${priceVND} (~${priceUSD}) (Rarity: ${card.rarity})`;
        }).join('\n');
        
        const marketHeader = language === 'vi' ? 'DỮ LIỆU THỊ TRƯỜNG HIỆN TẠI:' : 'CURRENT MARKET DATA:';
        contextMessage += `\n\n${marketHeader}\n${priceInfo}`;
      }

      // Call OpenRouter API
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://blindtrade.ai',
          'X-Title': 'BlindTrade Pokemon AI',
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
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        return language === 'vi' ? 'Không thể trả lời câu hỏi này.' : 'I cannot answer this question at the moment.';
      }
      
      return aiResponse;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(
        language === 'vi' 
          ? 'Không thể kết nối với AI. Vui lòng thử lại sau.' 
          : 'Could not connect to AI. Please try again later.'
      );
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

  private formatUSD(amountVND: number): string {
    const rate = 25000; // 1 USD = 25,000 VND
    const usd = amountVND / rate;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}


export const openRouterService = new OpenRouterService();
