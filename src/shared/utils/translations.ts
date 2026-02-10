import { create } from 'zustand';
import { useUserStore } from '../stores/userStore';

type Language = 'vi' | 'en';

const translations = {
  vi: {
    // Common
    welcome: 'Chào mừng',
    loading: 'Đang tải...',
    error: 'Có lỗi xảy ra',
    success: 'Thành công',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    save: 'Lưu',
    close: 'Đóng',
    items: 'thẻ',
    
    // UI Labels
    add_success: 'Đã thêm',
    remove_success: 'Đã xóa',
    listed_by: 'Bán bởi',
    avatar_success: 'Cập nhật avatar thành công',
    change_avatar: 'Đổi Ảnh Đại Diện',
    pick_from_gallery: 'Thư viện ảnh',
    pick_preset: 'Ảnh đại diện có sẵn',
    gallery_permission_denied: 'Quyền truy cập thư viện bị từ chối',
    
    // Navigation
    nav_home: 'Trang Chủ',
    nav_portfolio: 'Sưu Tập',
    nav_tradeup: 'Hợp Nhất',
    nav_aichat: 'Poké-AI',
    nav_profile: 'Trainer',
    
    // Portfolio
    portfolio_total_value: 'Tổng Giá Trị Bộ Sưu Tập',
    updated_just_now: 'Cập nhật vừa xong',
    pokemon_inventory: 'Kho Thẻ Pokémon',
    no_assets_owned: 'Bạn chưa sở hữu thẻ bài nào.',
    
    // Trade Up
    fusion_value: 'Giá trị hợp nhất',
    fusion_upgrade: 'Nâng cấp',
    fusion_risk: 'Rủi ro',
    no_cards_selected: 'Chưa có thẻ nào được chọn',
    start_fusion: 'BẮT ĐẦU HỢP NHẤT',
    your_inventory: 'Kho Thẻ Của Bạn',
    filter: 'Lọc',
    no_cards_to_fuse: 'Bạn không có thẻ bài nào để hợp nhất.',
    fusion_limit_title: 'Giới hạn',
    fusion_limit_message: 'Bạn chỉ có thể chọn tối đa 10 thẻ để hợp nhất.',
    fusion_requirement_title: 'Yêu cầu',
    fusion_requirement_message: 'Bạn cần ít nhất 2 thẻ bài để bắt đầu hợp nhất.',
    
    // Cart
    cart_title: 'Giỏ Hàng',
    cart_empty_title: 'Giỏ hàng trống',
    cart_empty_desc: 'Bạn chưa chọn thẻ bài nào. Hãy dạo quanh chợ và tìm cho mình những thẻ bài ưng ý nhé!',
    total_price: 'Tổng cộng',
    vat_included: '(Đã bao gồm VAT)',
    checkout_now: 'THANH TOÁN NGAY',
    
    // Favorites
    favorites_title: 'Yêu Thích',
    no_favorites_title: 'Chưa có yêu thích',
    no_favorites_desc: 'Hãy thả tim những thẻ bài bạn quan tâm để lưu lại vào đây nhé!',
    
    // Profile
    profile_title: 'Hồ sơ',
    level: 'Cấp độ',
    rank: 'Hạng',
    my_collection: 'Bộ Sưu Tập',
    pokedex_progress: 'Tiến độ Pokedex',
    edit_profile: 'Sửa Hồ Sơ',
    trainer_name: 'Tên Trainer',
    phone: 'Số Điện Thoại',
    address: 'Địa Chỉ',
    bio: 'Giới Thiệu',
    save_changes: 'Lưu Thay Đổi',
    titles: 'Danh Hiệu',
    system_settings: 'Hệ Thống',
    notifications: 'Thông báo',
    info: 'Thông báo',
    vip_packages: 'Gói VIP',
    random_avatar_confirm: 'Chọn avatar ngẫu nhiên mới?',
    equip_success: 'Đã trang bị danh hiệu mới!',
    update_success: 'Cập nhật hồ sơ thành công!',
    vip_success: 'Nâng cấp VIP thành công!',
    logout_success: 'Đăng xuất thành công',
    coming_soon: 'Đang phát triển',
    
    // Market
    search_placeholder: 'Tìm kiếm Pokémon...',
    sort_by: 'Sắp xếp theo',
    sort_price_asc: 'Giá: Thấp đến Cao',
    sort_price_desc: 'Giá: Cao đến Thấp',
    sort_rarity_asc: 'Độ hiếm: Thấp đến Cao',
    sort_rarity_desc: 'Độ hiếm: Cao đến Thấp',
    sort_date_newest: 'Mới đăng bán',
    sort_date_oldest: 'Cũ nhất',
    tab_hot: 'Xu Hướng',
    tab_all: 'Tất Cả',
    no_cards_found: 'Không tìm thấy thẻ bài nào.',
    
    security: 'Bảo Mật',
    support: 'Hỗ Trợ',
    logout: 'Đăng Xuất',
    logout_confirm_title: 'Đăng Xuất',
    logout_confirm_message: 'Bạn có chắc chắn muốn rời khỏi Poké-Market?',
    upgrade_vip: 'Nâng Cấp VIP',
    vip_benefits: 'Quyền lợi VIP',
    vip_month: 'Gói Tháng',
    vip_year: 'Gói Năm',
    vip_lifetime: 'Trọn Đời',
    vip_owned: 'Đã sở hữu',
    vip_member_forever: 'Thành Viên Trọn Đời',
    vip_forever_desc: 'Bạn đã sở hữu gói VIP cao cấp nhất.\nTận hưởng đặc quyền không giới hạn vĩnh viễn!',
    vip_activated: 'Đã Kích Hoạt',
    vip_confirm_title: 'Xác Nhận Thanh Toán',
    vip_confirm_message: 'Bạn chắc chắn muốn nâng cấp gói',
    pay_now: 'Thanh Toán Ngay',
    select_package: 'Chọn Gói Để Tiếp Tục',
    confirm_upgrade: 'Xác Nhận Nâng Cấp',
    
    // Settings
    settings_title: 'Cài Đặt Hệ Thống',
    general: 'Chung',
    sound: 'Âm Thanh',
    vibration: 'Rung',
    options: 'Tùy Chọn',
    language: 'Ngôn Ngữ',
    currency: 'Tiền Tệ',
    data: 'Dữ Liệu',
    clear_cache: 'Xóa Bộ Nhớ Cache',
    cache_cleared: 'Đã xóa cache thành công!',
    save_settings: 'Lưu Cài Đặt',
    
    // Titles
    equip: 'Trang bị',
    equipped: 'Đang dùng',
    locked: 'Chưa mở khóa',
  },
  en: {
    // Common
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    items: 'items',
    
    // UI Labels
    add_success: 'Added',
    remove_success: 'Removed',
    listed_by: 'Listed by',
    avatar_success: 'Avatar updated successfully',
    change_avatar: 'Change Avatar',
    pick_from_gallery: 'Photo Gallery',
    pick_preset: 'Preset Avatars',
    gallery_permission_denied: 'Gallery permission denied',
    
    // Navigation
    nav_home: 'Home',
    nav_portfolio: 'Portfolio',
    nav_tradeup: 'Trade Up',
    nav_aichat: 'Poké-AI',
    nav_profile: 'Trainer',
    
    // Portfolio
    portfolio_total_value: 'Total Collection Value',
    updated_just_now: 'Just updated',
    pokemon_inventory: 'Pokémon Inventory',
    no_assets_owned: 'You do not own any cards yet.',
    
    // Trade Up
    fusion_value: 'Fusion Value',
    fusion_upgrade: 'Upgrade',
    fusion_risk: 'Risk',
    no_cards_selected: 'No cards selected',
    start_fusion: 'START FUSION',
    your_inventory: 'Your Inventory',
    filter: 'Filter',
    no_cards_to_fuse: 'You have no cards to fuse.',
    fusion_limit_title: 'Limit',
    fusion_limit_message: 'You can only select up to 10 cards for fusion.',
    fusion_requirement_title: 'Requirement',
    fusion_requirement_message: 'You need at least 2 cards to start fusion.',
    
    // Cart
    cart_title: 'Shopping Cart',
    cart_empty_title: 'Cart is empty',
    cart_empty_desc: 'You haven\'t selected any cards yet. Browse the market to find something you like!',
    total_price: 'Total',
    vat_included: '(VAT Included)',
    checkout_now: 'CHECKOUT NOW',
    
    // Favorites
    favorites_title: 'Favorites',
    no_favorites_title: 'No favorites yet',
    no_favorites_desc: 'Heart the cards you\'re interested in to save them here!',
    
    // Profile
    profile_title: 'Profile',
    level: 'Level',
    rank: 'Rank',
    my_collection: 'My Collection',
    pokedex_progress: 'Pokedex Progress',
    edit_profile: 'Edit Profile',
    trainer_name: 'Trainer Name',
    phone: 'Phone Number',
    address: 'Address',
    bio: 'Bio',
    save_changes: 'Save Changes',
    titles: 'Titles',
    system_settings: 'System',
    notifications: 'Notifications',
    info: 'Info',
    vip_packages: 'VIP Packages',
    random_avatar_confirm: 'Choose a new random avatar?',
    equip_success: 'New title equipped!',
    update_success: 'Profile updated successfully!',
    vip_success: 'VIP upgrade successful!',
    logout_success: 'Logged out successfully',
    coming_soon: 'Coming soon',

    // Market
    search_placeholder: 'Search Pokémon...',
    sort_by: 'Sort by',
    sort_price_asc: 'Price: Low to High',
    sort_price_desc: 'Price: High to Low',
    sort_rarity_asc: 'Rarity: Low to High',
    sort_rarity_desc: 'Rarity: High to Low',
    sort_date_newest: 'Newest Listed',
    sort_date_oldest: 'Oldest',
    tab_hot: 'Trending',
    tab_all: 'All',
    no_cards_found: 'No cards found.',

    security: 'Security',
    support: 'Support',
    logout: 'Logout',
    logout_confirm_title: 'Logout',
    logout_confirm_message: 'Are you sure you want to leave Poké-Market?',
    upgrade_vip: 'Upgrade to VIP',
    vip_benefits: 'VIP Benefits',
    vip_month: 'Monthly',
    vip_year: 'Yearly',
    vip_lifetime: 'Lifetime',
    vip_owned: 'Owned',
    vip_member_forever: 'Lifetime Member',
    vip_forever_desc: 'You have the highest VIP tier.\nEnjoy unlimited benefits forever!',
    vip_activated: 'Activated',
    vip_confirm_title: 'Confirm Payment',
    vip_confirm_message: 'Are you sure you want to upgrade to',
    pay_now: 'Pay Now',
    select_package: 'Select Package to Continue',
    confirm_upgrade: 'Confirm Upgrade',
    
    // Settings
    settings_title: 'System Settings',
    general: 'General',
    sound: 'Sound',
    vibration: 'Vibration',
    options: 'Options',
    language: 'Language',
    currency: 'Currency',
    data: 'Data',
    clear_cache: 'Clear Cache',
    cache_cleared: 'Cache cleared successfully!',
    save_settings: 'Save Settings',
    
    // Titles
    equip: 'Equip',
    equipped: 'Equipped',
    locked: 'Locked',
  }
};

export const useTranslation = () => {
  const language = useUserStore((state) => state.profile.language) || 'vi';
  
  const t = (key: keyof typeof translations['vi']) => {
    return translations[language][key] || key;
  };

  return { t, language };
};
