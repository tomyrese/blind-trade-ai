import { CardRarity, Listing } from '../../domain/models/Market';
// Remove specific icon imports to avoid issues if they don't exist, use generic View/Text or update later if needed.
// Keeping it simple for now, assuming icons are used in components, not here purely.
// Wait, RARITY_CONFIGS uses shape matching string.
// But valid shapes in config are 'circle' | 'diamond' ...
// We don't import icons here. We import types.

export type { CardRarity, Listing };

export interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  rarityLabel?: string;
  value: number;
  symbol?: string;
  tcgPlayerPrice?: number;
  cardMarketPrice?: number;
  image?: any;
  isFavorite?: boolean;
  listings?: Listing[];
  listedAt?: string;
  amount?: number;
}

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  rare_holo: '#8B5CF6',
  rare_holo_ex: '#6366F1',
  rare_holo_gx: '#EC4899',
  rare_holo_v: '#F43F5E',
  rare_rainbow: '#D946EF',
  rare_secret: '#EAB308',
  promo: '#06B6D4',
};

export const RARITY_RANKS: Record<CardRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  rare_holo: 4,
  rare_holo_ex: 5,
  rare_holo_gx: 6,
  rare_holo_v: 7,
  rare_rainbow: 8,
  rare_secret: 9,
  promo: 0,
};

export interface RarityConfigItem {
  label: string;
  symbol: string;
  shape: 'circle' | 'diamond' | 'star' | 'sparkles' | 'gem' | 'crown' | 'zap' | 'image' | 'text';
  starCount?: number;
  color: string;
  borderColor: string;
  shadowColor?: string;
  glowColor: string;
  isHolo?: boolean;
  isFullArt?: boolean;
}

export const RARITY_CONFIGS: Record<CardRarity, RarityConfigItem> = {
  common: {
    label: 'Common',
    symbol: 'C',
    shape: 'circle',
    color: '#9CA3AF',
    borderColor: '#D1D5DB',
    glowColor: 'rgba(156, 163, 175, 0.1)',
  },
  uncommon: {
    label: 'Uncommon',
    symbol: 'U',
    shape: 'diamond',
    color: '#10B981',
    borderColor: '#34D399',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  rare: {
    label: 'Rare',
    symbol: 'R',
    shape: 'star',
    starCount: 1,
    color: '#3B82F6',
    borderColor: '#60A5FA',
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  rare_holo: {
    label: 'Rare Holo',
    symbol: 'H',
    shape: 'sparkles',
    color: '#8B5CF6',
    borderColor: '#A78BFA',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    isHolo: true,
  },
  rare_holo_ex: {
    label: 'Rare Holo EX',
    symbol: 'EX',
    shape: 'star',
    starCount: 2,
    color: '#6366F1',
    borderColor: '#818CF8',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    isHolo: true,
  },
  rare_holo_gx: {
    label: 'Rare Holo GX',
    symbol: 'GX',
    shape: 'star',
    starCount: 2,
    color: '#EC4899',
    borderColor: '#F472B6',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    isHolo: true,
  },
  rare_holo_v: {
    label: 'Rare Holo V',
    symbol: 'V',
    shape: 'star',
    starCount: 2,
    color: '#F43F5E',
    borderColor: '#FB7185',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    isHolo: true,
  },
  rare_rainbow: {
    label: 'Rare Rainbow',
    symbol: 'RB',
    shape: 'star',
    starCount: 3,
    color: '#D946EF',
    borderColor: '#E879F9',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    isHolo: true,
    isFullArt: true,
  },
  rare_secret: {
    label: 'Secret Rare',
    symbol: 'SR',
    shape: 'gem',
    color: '#EAB308',
    borderColor: '#FACC15',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  promo: {
    label: 'Promo',
    symbol: 'PROMO',
    shape: 'text',
    color: '#06B6D4',
    borderColor: '#22D3EE',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
};
export const mockCards: Card[] = [
  {
    id: 'card-1',
    name: 'Single Strike Urshifu VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Brilliant_Stars_Trainer_Gallery_TG29_Single_Strike_Urshifu_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-2',
    name: 'Pikachu VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Lost_Origin_Trainer_Gallery_TG29_Pikachu_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-3',
    name: 'Ice Rider Calyrex VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Astral_Radiance_Trainer_Gallery_TG29_Ice_Rider_Calyrex_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-4',
    name: 'Rayquaza VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Silver_Tempest_Trainer_Gallery_TG29_Rayquaza_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-5',
    name: 'Shadow Rider Calyrex VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Astral_Radiance_Trainer_Gallery_TG30_Shadow_Rider_Calyrex_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-6',
    name: 'Duraludon VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Silver_Tempest_Trainer_Gallery_TG30_Duraludon_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-7',
    name: 'Rapid Strike Urshifu VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Brilliant_Stars_Trainer_Gallery_TG30_Rapid_Strike_Urshifu_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-8',
    name: 'Mew VMAX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Lost_Origin_Trainer_Gallery_TG30_Mew_VMAX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-9',
    name: 'Origin Forme Palkia VSTAR',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Crown_Zenith_Galarian_Gallery_GG67_Origin_Forme_Palkia_VSTAR.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-10',
    name: 'Origin Forme Dialga VSTAR',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Crown_Zenith_Galarian_Gallery_GG68_Origin_Forme_Dialga_VSTAR.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-11',
    name: 'Giratina VSTAR',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Crown_Zenith_Galarian_Gallery_GG69_Giratina_VSTAR.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-12',
    name: 'Arceus VSTAR',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Crown_Zenith_Galarian_Gallery_GG70_Arceus_VSTAR.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-13',
    name: 'Dragon Talon',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_Majesty_075_Dragon_Talon.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-14',
    name: 'Fiery Flint',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_Majesty_076_Fiery_Flint.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-15',
    name: 'Charizard V',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Champions_Path_079_Charizard_V.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-16',
    name: 'Switch Raft',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_Majesty_077_Switch_Raft.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-17',
    name: 'Ultra Necrozma-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_Majesty_078_Ultra_Necrozma-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-18',
    name: 'Suspicious Food Tin',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Champions_Path_080_Suspicious_Food_Tin.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-19',
    name: 'Mewtwo-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Shining_Legends_078_Mewtwo-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-20',
    name: 'Dark Raichu',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Team_Rocket_083_Dark_Raichu.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-21',
    name: 'Mewtwo VSTAR',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Pokemon_GO_086_Mewtwo_VSTAR.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-22',
    name: 'Egg Incubator',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Pokemon_GO_087_Egg_Incubator.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-23',
    name: 'Aether Paradise Conservation Area',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV87_Aether_Paradise_Conservation_Area.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-24',
    name: 'Brooklet Hill',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV88_Brooklet_Hill.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-25',
    name: 'Lure Module',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Pokemon_GO_088_Lure_Module.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-26',
    name: 'Mt. Coronet',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV89_Mt._Coronet.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-27',
    name: 'Shrine of Punishment',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV90_Shrine_of_Punishment.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-28',
    name: 'Alph Lithograph',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/HS—Undaunted_THREE_Alph_Lithograph.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-29',
    name: 'Tapu Bulu-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV91_Tapu_Bulu-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-30',
    name: 'Tapu Fini-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV92_Tapu_Fini-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-31',
    name: 'Pikachu δ',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Legend_Maker_093_Pikachu_delta.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-32',
    name: 'Tapu Koko-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV93_Tapu_Koko-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-33',
    name: 'Tapu Lele-GX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Fates_Shiny_Vault_SV94_Tapu_Lele-GX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-34',
    name: 'Absol',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Team_Magma_vs_Team_Aqua_096_Absol.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-35',
    name: 'Alph Lithograph',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/HS—Unleashed_TWO_Alph_Lithograph.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-36',
    name: 'Primal Kyogre-EX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Ancient_Origins_096_Primal_Kyogre-EX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-37',
    name: 'Jirachi',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Team_Magma_vs_Team_Aqua_097_Jirachi.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-38',
    name: 'Primal Groudon-EX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Ancient_Origins_097_Primal_Groudon-EX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-39',
    name: 'Charmander',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_098_Charmander.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-40',
    name: 'M Rayquaza-EX',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Ancient_Origins_098_M_Rayquaza-EX.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-41',
    name: 'Charmeleon',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_099_Charmeleon.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-42',
    name: 'Energy Retrieval',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Ancient_Origins_099_Energy_Retrieval.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-43',
    name: 'Charizard',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Dragon_100_Charizard.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-44',
    name: 'Emboar',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Next_Destinies_100_Emboar.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-45',
    name: 'Chandelure',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Next_Destinies_101_Chandelure.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-46',
    name: 'Trainers\' Mail',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Ancient_Origins_100_Trainers_Mail.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-47',
    name: 'Charmander',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Stormfront_101_Charmander.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-48',
    name: 'Zoroark',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Next_Destinies_102_Zoroark.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-49',
    name: 'Meowth',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Noble_Victories_102_Meowth.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-50',
    name: 'Groudon',
    rarity: 'rare_secret',
    value: 5000000,
    image: require('../../assets/images/pokemon_by_rarity/Rare Secret/Hidden_Legends_102_Groudon.png'),
    tcgPlayerPrice: 5500000,
    cardMarketPrice: 4500000,
  },
  {
    id: 'card-51',
    name: 'Pikachu',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_001_Pikachu.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-52',
    name: 'Ho-Oh',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/HGSS_Black_Star_Promos_HGSS01_Ho-Oh.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-53',
    name: 'Rowlet',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM01_Rowlet.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-54',
    name: 'Snivy',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/BW_Black_Star_Promos_BW01_Snivy.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-55',
    name: 'Chespin',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/XY_Black_Star_Promos_XY01_Chespin.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-56',
    name: 'Sprigatito',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Scarlet_and_Violet_Black_Star_Promos_001_Sprigatito.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-57',
    name: 'Turtwig',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/DP_Black_Star_Promos_DP01_Turtwig.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-58',
    name: 'Kyogre ex',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Nintendo_Black_Star_Promos_001_Kyogre_ex.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-59',
    name: 'Grookey',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SWSH_Black_Star_Promos_SWSH001_Grookey.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-60',
    name: 'Electabuzz',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Best_of_Game_001_Electabuzz.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-61',
    name: 'Tepig',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/BW_Black_Star_Promos_BW02_Tepig.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-62',
    name: 'Litten',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM02_Litten.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-63',
    name: 'Scorbunny',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SWSH_Black_Star_Promos_SWSH002_Scorbunny.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-64',
    name: 'Fennekin',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/XY_Black_Star_Promos_XY02_Fennekin.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-65',
    name: 'Electabuzz',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_002_Electabuzz.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-66',
    name: 'Fuecoco',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Scarlet_and_Violet_Black_Star_Promos_002_Fuecoco.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-67',
    name: 'Groudon ex',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Nintendo_Black_Star_Promos_002_Groudon_ex.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-68',
    name: 'Chimchar',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/DP_Black_Star_Promos_DP02_Chimchar.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-69',
    name: 'Hitmonchan',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Best_of_Game_002_Hitmonchan.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-70',
    name: 'Lugia',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/HGSS_Black_Star_Promos_HGSS02_Lugia.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-71',
    name: 'Treecko',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Nintendo_Black_Star_Promos_003_Treecko.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-72',
    name: 'Pikachu',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/HGSS_Black_Star_Promos_HGSS03_Pikachu.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-73',
    name: 'Piplup',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/DP_Black_Star_Promos_DP03_Piplup.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-74',
    name: 'Sobble',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SWSH_Black_Star_Promos_SWSH003_Sobble.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-75',
    name: 'Oshawott',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/BW_Black_Star_Promos_BW03_Oshawott.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-76',
    name: 'Quaxly',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Scarlet_and_Violet_Black_Star_Promos_003_Quaxly.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-77',
    name: 'Professor Elm',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Best_of_Game_003_Professor_Elm.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-78',
    name: 'Popplio',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM03_Popplio.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-79',
    name: 'Mewtwo',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_003_Mewtwo.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-80',
    name: 'Froakie',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/XY_Black_Star_Promos_XY03_Froakie.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-81',
    name: 'Pikachu',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM04_Pikachu.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-82',
    name: 'Pikachu',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_004_Pikachu.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-83',
    name: 'Reshiram',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/BW_Black_Star_Promos_BW004_Reshiram.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-84',
    name: 'Sylveon',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/XY_Black_Star_Promos_XY04_Sylveon.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-85',
    name: 'Grovyle',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Nintendo_Black_Star_Promos_004_Grovyle.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-86',
    name: 'Wobbuffet',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/HGSS_Black_Star_Promos_HGSS04_Wobbuffet.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-87',
    name: 'Pachirisu',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/DP_Black_Star_Promos_DP04_Pachirisu.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-88',
    name: 'Mimikyu ex',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Scarlet_and_Violet_Black_Star_Promos_004_Mimikyu_ex.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-89',
    name: 'Rocket\'s Scizor',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Best_of_Game_004_Rockets_Scizor.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-90',
    name: 'Meowth V',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SWSH_Black_Star_Promos_SWSH004_Meowth_V.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-91',
    name: 'Meowth VMAX',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SWSH_Black_Star_Promos_SWSH005_Meowth_VMAX.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-92',
    name: 'Tropical Wind',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/DP_Black_Star_Promos_DP05_Tropical_Wind.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-93',
    name: 'Snorlax-GX',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM05_Snorlax-GX.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-94',
    name: 'Zekrom',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/BW_Black_Star_Promos_BW005_Zekrom.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-95',
    name: 'Hoothoot',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/HGSS_Black_Star_Promos_HGSS05_Hoothoot.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-96',
    name: 'Dragonite',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_005_Dragonite.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-97',
    name: 'Xerneas',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/XY_Black_Star_Promos_XY05_Xerneas.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-98',
    name: 'Quaquaval',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Scarlet_and_Violet_Black_Star_Promos_005_Quaquaval.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-99',
    name: 'Rocket\'s Sneasel',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Best_of_Game_005_Rockets_Sneasel.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  },
  {
    id: 'card-100',
    name: 'Mudkip',
    rarity: 'promo',
    value: 200000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Nintendo_Black_Star_Promos_005_Mudkip.png'),
    tcgPlayerPrice: 220000,
    cardMarketPrice: 180000,
  }
];
export interface fusionOdds {
  upgrade: number;
  same: number;
  downgrade: number;
}

export const getFusionProbabilities = (cards: Card[]): fusionOdds => {
  if (cards.length === 0) return { upgrade: 0, same: 0, downgrade: 0 };
  
  const highestRank = Math.max(...cards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  if (highestRank <= 2) { // Common, Uncommon
    return { upgrade: 0.60, same: 0.30, downgrade: 0.10 };
  } else if (highestRank <= 4) { // Rare, Holo
    return { upgrade: 0.40, same: 0.40, downgrade: 0.20 };
  } else if (highestRank <= 7) { // EX, GX, V
    return { upgrade: 0.20, same: 0.50, downgrade: 0.30 };
  } else { // Rainbow, Secret
    return { upgrade: 0.05, same: 0.45, downgrade: 0.50 };
  }
};

export const generateReward = (selectedCards: Card[]): Card => {
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);
  const odds = getFusionProbabilities(selectedCards);
  const roll = Math.random();
  
  const ranks = Object.keys(RARITY_RANKS) as CardRarity[];
  const highestRank = Math.max(...selectedCards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  let targetRarity: CardRarity = 'common';
  let multiplier = 1.0;

  if (roll <= odds.upgrade) {
    const targetRank = Math.min(9, highestRank + (Math.random() > 0.8 ? 2 : 1));
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'rare';
    multiplier = 1.5 + (Math.random() * 1.5);
  } else if (roll <= odds.upgrade + odds.same) {
    targetRarity = ranks.find(r => RARITY_RANKS[r] === highestRank) || 'common';
    multiplier = 0.9 + (Math.random() * 0.4);
  } else {
    const targetRank = Math.max(1, highestRank - 1);
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'common';
    multiplier = 0.4 + (Math.random() * 0.4);
  }

  const rewardValue = Math.floor(totalValue * multiplier);
  
  const namesByRarity: Record<CardRarity, string[]> = {
    common: ['Rattata', 'Pidgey', 'Zubat', 'Caterpie'],
    uncommon: ['Ivysaur', 'Charmeleon', 'Wartortle', 'Pikachu'],
    rare: ['Gyarados', 'Arcanine', 'Alakazam', 'Machamp'],
    rare_holo: ['Charizard', 'Blastoise', 'Venusaur', 'Dragonite'],
    rare_holo_ex: ['Mewtwo ex', 'Rayquaza ex', 'Lugia ex', 'Kyogre ex'],
    rare_holo_gx: ['Lunala GX', 'Solgaleo GX', 'Darkrai GX', 'Snorlax GX'],
    rare_holo_v: ['Zacian V', 'Zamazenta V', 'Pikachu V', 'Eevee V'],
    rare_rainbow: ['Charizard VMAX', 'Pikachu VMAX', 'Mew VMAX', 'Rayquaza VMAX'],
    rare_secret: ['Mew (Gold)', 'Pikachu (Gold)', 'Ultra Ball (Gold)', 'Arceus VSTAR (Gold)'],
    promo: ['Pikachu (Promo)', 'Eevee (Promo)', 'Meowth (Promo)', 'Psyduck (Promo)'],
  };

  const possibleNames = namesByRarity[targetRarity] || ['Unknown Pokemon'];
  const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];

  return {
    id: `fusion-${Date.now()}`,
    name: `${name} (Fusion)`,
    rarity: targetRarity,
    value: rewardValue,
    tcgPlayerPrice: Math.floor(rewardValue * 1.1),
    cardMarketPrice: Math.floor(rewardValue * 0.95),
  };
};

export const mapRarity = (rarity: string | undefined): CardRarity => {
  if (!rarity) return 'common';
  
  const validRarities: CardRarity[] = [
    'common', 'uncommon', 'rare', 'rare_holo', 
    'rare_holo_ex', 'rare_holo_gx', 
    'rare_holo_v', 'rare_rainbow', 'rare_secret', 'promo'
  ];
  
  if (validRarities.includes(rarity as CardRarity)) {
    return rarity as CardRarity;
  }

  const r = rarity.toLowerCase();
  
  if (r.includes('rainbow') || r.includes('hyper')) return 'rare_rainbow';
  if (r.includes('secret')) return 'rare_secret';
  if (r.includes('v') && !r.includes('vmax') && !r.includes('vstar')) return 'rare_holo_v';
  if (r.includes('gx')) return 'rare_holo_gx';
  if (r.includes('ex')) return 'rare_holo_ex';
  if (r.includes('promo')) return 'promo';
  if (r.includes('holo')) return 'rare_holo';
  if (r.includes('rare')) return 'rare';
  if (r.includes('uncommon')) return 'uncommon';
  
  return 'common';
};
