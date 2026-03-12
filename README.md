# PokéMarket - Hệ Sinh Thái Định Giá & Giao Dịch Thẻ Pokémon (Beta)

PokéMarket là một ứng dụng di động React Native cao cấp, kết hợp công nghệ AI và Gamification để mang lại trải nghiệm tối ưu cho cộng đồng sưu tầm Pokémon TCG. Ứng dụng không chỉ là nơi theo dõi giá mà còn là một thị trường sống động với hệ thống "Trade Up" độc đáo và trợ lý AI thông minh.

---

## 🚀 Tính Năng Nổi Bật

### 1. Trung Tâm Thị Trường (Real-time Marketplace)
- **Dữ Liệu Trực Tiếp**: Hệ thống cập nhật biến động giá thẻ bài theo thời gian thực (Real-time).
- **Trải Nghiệm Mượt Mà**: Sử dụng `@shopify/flash-list` tối ưu hóa cho danh sách hàng nghìn thẻ bài với tốc độ 60fps.
- **Phân Loại Thông Minh**: Hiệu ứng Gradient và Glow (Phát sáng) động thay đổi theo độ hiếm (Common, Rare, Ultra Rare, Rainbow, Gold).

### 2. Trợ Lý Poké-AI (OpenRouter Integration)
- **Tư Vấn Đầu Tư**: AI phân tích dữ liệu thị trường để đưa ra lời khuyên "Mua" hoặc "Bán".
- **Tra Cứu Nhanh**: Trả lời mọi câu hỏi về kỹ năng thẻ, bộ set và độ hiếm.
- **Hỗ Trợ Đa Ngôn Ngữ**: Tự động chuyển đổi giữa Tiếng Việt và Tiếng Anh.

### 3. Hệ Thống Trade Up (Hợp Nhất Thẻ Bài)
- **Cơ Chế Rủi Ro - Phần Thưởng**: Hợp nhất nhiều thẻ bài độ hiếm thấp (Common/Uncommon) để nhận thẻ bài có giá trị cực cao.
- **Giải Thuật Cân Bằng**: Tỉ lệ thành công dựa trên tổng giá trị (VND) của các thẻ bài đưa vào.
- **Hoạt Ảnh Lootbox 3D**: Trải nghiệm mở hộp kịch tính với hiệu ứng âm thanh và rung (Haptic Feedback).

### 4. Quản Lý Danh Mục (Trainer Portfolio)
- **Định Giá Tài Sản**: Tự động tính toán tổng giá trị bộ sưu tập dựa trên giá thị trường hiện tại.
- **Hệ Thống Rank Trainer**: Thăng cấp từ *Tân Binh* đến *Nhà Sưu Tầm Đại Tài* dựa trên thành tích.
- **Hồ Sơ Trainer**: Chỉnh sửa avatar, biệt danh và theo dõi chỉ số Pokedex cá nhân.

### 5. Bảo Mật & Xác Thực (OTP Flow)
- **OTP Quên Mật Khẩu**: Quy trình khôi phục mật khẩu 3 bước bảo mật cao: Nhận mã qua Email -> Xác thực OTP -> Đổi mật khẩu trực tiếp.
- **Supabase Integration**: Sử dụng Supabase Auth để quản lý danh tính người dùng một cách an toàn.

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: React Native 0.83.1, TypeScript.
- **Styling**: NativeWind (TailwindCSS), Reanimated 3 (Animations), Linear Gradient.
- **State Management**: **Zustand** kết hợp với **MMKV** để lưu trữ dữ liệu cục bộ siêu nhanh.
- **Backend & Auth**: Supabase.
- **AI Engine**: OpenRouter (Trinity Large Preview).
- **UI Components**: Lucide Icons, FlashList, Bottom Tabs, Native Stack.

---

## ⚙️ Hướng Dẫn Cài Đặt (Setup Guide)

### Yêu Cầu Hệ Thống
- **Node.js**: >= 20.x
- **JDK**: >= 21
- **Android Studio / Xcode** (để build native)

### Các Bước Thực Hiện

1. **Clone & Install**:
   ```bash
   git clone https://github.com/tomyrese/blind-trade-ai.git
   cd blind-trade-ai
   npm install
   ```

2. **Cấu Hình Môi Trường (Security)**:
   Để bảo mật, dự án sử dụng biến môi trường. Hãy copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
   *Lưu ý: Không bao giờ commit file `.env` chứa key thực lên GitHub.*

3. **Chạy Ứng Dụng**:
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

---

## 🔒 Quản Lý API Keys (Quan Trọng)

Dự án yêu cầu các cấu hình sau để hoạt động đầy đủ:

| Key | Vị trí file | Công dụng |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `src/api/supabase.js` | Kết nối Backend |
| `SUPABASE_ANON_KEY` | `src/api/supabase.js` | Authentication |
| `OPENROUTER_API_KEY` | `src/shared/services/OpenRouterService.ts` | Trợ lý AI |

> [!WARNING]
> Mọi API Key cứng (hardcoded) trong mã nguồn đã được gỡ bỏ và thay thế bằng placeholders. Vui lòng điền thông tin vào file `.env` hoặc cập nhật thủ công các biến hằng số trong code để ứng dụng hoạt động.

---

## 📂 Cấu Trúc Thư Mục

- `src/presentation`: Chứa toàn bộ màn hình, components và assets.
- `src/shared/stores`: Quản lý logic trạng thái (User, Portfolio, Market, Trade).
- `src/shared/utils`: Chứa i18n/translations và các hàm bổ trợ.
- `src/api`: Cấu hình kết nối Supabase và các service API ngoài.

---

*Phát triển bởi cộng đồng yêu thích Pokémon TCG.*
