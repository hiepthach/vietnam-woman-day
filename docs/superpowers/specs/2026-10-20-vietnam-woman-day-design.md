# Thiết Kế Chi Tiết Website Chúc Mừng 20/10 (Storybook Quest)

## 1. Giới thiệu & Mục tiêu
Website được thiết kế dành riêng để chúc mừng người yêu/vợ nhân ngày Phụ nữ Việt Nam 20/10. Trải nghiệm được xây dựng theo hình thức một hành trình tương tác cảm xúc 3 chặng ("Storybook Quest"): từ bất ngờ, vui tươi đến vỡ òa xúc động khi mở món quà và bức thư tình cảm.

Website hướng tới người dùng trải nghiệm trên thiết bị di động (smartphone qua link gửi trên Zalo, Messenger, SMS), đồng thời tối ưu trên desktop, hỗ trợ âm nhạc du dương và giao diện lung linh, lãng mạn.

---

## 2. Công nghệ & Kiến trúc Hệ thống

### 2.1. Tech Stack
* **Build Tool & Framework:** Vite + React 18 / 19 + TypeScript.
* **Styling:** Tailwind CSS (màu sắc chủ đạo: hồng pastel, tím nhạt, vàng gold sang trọng `#FFF1F2`, `#FDA4AF`, `#F43F5E`, `#FB7185`).
* **Icons:** `lucide-react`.
* **Animation & Visual Effects:** 
  * `framer-motion`: Chuyển cảnh mượt mà giữa các màn, hiệu ứng nhún nhảy, fade-in/out, rung lắc hộp quà 3D, mở phong bì thư.
  * `canvas-confetti`: Hiệu ứng pháo hoa rực rỡ, cánh hoa bay khi mở hộp quà và hoàn thành các chặng.
* **Âm thanh:** HTML5 Audio API kết hợp quản lý trạng thái âm thanh tập trung, hỗ trợ nhạc nền và sound effects (tiếng click, tiếng chuông trả lời đúng, tiếng mở nắp quà, tiếng pháo hoa).
* **Lưu trữ dữ liệu:** `localStorage` trên trình duyệt người dùng, hỗ trợ xuất/nhập tệp JSON và khôi phục dữ liệu gốc.

### 2.2. Kiến trúc thư mục dự án
```
vietnam-woman-day/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-10-20-vietnam-woman-day-design.md
├── public/
│   ├── audio/
│   │   ├── romantic-bgm.mp3
│   │   ├── success.mp3
│   │   ├── pop.mp3
│   │   └── open-gift.mp3
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── default-photos/
│   ├── components/
│   │   ├── WelcomeScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── CatchFlowersScreen.tsx
│   │   ├── GiftLetterScreen.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── FloatingHearts.tsx
│   │   └── AdminModal.tsx
│   ├── context/
│   │   └── ConfigContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── sound.ts
│   │   ├── confetti.ts
│   │   └── imageCompression.ts
│   ├── data/
│   │   └── defaultConfig.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Cấu trúc Dữ liệu (Data Schema)

Cấu hình website được quản lý qua một đối tượng JSON `AppConfig`:

```typescript
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  wrongMessage: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PhotoItem {
  id: string;
  url: string; // Base64 data URL hoặc URL trực tuyến
  caption: string;
  date?: string;
}

export interface AppConfig {
  recipientName: string; // Tên của nàng (VD: Em yêu, Bé Mèo, Vợ yêu, Mai Chi)
  senderName: string;    // Tên người gửi (VD: Anh, Chồng yêu, Hoàng Nam)
  greetingTitle: string; // Tiêu đề chào mừng
  greetingSubtitle: string; // Phụ đề lãng mạn
  quizQuestions: QuizQuestion[];
  catchFlowersTarget: number; // Mặc định 10 đóa hoa
  giftLetter: {
    title: string;
    paragraphs: string[];
    closing: string;
  };
  coupons: LoveCoupon[];
  photos: PhotoItem[];
  bgmUrl: string; // Đường dẫn bài hát nền
}
```

---

## 4. Chi tiết Các Màn hình & Trải nghiệm Người dùng

### 4.1. Màn 1: Welcome Screen (`WelcomeScreen.tsx`)
* **Mục tiêu:** Tạo cảm giác tò mò, háo hức và giải quyết rào cản Autoplay Audio của trình duyệt.
* **Giao diện:**
  * Hiệu ứng hạt tim/cánh hoa hồng bay chậm nền canvas/CSS (`FloatingHearts`).
  * Khối thiệp chào: *"Chào mừng ngày Phụ nữ Việt Nam 20/10"*, dòng chữ gửi tới `[Tên nàng]`.
  * Nút bấm phát sáng: *"Bắt đầu khám phá món quà của anh 💌"*.
* **Tương tác:** Nhấn nút sẽ phát bài nhạc nền lãng mạn và chuyển sang Màn 2 với animation trượt mượt mà.

### 4.2. Màn 2: Trắc nghiệm kỷ niệm (`QuizScreen.tsx`)
* **Mục tiêu:** Gợi nhớ những kỷ niệm ngọt ngào và tạo tiếng cười hóm hỉnh.
* **Quy tắc:**
  * Hiển thị lần lượt 3 câu hỏi (tiến trình 1/3, 2/3, 3/3).
  * Khi chọn đáp án sai: Lắc nhẹ (shake animation) + hiển thị tooltip thông báo dễ thương (`wrongMessage`), không trừ điểm, cho phép bấm lại đáp án đúng.
  * Khi chọn đúng: Hiệu ứng pháo giấy nhỏ (mini-confetti) + âm thanh leng keng chúc mừng, tự động chuyển sang câu tiếp theo sau 800ms.
  * Sau khi hoàn thành câu thứ 3: Thông báo *"Chúc mừng em đã xuất sắc vượt qua Chặng 1! Sẵn sàng cho Chặng 2 nhé!"*.

### 4.3. Màn 3: Mini-game hái hoa 20/10 (`CatchFlowersScreen.tsx`)
* **Mục tiêu:** Tương tác vui vẻ, sống động trước khi bước vào màn cao trào.
* **Quy tắc trò chơi:**
  * Chiếc giỏ hoa ở đáy màn hình, người chơi di chuyển bằng cách vuốt ngón tay (touch drag) hoặc di chuột.
  * Các đóa hoa hồng (🌹, 🌸, 🌷) rơi ngẫu nhiên từ trên xuống với tốc độ vừa phải.
  * Mỗi khi hứng được 1 bông hoa: Điểm số tăng +1, âm thanh pop vui tai, thanh tiến trình hoa đầy dần (0/10 $\rightarrow$ 10/10).
  * Thời gian hoàn thành trung bình ~15-20 giây.
  * **Cứu cánh (UX Fallback):** Nút *"Anh hái giúp em nha 💖"* hoặc *"Bỏ qua"* để những ai muốn xem ngay quà không bị cản trở.

### 4.4. Màn 4: Mở Hộp Quà & Bức Thư Tình Cảm (`GiftLetterScreen.tsx`)
* **Mục tiêu:** Màn cao trào cảm xúc nhất của website.
* **Các bước diễn ra:**
  1. **Hộp quà bí mật:** Một hộp quà 3D buộc ruy băng hồng vàng rung rinh giữa màn hình cùng dòng chữ *"Chạm để mở quà nào em yêu!"*.
  2. **Khoảnh khắc mở nắp:** Khi chạm vào, nắp hộp bật tung bay lên cao, hiệu ứng âm thanh mở quà vang lên, pháo hoa `canvas-confetti` rực rỡ bắn bung khắp màn hình trong 3–5 giây.
  3. **Bức thư tay 20/10:** Bức thư viết trên nền giấy vintage/pastel cuộn mở ra, từng đoạn thư được định dạng thanh lịch, chân thành và đong đầy tình cảm.
  4. **Album ảnh kỷ niệm (Polaroid Carousel):** Các bức ảnh của hai người hiện ra với khung trắng phong cách Polaroid, có kèm chú thích ngọt ngào, hỗ trợ vuốt qua lại.
  5. **Love Coupons (Phiếu quà tặng đặc quyền):** 4-6 thẻ voucher đáng yêu (VD: *Voucher đi ăn món em thích*, *Voucher miễn tội làm nũng*, *Voucher ôm hôn 24/7*), có nút bấm "Sử dụng voucher" tạo cảm giác tương tác thực tế.

### 4.5. Trình phát nhạc nền (`MusicPlayer.tsx`)
* Luôn hiển thị biểu tượng đĩa nhạc xoay tròn ở góc phải trên màn hình.
* Có thể bấm để Tạm dừng (Pause) / Tiếp tục phát (Play).
* Trạng thái nhạc nền không ngắt quãng khi người dùng di chuyển qua lại giữa các màn hình.

### 4.6. Màn hình quản trị bí mật (`AdminModal.tsx`)
* **Cách kích hoạt:**
  * Nhấn giữ biểu tượng trái tim nhỏ ở góc dưới bên trái màn hình trong 3 giây (trên điện thoại).
  * Hoặc nhấn phím tắt `Ctrl + Shift + E` (trên máy tính).
* **Chức năng:**
  * Tab 1 - Thông tin chung: Sửa tên người nhận, tên người gửi, tiêu đề chào mừng.
  * Tab 2 - Câu hỏi trắc nghiệm: Thêm/sửa/xóa câu hỏi, các phương án lựa chọn và lời nhắn trêu ghẹo khi chọn sai.
  * Tab 3 - Album ảnh: Tải ảnh từ điện thoại/máy tính lên (hệ thống tự động resize và nén dạng Base64 dưới 200KB/ảnh, tối đa 8 ảnh để không tràn `localStorage`), sửa chú thích ảnh.
  * Tab 4 - Bức thư & Voucher: Sửa từng đoạn của bức thư chúc mừng 20/10 và các thẻ quà tặng.
  * Tab 5 - Nhạc nền: Dán link bài hát MP3 online hoặc chọn bài hát có sẵn.
  * Các nút hành động:
    * **"Lưu thay đổi"**: Cập nhật tức thì vào `localStorage`.
    * **"Sao chép cấu hình (JSON)"**: Để sao lưu hoặc chuyển cấu hình sang máy khác.
    * **"Khôi phục dữ liệu gốc"**: Reset về bộ dữ liệu mẫu ngọt ngào ban đầu.

---

## 5. Xử lý Lỗi & Tối ưu Trải nghiệm (Edge Cases & Resilience)

1. **Chặn Autoplay:** Các trình duyệt hiện đại (Safari trên iOS, Chrome trên Android) chặn âm thanh phát tự động khi mới vào trang. Thiết kế `WelcomeScreen` với nút bấm bắt đầu đảm bảo hành động chạm đầu tiên mở khóa Web Audio context hợp lệ.
2. **Scroll Lock khi chơi game:** Khi màn hình `CatchFlowersScreen` hiển thị, thuộc tính `touch-action: none` và `overflow: hidden` được áp dụng cho màn hình game để việc vuốt chạm giỏ hoa không làm cuộn trang web ngoài ý muốn.
3. **Giới hạn LocalStorage:** Khi người dùng upload ảnh trực tiếp, tiện ích `imageCompression.ts` sẽ vẽ ảnh lên `<canvas>`, resize chiều rộng tối đa 800px, nén JPEG chất lượng 0.75, đảm bảo dung lượng mỗi ảnh chỉ 50-150KB, tránh vượt giới hạn 5MB của trình duyệt.
4. **Offline & Fallback Audio:** Có sẵn nhạc cụ mặc định và hiệu ứng âm thanh nhỏ trong thư mục `public/audio/`, nếu mất mạng nhạc nền cục bộ vẫn phát bình thường.

---

## 6. Kế hoạch Kiểm thử & Tiêu chí Nghiệm thu (Verification & Acceptance)

* [ ] Chạy mượt mà trên Chrome, Safari, Firefox trên cả điện thoại (iOS, Android) và máy tính.
* [ ] Hoàn thành trọn vẹn luồng 4 màn hình không xảy ra lỗi giật lag hay crash.
* [ ] Âm thanh phát đúng lúc, nút tắt/bật nhạc hoạt động chính xác.
* [ ] Mini-game bắt hoa phản hồi nhạy trên màn hình cảm ứng, có tính năng bỏ qua.
* [ ] Hiệu ứng mở hộp quà, pháo hoa `canvas-confetti` hoạt động hoành tráng, mượt mà.
* [ ] Mở được `AdminModal` qua cả phím tắt và nhấn giữ icon 3s trên điện thoại; lưu thành công dữ liệu tùy biến vào `localStorage` và cập nhật tức thì trên giao diện.
