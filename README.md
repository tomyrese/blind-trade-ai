# PokéMarket - Ứng Dụng Định Giá & Giao Dịch Blind Box

PokéMarket là một ứng dụng di động React Native cao cấp được thiết kế dành cho những người sưu tập và giao dịch Thẻ Pokémon. Ứng dụng mô phỏng một thị trường chuyên nghiệp với các tính năng như giao dịch hộp mù ("Trade Up"), quét/định giá thẻ bài bằng AI và hiển thị dữ liệu thị trường theo thời gian thực.

## 🌟 Tính Năng Chính

### 1. Bảng Tin Thị Trường (Trang Chủ)

- **Dữ Liệu Trực Tiếp**: Cập nhật giá thẻ, xu hướng và các vật phẩm "Hot" theo thời gian thực.
- **Tìm Kiếm Nâng Cao**: Tìm kiếm tức thì hỗ trợ gõ tiếng Việt (Telex/VNI).
- **Danh Sách FlashList**: Hiệu năng cuộn 60fps mượt mà cho danh sách thẻ khổng lồ.
- **Hiệu Ứng Rarity**: Hiệu ứng phát sáng động (Xanh Neon, Tím, Vàng) dựa trên độ hiếm của thẻ.

### 2. Chat (Poké-AI)

- **Trợ Lý AI**: Chatbot có khả năng trả lời các câu hỏi về giá thẻ, độ hiếm và lời khuyên đầu tư.
- **Nhận Thức Ngữ Cảnh**: Ghi nhớ lịch sử hội thoại để đối thoại tự nhiên hơn.

### 3. Quản Lý Danh Mục Đầu Tư (Bộ Sưu Tập)

- **Theo Dõi Kho**: Quản lý bộ sưu tập thẻ của bạn với tính năng theo dõi định giá.
- **Tài Khoản Ảo**: Bao gồm "Chế Độ Demo" để tạo sẵn danh mục đầu tư với các thẻ test.
- **Tổng Giá Trị**: Tính toán giá trị ròng của bộ sưu tập theo thời gian thực.

### 4. Trade Up / Blind Box (Hợp Nhất)

- **Giao Dịch Gamified**: Kết hợp các thẻ độ hiếm thấp để có cơ hội nhận thẻ Huyền Thoại.
- **Hoạt Ảnh Lootbox**: Hiệu ứng mở thẻ hấp dẫn với các hạt hiệu ứng và phản hồi rung.

### 5. Hồ Sơ Trainer & VIP (Trainer Profile)

- **Hệ Thống Rank**: Thăng cấp rank trainer từ Tân Binh (Rookie) lên Bậc Thầy (Master) dựa trên giá trị bộ sưu tập.
- **Thành Viên VIP**: Người đăng ký nhận đặc quyền, khung avatar vàng/bạch kim và bonus XP.
- **Tổng Quan Chỉ Số**: Theo dõi tiến độ Pokedex và các chỉ số bộ sưu tập.

## ⚙️ Cấu Hình API AI (Quan Trọng)

Để sử dụng tính năng Chat AI (Poké-AI), bạn cần cung cấp API Key từ Google Gemini.

1. **Lấy API Key**: Truy cập [OpenRouter](https://openrouter.ai/) để tạo khóa mới.
2. **Cấu Hình**:
   - Mở file: `src/shared/services/GeminiService.ts`
   - Tìm biến `OPENROUTER_API_KEY` (dòng 5).
   - Thay thế `'API_KEY'` bằng khóa thực của bạn:
     ```typescript
     const OPENROUTER_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
     ```

## 🛠 Công Nghệ Sử Dụng

- **Core**: React Native (0.76+), TypeScript
- **Quản Lý State**: Zustand (Lưu trữ qua MMKV)
- **Điều Hướng**: React Navigation (Stack + Bottom Tabs)
- **Giao Diện**: NativeWind (TailwindCSS cho RN) + Reanimated 3
- **Hiệu Năng**: @shopify/flash-list, Tối ưu hóa React.memo
- **Tích Hợp AI/Backend**: Kiến trúc Custom Hook (Mocked cho Demo)

## 🚀 Bắt Đầu

### Yêu Cầu

- Node.js v24.12.0
- npm 11.6.2
- JDK 21
- Android Studio / Xcode

### Cài Đặt

1. **Clone repository**

   ```bash
   git clone https://github.com/tomyrese/blind-trade-ai.git
   cd blind-trade-ai
   ```

2. **Cài đặt thư viện**

   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Chạy ứng dụng**

   ```bash
   # Android
   npm run android
   ```

## 📱 Ghi Chú Cho Nhà Phát Triển

### Thiết Lập Tài Khoản Ảo

Để điền dữ liệu test vào danh mục đầu tư:

1. Vào tab **Trainer**.
2. `usePortfolioStore` cung cấp action `seedPortfolio()` (tự động kích hoạt trong chế độ demo).

### Cấu Trúc Thư Mục

- `src/presentation`: Tầng UI (Màn hình, Components)
- `src/domain`: Business Logic (Models)
- `src/data`: API Repositories (Mocked)
- `src/shared`: Utilities, Stores, Hooks

---

_Xây dựng với ❤️ dành cho người hâm mộ Pokémon TCG._
