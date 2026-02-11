import json
import os

stats_file_path = r'd:\Study\HK2-2025\Mobile\Code\BlindTradeAI\src\assets\images\pokemon_by_rarity\Stats\total_stats.json'
output_file_path = r'd:\Study\HK2-2025\Mobile\Code\BlindTradeAI\card_data_output.ts'

def generate_cards():
    try:
        with open(stats_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        cards = []
        for i, item in enumerate(data.get('download_log_summary', [])):
            folder = item.get('folder', 'Common')
            
            rarity_map = {
                'Common': 'common',
                'Uncommon': 'uncommon',
                'Rare': 'rare',
                'Rare Holo': 'rare_holo',
                'Rare Holo EX': 'rare_holo_ex',
                'Rare Holo GX': 'rare_holo_gx',
                'Rare Holo V': 'rare_holo_v',
                'Rare Rainbow': 'rare_rainbow',
                'Rare Secret': 'rare_secret',
                'Promo': 'promo'
            }
            
            rarity = rarity_map.get(folder, 'common')
            
            # filepath: "pokemon_by_rarity\\Rare Secret\\file.png"
            # We need: require('../../assets/images/pokemon_by_rarity/Rare Secret/file.png')
            filepath = item.get('filepath', '').replace('\\', '/')
            
            name = item.get('card_name', 'Unknown').replace("'", "\\'")
            
            value_map = {
                'common': 5000,
                'uncommon': 15000,
                'rare': 50000,
                'rare_holo': 150000,
                'rare_holo_ex': 500000,
                'rare_holo_gx': 800000,
                'rare_holo_v': 600000,
                'rare_rainbow': 2500000,
                'rare_secret': 5000000,
                'promo': 200000
            }
            value = value_map.get(rarity, 10000)
            
            tcg_price = int(value * 1.1)
            cm_price = int(value * 0.9)
            
            card_obj = f"""  {{
    id: 'card-{i+1}',
    name: '{name}',
    rarity: '{rarity}',
    value: {value},
    image: require('../../assets/images/{filepath}'),
    tcgPlayerPrice: {tcg_price},
    cardMarketPrice: {cm_price},
  }}"""
            cards.append(card_obj)
            
        with open(output_file_path, 'w', encoding='utf-8') as outfile:
            outfile.write("export const mockCards: Card[] = [\n")
            outfile.write(',\n'.join(cards))
            outfile.write("\n];")
            
        print("Done")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_cards()
