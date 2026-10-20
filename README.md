# 💖 Website Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10

> *Một món quà công nghệ đong đầy tình cảm, lãng mạn và bất ngờ dành tặng người phụ nữ bạn yêu thương nhất nhân ngày 20/10.*

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-rose.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested%20100%25-brightgreen.svg)](https://vitest.dev/)

---

## 🌟 Ý Nghĩa Website

Ngày Phụ Nữ Việt Nam 20/10 là dịp đặc biệt để bày tỏ tình cảm, lòng biết ơn và sự trân trọng tới người phụ nữ bạn yêu thương (người yêu, vợ, mẹ, hoặc bạn gái). Thay vì chỉ gửi một tin nhắn thông thường, website này mang đến một **hành trình trải nghiệm tương tác 4 chặng đầy cảm xúc**:

1. **Màn Chào Mừng Lãng Mạn (Welcome Screen)**:
   - Lời chúc 20/10 ngọt ngào với hiệu ứng trái tim và cánh hoa bay lơ lửng (`FloatingHearts`).
   - Nút bắt đầu phát nhạc nền du dương nhẹ nhàng làm lay động lòng người.
2. **Thử Thách 1: Hỏi Xoáy Đáp Ngọt (Interactive Quiz)**:
   - Bộ câu hỏi trắc nghiệm dí dỏm về kỷ niệm của hai người.
   - Khi chọn sai: Không hề bị phạt mà nhận được lời nhắn trêu ghẹo cực kỳ đáng yêu và có thể chọn lại ngay!
   - Khi chọn đúng: Hiệu ứng pháo hoa mini rực rỡ và chuyển sang câu tiếp theo.
3. **Thử Thách 2: Hái Hoa Tặng Em (Catch Flowers Mini-game)**:
   - Trò chơi kéo giỏ hứng hoa tươi và trái tim rơi từ trên xuống.
   - Tối ưu mượt mà cả trên điện thoại (chạm/kéo cảm ứng) và máy tính (di chuột).
   - Có nút *"Nhờ anh hái hộ nha 💖"* cho phép nàng bỏ qua bất cứ lúc nào mà vẫn trọn vẹn niềm vui.
4. **Hộp Quà Bí Mật & Bức Thư Tình Cảm (Grand Reveal & Gift Letter)**:
   - Mở chiếc hộp quà 3D rực rỡ kèm tiếng pháo hoa nổ chúc mừng.
   - Bức thư tình chân thành chạm đến trái tim người đọc.
   - Album ảnh kỷ niệm ngọt ngào với chế độ xem phóng to chi tiết.
   - Bộ **Phiếu Quà Tặng Tình Yêu (Love Coupons)**: *"Một ngày massage toàn thân"*, *"Nấu món em thích"*, *"Miễn trừ dọn nhà 1 tuần"*, v.v. Có thể nhấn *"Dùng phiếu này"* để đóng dấu đỏ xác nhận!
   - Nút xem lại hành trình từ đầu và nút bắn pháo hoa ăn mừng bất tận.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

### Yêu Cầu Hệ Thống
- Đã cài đặt **Node.js** (phiên bản 18 trở lên).
- Trình duyệt hiện đại (Chrome, Safari, Edge, Firefox trên máy tính hoặc điện thoại).

### Các Bước Cài Đặt

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/your-username/vietnam-woman-day.git
   cd vietnam-woman-day
   ```

2. **Cài đặt các gói thư viện:**
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: `http://localhost:5173`

4. **Kiểm tra và chạy toàn bộ bài kiểm thử tự động (Unit & Integration Tests):**
   ```bash
   npm test
   # hoặc: npx vitest run
   ```

5. **Đóng gói sản phẩm (Production Build):**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔒 Bảng Điều Khiển Bí Mật (Admin Control Panel)

Website tích hợp sẵn một **Bảng điều khiển Admin ẩn** giúp bạn dễ dàng cá nhân hóa nội dung trực tiếp trên giao diện web mà không cần phải can thiệp vào mã nguồn:

### Cách Mở Bảng Điều Khiển Bí Mật:
- **Trên máy tính**: Nhấn tổ hợp phím **`Ctrl + Shift + E`** (hoặc **`Cmd + Shift + E`** trên macOS).
- **Trên điện thoại / máy tính bảng**: Chạm vào **biểu tượng lấp lánh (Sparkle) nhỏ ở góc dưới cùng bên trái màn hình** (hoặc nhấn giữ 3 giây).

### Các Tính Năng Trong Admin Panel:
1. **Thông tin chung**:
   - Thay đổi tên người nhận (ví dụ: *"Bé Yêu"*, *"Công Chúa Của Anh"*), tên người gửi, tiêu đề chào mừng và thông điệp mở đầu.
2. **Quản lý câu hỏi Quiz**:
   - Thêm/sửa/xóa câu hỏi trắc nghiệm, các lựa chọn đáp án, đánh dấu đáp án đúng và lời nhắn khi chọn sai.
3. **Album ảnh kỷ niệm**:
   - Tải ảnh của hai bạn trực tiếp từ thiết bị.
   - Tích hợp công nghệ nén ảnh tự động chuẩn WebP/JPEG, giữ ảnh sắc nét nhưng dung lượng siêu nhẹ, lưu trữ an toàn trong `localStorage` của trình duyệt.
4. **Bức thư tình & Phiếu quà tặng**:
   - Biên tập nội dung thư tay tình cảm.
   - Thêm các phiếu quà tặng độc quyền (Coupon) theo ý thích của bạn.
5. **Nhạc nền BGM & Quản lý dữ liệu**:
   - Thay đổi URL nhạc nền (hỗ trợ file MP3 online).
   - Nghe thử trực tiếp bài hát.
   - Sao chép toàn bộ cấu hình dạng JSON để lưu trữ hoặc chia sẻ.
   - Dán mã JSON để khôi phục nhanh cấu hình trên thiết bị khác.
   - Nút khôi phục dữ liệu mặc định ban đầu bất cứ lúc nào.

---

## 🌐 Hướng Dẫn Deploy Lên Mạng Để Gửi Link Cho Người Thương

Chỉ mất khoảng **2 - 3 phút** để đưa trang web lên Internet và gửi đường link tuyệt đẹp cho người ấy:

### Cách 1: Deploy lên Vercel (Khuyến nghị - Nhanh & Miễn Phí Nhất)

1. Đẩy mã nguồn lên tài khoản GitHub của bạn.
2. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản GitHub.
3. Nhấp vào nút **"Add New..."** $\rightarrow$ chọn **"Project"**.
4. Chọn repository `vietnam-woman-day`.
5. Vercel sẽ tự động phát hiện dự án Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Nhấp **"Deploy"**. Trong vòng chưa đầy 1 phút, bạn sẽ nhận được đường dẫn dạng `https://ten-du-an.vercel.app` để gửi tặng nàng!

### Cách 2: Deploy lên Netlify

1. Đăng nhập vào [netlify.com](https://www.netlify.com/).
2. Chọn **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Kết nối với GitHub và chọn repository `vietnam-woman-day`.
4. Cấu hình cài đặt:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Nhấp **"Deploy site"** và thưởng thức đường link trực tuyến!

### Cách 3: Deploy lên GitHub Pages

1. Trong file `vite.config.ts`, thêm `base: './'` hoặc `base: '/<ten-repo>/'`.
2. Tạo file `.github/workflows/deploy.yml` để kích hoạt GitHub Actions tự động build và deploy lên nhánh `gh-pages`.
3. Bật GitHub Pages trong mục **Settings $\rightarrow$ Pages** của repository.

---

## 🛠️ Công Nghệ Phát Triển

- **Ngôn ngữ**: TypeScript 5, React 18
- **Công cụ build**: Vite 6 (siêu tốc độ HMR và tối ưu bundle kích thước nhỏ gọn)
- **Giao diện & Phong cách**: Tailwind CSS 3.4 (hiệu ứng Glassmorphism mờ ảo, dải màu gradient hoa hồng lãng mạn)
- **Biểu tượng**: Lucide React
- **Hiệu ứng đặc biệt**: Canvas-Confetti (hiệu ứng cánh hoa bay và pháo hoa ăn mừng)
- **Âm thanh**: Web Audio API & HTML5 Audio tích hợp xử lý tự động phát (Autoplay Unlock)
- **Kiểm thử tự động**: Vitest, React Testing Library (100% test passing)

---

## 💌 Lời Nhắn Nhủ

Chúc bạn và người phụ nữ thân thương có một ngày **20/10 tràn ngập nụ cười, hạnh phúc và những kỷ niệm khó phai**! Nếu bạn thấy dự án này ý nghĩa và hữu ích, hãy để lại một ⭐️ trên repository nhé!
