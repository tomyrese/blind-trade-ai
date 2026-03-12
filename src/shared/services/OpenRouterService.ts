// OpenRouter AI Service for Pokemon Chat
import { Market } from '../../domain/models/Market';
import { allCards } from '../utils/allCards';

const OPENROUTER_API_KEY = 'API_KEY';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are Poké-AI, an advanced AI Assistant specialized in Pokémon Trading Card Game (TCG).

IMPORTANT RULES:
- ONLY answer questions about Pokémon TCG, cards, market prices, rarity, card sets, grading, buying/selling, and strategies.
- If the question is outside this scope, decline politely.

Data Usage & Assistance:
- You have access to the complete Pokédex data (all known cards in our app) and live Marketplace data (cards currently being sold by real traders).
- If the user asks where to find/buy a card, look at the LIVE MARKETPLACE DATA and tell them exactly: the Card Name, the Seller's Name, the Condition, and the Price.
- If asked about prices, analyze the market: aggregate the low/high/average prices for the card and give a brief constructive comment (e.g., "This is a great deal right now!").
- Do not guarantee profits, but provide sound market analysis based on the data.
- Keep answers concise, highly structured (use lists and bold text), friendly, and professional.

Response Style:
- Respond in the language used by the user (Vietnamese or English).
- Be a professional Pokémon TCG Trader & Collector AI.
`;

export class OpenRouterService {
  async chat(userMessage: string, marketData?: Market[], language: 'vi' | 'en' = 'vi'): Promise<string> {
    try {
      // Build context from market data
      let contextMessage = SYSTEM_PROMPT;
      contextMessage += `\n\nCURRENT LANGUAGE SETTING: ${language === 'vi' ? 'Vietnamese' : 'English'}`;
      
      // Inject all Pokedex data for context
      const dexSummary = allCards.map(c => `ID:${c.id.substring(0,4)} ${c.name} (${c.rarity}) Base:${this.formatVND(c.value)}`).join(' | ');
      contextMessage += `\n\n[POKEDEX KNOWLEDGE BASE (ALL EXISTING CARDS)]:\n${dexSummary}\n`;
      
      if (marketData && marketData.length > 0) {
        const marketDetails = marketData.map(card => {
          const listingsMsg = card.listings && card.listings.length > 0 
            ? card.listings.map(l => `Seller: ${l.sellerName}, Price: ${this.formatVND(l.price)}, Cond: ${l.condition}`).join('; ')
            : 'No active listings';
          return `- Card: ${card.name} (${card.rarity}). Market Avg: ${this.formatVND(card.currentPrice)}. Listings: [ ${listingsMsg} ]`;
        }).join('\n');
        
        contextMessage += `\n\n[LIVE MARKETPLACE (CARDS CURRENTLY FOR SALE)]:\n${marketDetails}`;
      } else {
        contextMessage += `\n\n[LIVE MARKETPLACE]: No cards are currently available for sale.`;
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
