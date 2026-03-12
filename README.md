# PokéMarket - Hệ Sinh Thái Định Giá & Giao Dịch Thẻ Pokémon (Beta)

[![React Native](https://img.shields.io/badge/React_Native-0.83.1-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)](https://supabase.com/)

PokéMarket là một ứng dụng di động React Native cao cấp, kết hợp công nghệ AI và Gamification để mang lại trải nghiệm tối ưu cho cộng đồng sưu tầm Pokémon TCG. Ứng dụng không chỉ là nơi theo dõi giá mà còn là một thị trường sống động với hệ thống "Trade Up" độc đáo và trợ lý AI thông minh.

---

## 🏗️ Kiến Trúc Dự Án (Folder Structure)

Dự án được tổ chức theo kiến trúc sạch giúp dễ dàng mở rộng và bảo trì:

- **`src/presentation`**: Toàn bộ UI layer (Screens, Components, Styles).
  - `screens/`: Màn hình chức năng (HomeScreen, GachaScreen, TradeUpScreen, v.v.).
  - `navigation/`: Cấu hình React Navigation (Bottom Tabs, Stack).
- **`src/shared/stores`**: State Management layer sử dụng **Zustand**.
  - `userStore`: Quản lý xác thực, hồ sơ và số dư.
  - `portfolioStore`: Quản lý bộ sưu tập thẻ của người dùng.
- **`src/core` & `src/domain`**: Chứa logic nghiệp vụ lõi và các định nghĩa Models (User, Card, Trade).
- **`src/features`**: Các module chức năng đặc biệt như `gacha`.
- **`src/api`**: Cấu hình kết nối API ngoài và Supabase.
- **`src/shared/storage`**: Cấu hình **MMKV** để lưu trữ persistent dữ liệu siêu nhanh.

---

## 🚀 Tính Năng Nổi Bật

### 1. 🧪 Hệ Thống Trade Up & Gacha
- **Trade Up**: Hợp nhất các thẻ bài độ hiếm thấp để có cơ hội nhận thẻ Rare/Ultra Rare với hiệu ứng animations 3D.
- **Gacha (Lootbox)**: Trải nghiệm mở thẻ bài kịch tính với âm thanh và rung (Haptic Feedback).

### 2. 📊 Trung Tâm Thị Trường & Portfolio
- **Real-time Marketplace**: Theo dõi biến động giá hàng nghìn thẻ bài với hiệu suất cao nhờ `@shopify/flash-list`.
- **Định Giá Tài Sản**: Tự động tính toán giá trị bộ sưu tập Trainer dựa trên dữ liệu thị trường.
- **Pokedex**: Hệ thống tra cứu thông tin thẻ bài toàn diện.

### 3. 🤖 Trợ Lý Poké-AI (OpenRouter)
- Phân tích thị trường và tư vấn đầu tư thẻ bài thông minh.
- Hỗ trợ giải đáp thắc mắc về gameplay và độ hiếm thẻ bài.

### 4. 🛡️ Bảo Mật & Xác Thực
- **Auth Flow**: Đăng nhập, Đăng ký và Quên mật khẩu qua OTP mượt mà.
- **Password Toggle**: Tính năng bật/tắt hiển thị mật khẩu ở tất cả các màn hình (Login, Register, Profile).
- **Session Persistence**: Tự động khôi phục phiên đăng nhập khi quay lại app.

---

## 🧪 Tài Khoản Thử Nghiệm (Demo Account)

Để thuận tiện cho việc kiểm tra các chức năng, dự án cung cấp tài khoản demo siêu cấp:

- **Email**: `demo@blindtrade.ai`
- **Mật khẩu**: `password123`

> [!TIP]
> **Đặc quyền tài khoản Demo:**
> - Số dư khởi tạo: **50.000.000 VND**.
> - Trạng thái: **VIP Lifetime**, Level 99.
> - **Auto-Seeding**: Tự động thêm 10 thẻ bài vào Portfolio ngay trong lần đăng nhập đầu tiên để trải nghiệm các tính năng Trade Up/Fusion.

---

## 🛠 Công Nghệ Sử Dụng

| Công Nghệ | Phiên Bản | Công Dụng |
| :--- | :--- | :--- |
| **React Native** | 0.83.1 | Framework chính |
| **React 19** | 19.2.0 | Core UI library |
| **Zustand** | 5.0.11 | State Management |
| **MMKV** | 2.12.2 | Local Storage (Siêu nhanh) |
| **NativeWind** | 4.2.1 | Styling (TailwindCSS) |
| **Supabase** | 2.99.1 | Backend & Authentication |
| **Lucide Icons** | 0.563.0 | Icon System |

---

## ⚙️ Hướng Dẫn Cài Đặt (Setup Guide)

### Yêu Cầu Hệ Thống
- **Node.js**: >= 20.x
- **JDK**: >= 21
- **Android Studio / Xcode**

### Các Bước Thực Hiện

1. **Clone & Install**:
   ```bash
   git clone https://github.com/tomyrese/blind-trade-ai.git
   cd blind-trade-ai
   npm install
   ```

2. **Cấu Hình Môi Trường**:
   Copy file `.env.example` thành `.env` và điền các API key cần thiết:
   - `SUPABASE_URL` & `SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`

3. **Chạy Ứng Dụng**:
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

---

## 📝 Nhật Ký Cập Nhật (Gần Đây)
- ✅ **Sửa lỗi Auth Persistence**: Duy trì phiên đăng nhập khi tắt/mở app.
- ✅ **Nâng cấp Bảo mật**: Thêm nút bật/tắt xem mật khẩu trên toàn bộ ứng dụng.
- ✅ **Tính năng Demo**: Tự động cấp vốn và vật phẩm cho tài khoản demo.
- ✅ **Tối ưu Trade Up**: Sửa lỗi "bad setState" khi chọn thẻ bài và đồng bộ hóa điều kiện độ hiếm.

---

*Phát triển bởi cộng đồng yêu thích Pokémon TCG. Chúc bạn có những phút giây sưu tầm thú vị!*
