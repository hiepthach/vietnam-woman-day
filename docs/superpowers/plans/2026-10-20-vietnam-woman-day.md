# Vietnam Women's Day (20/10) Celebration Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng một website chúc mừng ngày 20/10 dành tặng người yêu/vợ theo mô hình hành trình 3 chặng cảm xúc ("Storybook Quest"): Chào mừng $\rightarrow$ Câu đố kỷ niệm $\rightarrow$ Mini-game hái hoa $\rightarrow$ Mở hộp quà bí mật bung pháo hoa, thư tay tình cảm, album ảnh Polaroid và phiếu đặc quyền tình yêu (Love Coupons), kèm màn hình Admin bí mật để tùy biến nội dung trực tiếp trên trình duyệt.

**Architecture:** Ứng dụng Single Page Application (SPA) trên nền React + Vite + TypeScript. Quản lý trạng thái bằng React Context (`ConfigContext`) lưu trữ trong `localStorage`. Tối ưu hiệu ứng chuyển động với Tailwind CSS, Web Animations và `canvas-confetti`. Hệ thống âm thanh tương tác qua Web Audio API & HTML5 Audio. Thiết kế mobile-first, mượt mà trên iPhone/Android và desktop.

**Tech Stack:** React 18 / 19, TypeScript, Vite, Tailwind CSS, lucide-react, canvas-confetti, Vitest, @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-10-20-vietnam-woman-day-design.md`

## Global Constraints

- Chạy 100% phía client, không cần backend server phức tạp, dễ dàng deploy lên Vercel / GitHub Pages.
- Tối ưu tuyệt đối cho màn hình cảm ứng di động (Mobile-first, touch-friendly, scroll lock khi chơi game).
- Giải quyết triệt để vấn đề Autoplay Audio trên Safari iOS và Chrome Android: âm thanh kích hoạt sau lần tương tác đầu tiên tại WelcomeScreen.
- Dung lượng ảnh lưu trong LocalStorage được nén tự động qua HTML5 Canvas dưới 200KB/ảnh.
- Mọi chức năng tùy biến đều có thể thao tác trong Secret Admin Modal (`Ctrl+Shift+E` hoặc giữ icon 3 giây) mà không cần can thiệp vào mã nguồn.

---

### Task 1: Scaffolding dự án & Cấu hình môi trường

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

**Interfaces:**
- Consumes: None (khởi tạo dự án mới)
- Produces: Môi trường React + TypeScript + Tailwind CSS + Vitest sẵn sàng hoạt động.

- [ ] **Step 1: Viết cấu hình package.json và cài đặt dependencies**

Viết `package.json` với các dependency:
```json
{
  "name": "vietnam-woman-day",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Cấu hình Vite, TypeScript, Tailwind CSS, PostCSS và test setup**

Viết `vite.config.ts`:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Viết `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/index.css`, và `src/test/setup.ts`.

- [ ] **Step 3: Viết test kiểm tra App mount thành công**

Viết `src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Smoke Test', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Chạy test để xác nhận test fail (khi chưa có App.tsx hoàn chỉnh)**
Chạy: `npm test`
Kết quả mong đợi: FAIL hoặc component chưa có `data-testid="app-container"`.

- [ ] **Step 5: Viết mã tối thiểu cho App.tsx và main.tsx**
Viết `src/App.tsx`:
```tsx
import React from 'react';

export default function App() {
  return (
    <div data-testid="app-container" className="min-h-screen bg-rose-50 text-rose-900 font-sans">
      <h1 className="text-2xl font-bold text-center p-4">Chúc Mừng Ngày 20/10</h1>
    </div>
  );
}
```

- [ ] **Step 6: Chạy test để xác nhận PASS và kiểm tra build**
Chạy: `npm test && npm run build`
Kết quả mong đợi: PASS.

- [ ] **Step 7: Commit**
```bash
git add .
git commit -m "chore: scaffold project with react, vite, tailwind and vitest"
```

---

### Task 2: Data Models, Default Configuration & ConfigContext

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/defaultConfig.ts`
- Create: `src/context/ConfigContext.tsx`
- Create: `src/context/ConfigContext.test.tsx`

**Interfaces:**
- Consumes: None
- Produces:
  - `AppConfig`, `QuizQuestion`, `LoveCoupon`, `PhotoItem` trong `src/types/index.ts`
  - `DEFAULT_CONFIG: AppConfig` trong `src/data/defaultConfig.ts`
  - `ConfigProvider` và hook `useConfig()` trong `src/context/ConfigContext.tsx`

- [ ] **Step 1: Viết test cho ConfigContext**

Tạo `src/context/ConfigContext.test.tsx`:
- Kiểm tra `useConfig()` cung cấp đúng cấu hình mặc định ban đầu.
- Kiểm tra hàm `updateConfig()` lưu dữ liệu vào `localStorage` và cập nhật state.
- Kiểm tra hàm `resetConfig()` đưa cấu hình về `DEFAULT_CONFIG`.
- Kiểm tra hàm `exportConfig()` và `importConfig()` hoạt động chính xác với chuỗi JSON.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/context/ConfigContext.test.tsx`
Kết quả mong đợi: FAIL (do chưa có file `ConfigContext.tsx` và `types`).

- [ ] **Step 3: Định nghĩa types trong `src/types/index.ts`**
Khai báo đầy đủ các interface:
`QuizQuestion`, `LoveCoupon`, `PhotoItem`, `AppConfig`, `ConfigContextType`.

- [ ] **Step 4: Khởi tạo dữ liệu mẫu trong `src/data/defaultConfig.ts`**
Cung cấp dữ liệu mẫu ngọt ngào, đậm chất 20/10:
- Người nhận: "Em Yêu", Người gửi: "Anh"
- 3 câu hỏi trắc nghiệm kỷ niệm vui nhộn kèm `wrongMessage` dí dỏm.
- 4 bức ảnh kỷ niệm mẫu (placeholder hoa hồng, hoàng hôn, nắm tay, nụ cười).
- Bức thư 20/10 tình cảm, lãng mạn chia thành các đoạn văn.
- 4 thẻ Love Coupons ("Voucher massage vai gáy", "Voucher nấu bữa tối món em mê", "Voucher quyền miễn giận 24h", "Voucher trà sữa full topping").
- Nhạc nền mặc định du dương.

- [ ] **Step 5: Hiện thực `ConfigContext.tsx`**
Lưu trữ trong `localStorage` với key `vietnam_woman_day_config_v1`. Xử lý fallback an toàn nếu JSON bị lỗi.

- [ ] **Step 6: Chạy test để xác nhận PASS**
Chạy: `npm test src/context/ConfigContext.test.tsx`
Kết quả mong đợi: PASS.

- [ ] **Step 7: Commit**
```bash
git add src/types/index.ts src/data/defaultConfig.ts src/context/ConfigContext.tsx src/context/ConfigContext.test.tsx
git commit -m "feat: add app types, default config and persistent ConfigContext"
```

---

### Task 3: Utilities - Sound Effects, Confetti & Image Compression

**Files:**
- Create: `src/utils/sound.ts`
- Create: `src/utils/confetti.ts`
- Create: `src/utils/imageCompression.ts`
- Create: `src/utils/utils.test.ts`

**Interfaces:**
- Consumes: `canvas-confetti`
- Produces:
  - `soundManager`: `{ playBgm, pauseBgm, toggleBgm, playSuccess, playPop, playOpenGift, isMuted, setMuted }`
  - `triggerConfetti`: `{ fireFlowerPetals, fireGiftExplosion, fireMiniBurst }`
  - `compressImage(file: File, maxWidth?: number, quality?: number): Promise<string>`

- [ ] **Step 1: Viết test cho các utility trong `src/utils/utils.test.ts`**
- Test `imageCompression` trả về chuỗi data URL base64 hợp lệ khi đưa vào đối tượng Blob/File.
- Test `soundManager` có đầy đủ các hàm điều khiển và không gây vỡ crash khi Web Audio Context chưa được kích hoạt.
- Test `triggerConfetti` gọi hàm canvas-confetti tương ứng.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/utils/utils.test.ts`
Kết quả mong đợi: FAIL.

- [ ] **Step 3: Hiện thực Web Audio âm thanh trong `src/utils/sound.ts`**
Tạo hệ thống âm thanh không phụ thuộc file ngoài nặng nề:
- Dùng Web Audio API tạo âm sắc piano/harp ngọt ngào cho `playSuccess`, tiếng bong bóng `playPop`, tiếng chuông ngân lấp lánh `playOpenGift`.
- Dùng HTML5 Audio quản lý bài hát nền (BGM) với đường link tùy biến, có cơ chế bắt lỗi an toàn (catch promise reject).

- [ ] **Step 4: Hiện thực hiệu ứng pháo hoa cánh hoa trong `src/utils/confetti.ts`**
Cấu hình hiệu ứng pháo hoa với tông màu hồng, đỏ, vàng gold sang trọng (`#ff4d6d`, `#ff758f`, `#ffd166`, `#ffffff`).

- [ ] **Step 5: Hiện thực nén ảnh bằng HTML5 Canvas trong `src/utils/imageCompression.ts`**
Tạo hàm `compressImage` đọc File qua `FileReader`, tạo Image, vẽ lên `<canvas>` với kích thước tối đa 800px, xuất ra `image/jpeg` chất lượng 0.75 để giữ dung lượng < 150KB.

- [ ] **Step 6: Chạy test để xác nhận PASS**
Chạy: `npm test src/utils/utils.test.ts`
Kết quả mong đợi: PASS.

- [ ] **Step 7: Commit**
```bash
git add src/utils/
git commit -m "feat: add soundManager, confetti effects and imageCompression utilities"
```

---

### Task 4: UI Shared Components - Floating Hearts Background & Music Player

**Files:**
- Create: `src/components/FloatingHearts.tsx`
- Create: `src/components/MusicPlayer.tsx`
- Create: `src/components/SharedComponents.test.tsx`

**Interfaces:**
- Consumes: `soundManager`, `useConfig`
- Produces:
  - `<FloatingHearts />`: Background hiệu ứng trái tim và cánh hoa bay nhẹ nhàng, không cản trở thao tác chuột/chạm (`pointer-events-none`).
  - `<MusicPlayer />`: Widget góc trên bên phải màn hình hiển thị đĩa nhạc quay, nút play/pause và trạng thái bài hát.

- [ ] **Step 1: Viết test cho FloatingHearts và MusicPlayer**
Viết `src/components/SharedComponents.test.tsx`:
- Render `FloatingHearts` không gây lỗi và có class `pointer-events-none`.
- Render `MusicPlayer` hiển thị nút bật/tắt nhạc, click vào nút gọi hàm toggle nhạc.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/SharedComponents.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `FloatingHearts.tsx`**
Sinh ngẫu nhiên 15-20 hạt tim (❤️, 💖, 🌸, ✨) với vị trí, kích thước, thời gian bay và độ trễ khác nhau bằng CSS keyframes `float-up`.

- [ ] **Step 4: Hiện thực `MusicPlayer.tsx`**
Nút đĩa nhạc quay mượt mà với icon `Music` hoặc `Disc` từ `lucide-react`, thanh sóng âm thanh rung động khi đang phát, hỗ trợ bật/tắt chỉ với 1 chạm.

- [ ] **Step 5: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/SharedComponents.test.tsx`
Kết quả: PASS.

- [ ] **Step 6: Commit**
```bash
git add src/components/FloatingHearts.tsx src/components/MusicPlayer.tsx src/components/SharedComponents.test.tsx
git commit -m "feat: add FloatingHearts and MusicPlayer shared components"
```

---

### Task 5: Màn 1 - Welcome Screen Component

**Files:**
- Create: `src/components/WelcomeScreen.tsx`
- Create: `src/components/WelcomeScreen.test.tsx`

**Interfaces:**
- Consumes: `useConfig`, `soundManager`
- Produces: `<WelcomeScreen onStart={() => void} />`

- [ ] **Step 1: Viết test cho WelcomeScreen**
Viết `src/components/WelcomeScreen.test.tsx`:
- Hiển thị tên người nhận từ `useConfig()`.
- Hiển thị tiêu đề và lời nhắn mở đầu.
- Khi click nút "Bắt đầu khám phá": hàm `onStart` được gọi và `soundManager.playBgm()` được kích hoạt.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/WelcomeScreen.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `WelcomeScreen.tsx`**
- Thiệp kính mờ Glassmorphism sang trọng với viền hồng nhạt phát sáng (`backdrop-blur-md bg-white/70 shadow-2xl`).
- Huy hiệu đặc biệt: "Ngày Phụ Nữ Việt Nam 20/10" kèm biểu tượng vương miện/hoa hồng.
- Dòng chữ chào đón cá nhân hóa: gửi tới `recipientName`.
- Nút bấm chính có hiệu ứng nhịp đập tim (pulse): *"Chạm để mở món quà bí mật 💌"*.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/WelcomeScreen.test.tsx`
Kết quả: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/WelcomeScreen.tsx src/components/WelcomeScreen.test.tsx
git commit -m "feat: implement WelcomeScreen with personalized greeting and audio unlock"
```

---

### Task 6: Màn 2 - Quiz Screen (Hỏi xoáy đáp ngọt)

**Files:**
- Create: `src/components/QuizScreen.tsx`
- Create: `src/components/QuizScreen.test.tsx`

**Interfaces:**
- Consumes: `useConfig`, `soundManager`, `triggerConfetti`
- Produces: `<QuizScreen onComplete={() => void} />`

- [ ] **Step 1: Viết test cho QuizScreen**
Viết `src/components/QuizScreen.test.tsx`:
- Hiển thị câu hỏi số 1 và danh sách các phương án.
- Chọn phương án sai: hiển thị tooltip trêu ghẹo (`wrongMessage`) và rung lắc nhẹ.
- Chọn phương án đúng: phát âm thanh chúc mừng, chuyển sang câu hỏi tiếp theo.
- Sau khi trả lời đúng hết 3 câu: gọi `onComplete()`.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/QuizScreen.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `QuizScreen.tsx`**
- Thanh tiến trình câu hỏi (Question Progress Bar: 1/3, 2/3, 3/3).
- Hiệu ứng chuyển động mượt mà giữa các câu hỏi.
- Nút lựa chọn lớn, bo tròn, dễ bấm bằng ngón tay trên điện thoại.
- Cơ chế phản hồi tức thì:
  - Chọn sai: màu đỏ cam nhạt + lắc nhẹ + thông báo hài hước (VD: *"Sai rồi nha cô nương ơi, chọn lại đi nào!"*).
  - Chọn đúng: đổi sang màu xanh ngọc/hồng tươi + âm thanh leng keng + nổ confetti nhỏ + chuyển câu sau 800ms.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/QuizScreen.test.tsx`
Kết quả: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/QuizScreen.tsx src/components/QuizScreen.test.tsx
git commit -m "feat: implement QuizScreen with interactive feedback and progress tracking"
```

---

### Task 7: Màn 3 - Mini-game Hái Hoa 20/10 (Catch Flowers)

**Files:**
- Create: `src/components/CatchFlowersScreen.tsx`
- Create: `src/components/CatchFlowersScreen.test.tsx`

**Interfaces:**
- Consumes: `useConfig`, `soundManager`, `triggerConfetti`
- Produces: `<CatchFlowersScreen onComplete={() => void} />`

- [ ] **Step 1: Viết test cho CatchFlowersScreen**
Viết `src/components/CatchFlowersScreen.test.tsx`:
- Hiển thị mục tiêu cần hứng (VD: 0/10 bông hoa).
- Có nút "Bỏ qua / Nhờ anh hái hộ", khi bấm nút này gọi ngay `onComplete()`.
- Hứng đủ 10 bông hoa sẽ hiển thị màn hình chúc mừng và chuyển tiếp qua `onComplete()`.

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/CatchFlowersScreen.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `CatchFlowersScreen.tsx`**
- Khu vực chơi game full màn hình cảm ứng với CSS `touch-action: none`.
- Giỏ hoa xinh xắn (🧺 hoặc 💐) bám theo vị trí chạm tay/chuột của người chơi ở đáy màn hình.
- Vòng lặp `requestAnimationFrame`: hoa hồng (🌹), hoa đào (🌸), trái tim (💖) rơi ngẫu nhiên từ trên xuống với tốc độ vừa phải.
- Xử lý va chạm (AABB Collision Detection giữa giỏ hoa và bông hoa).
- Khi hứng trúng: phát âm thanh pop, số điểm tăng lên, hiện icon bay lên `+1`.
- Đạt 10/10 hoa: Nổ confetti ăn mừng, mở khóa chặng cuối cùng.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/CatchFlowersScreen.test.tsx`
Kết quả: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/CatchFlowersScreen.tsx src/components/CatchFlowersScreen.test.tsx
git commit -m "feat: implement CatchFlowersScreen mini-game with touch drag and skip option"
```

---

### Task 8: Màn 4 - Mở Hộp Quà, Thư Tình 20/10, Album Ảnh & Love Coupons

**Files:**
- Create: `src/components/GiftLetterScreen.tsx`
- Create: `src/components/GiftLetterScreen.test.tsx`

**Interfaces:**
- Consumes: `useConfig`, `soundManager`, `triggerConfetti`
- Produces: `<GiftLetterScreen onRestart={() => void} />`

- [ ] **Step 1: Viết test cho GiftLetterScreen**
Viết `src/components/GiftLetterScreen.test.tsx`:
- Ban đầu hiển thị hộp quà đóng kín với nút "Chạm để mở quà".
- Khi click mở hộp quà: kích hoạt pháo hoa, chuyển sang trạng thái quà đã mở.
- Hiển thị nội dung bức thư tình cảm từ `useConfig()`.
- Hiển thị danh sách ảnh kỷ niệm trong album.
- Hiển thị các thẻ Love Coupons với nút "Dùng voucher".

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/GiftLetterScreen.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `GiftLetterScreen.tsx`**
- **Hộp quà bí ẩn:** Hiệu ứng lắc lư mời gọi, nơ vàng ruy băng sang trọng. Khi click: nắp hộp bay lên, pháo hoa `canvas-confetti` rực rỡ bắn liên tục 4 giây kèm âm thanh mở quà.
- **Bức thư chúc mừng 20/10:** Khung thư trang nhã với hoa văn góc, từng đoạn văn chân thành gửi tới người phụ nữ quan trọng nhất.
- **Album ảnh Polaroid:** Khung ảnh trắng phong cách Polaroid có độ nghiêng nghệ thuật, nút lướt qua lại giữa các ảnh kèm caption ngọt ngào.
- **Phiếu đặc quyền (Love Coupons):** Thẻ quà tặng viền đứt đoạn như vé xem phim, khi người yêu chạm vào nút "Dùng phiếu này" thì đóng dấu đỏ "ĐÃ KÍCH HOẠT ❤️" kèm lời nhắn "Anh luôn sẵn sàng phục vụ em yêu!".
- Nút "Xem lại từ đầu 🔄" để nàng có thể trải nghiệm lại bất kỳ lúc nào.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/GiftLetterScreen.test.tsx`
Kết quả: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/GiftLetterScreen.tsx src/components/GiftLetterScreen.test.tsx
git commit -m "feat: implement GiftLetterScreen with gift box opening, letter, photos and coupons"
```

---

### Task 9: Secret Admin Modal (Trình Quản Trị Bí Mật)

**Files:**
- Create: `src/components/AdminModal.tsx`
- Create: `src/components/AdminModal.test.tsx`

**Interfaces:**
- Consumes: `useConfig`, `compressImage`
- Produces: `<AdminModal isOpen={boolean} onClose={() => void} />`

- [ ] **Step 1: Viết test cho AdminModal**
Viết `src/components/AdminModal.test.tsx`:
- Mở modal khi `isOpen=true`.
- Có các tab điều hướng: "Thông tin chung", "Câu hỏi", "Ảnh kỷ niệm", "Thư & Voucher", "Nhạc nền".
- Chỉnh sửa tên người nhận và bấm "Lưu thay đổi" gọi `updateConfig`.
- Có nút "Khôi phục mặc định" và "Xuất / Nhập JSON".

- [ ] **Step 2: Chạy test để xác nhận test fail**
Chạy: `npm test src/components/AdminModal.test.tsx`
Kết quả: FAIL.

- [ ] **Step 3: Hiện thực `AdminModal.tsx`**
- Giao diện modal quản trị sạch sẽ, có mật khẩu hoặc nút đóng nhanh.
- Quản lý upload ảnh trực tiếp từ thiết bị, tự động nén qua `compressImage` và lưu dưới dạng Base64 data URL.
- Cho phép thêm/sửa/xóa các câu hỏi trắc nghiệm và đáp án.
- Cho phép chỉnh sửa từng đoạn văn của bức thư và các voucher tình yêu.
- Công cụ sao chép toàn bộ cấu hình JSON và nhập lại cấu hình từ file hoặc đoạn text.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Chạy: `npm test src/components/AdminModal.test.tsx`
Kết quả: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/AdminModal.tsx src/components/AdminModal.test.tsx
git commit -m "feat: implement AdminModal for in-browser personalization and photo upload"
```

---

### Task 10: App Orchestration, Tích hợp hoàn chỉnh & Build Production

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: Tất cả các component từ Task 1 đến Task 9
- Produces: Ứng dụng hoàn chỉnh, sẵn sàng triển khai và gửi tặng.

- [ ] **Step 1: Cập nhật App.tsx tích hợp toàn bộ các màn**
- State điều hướng: `currentStage`: `'welcome' | 'quiz' | 'catch_flowers' | 'gift_letter'`.
- Tích hợp `FloatingHearts`, `MusicPlayer`, `AdminModal`.
- Bắt sự kiện phím tắt `Ctrl + Shift + E` và sự kiện nhấn giữ logo 3 giây trên mobile để mở `AdminModal`.
- Chuyển màn hình với hiệu ứng mượt mà.

- [ ] **Step 2: Viết test tích hợp toàn diện luồng người dùng trong `src/App.test.tsx`**
- Test mô phỏng người dùng bắt đầu từ Màn 1 $\rightarrow$ trả lời trắc nghiệm ở Màn 2 $\rightarrow$ hái hoa ở Màn 3 $\rightarrow$ mở hộp quà ở Màn 4.
- Test kích hoạt Admin modal qua phím tắt.

- [ ] **Step 3: Chạy toàn bộ test suite**
Chạy: `npm test`
Kết quả mong đợi: Toàn bộ các test pass 100%.

- [ ] **Step 4: Kiểm tra build production và preview**
Chạy: `npm run build`
Kết quả mong đợi: `dist/` được tạo thành công, không có cảnh báo hoặc lỗi TypeScript.

- [ ] **Step 5: Viết README.md hướng dẫn sử dụng và deploy**
Tạo file `README.md` hướng dẫn chi tiết cách mở trang web, cách dùng Admin Modal để chỉnh sửa ảnh/lời chúc, và cách deploy lên Vercel/GitHub Pages chỉ với 1 click.

- [ ] **Step 6: Commit**
```bash
git add src/App.tsx src/App.test.tsx README.md
git commit -m "feat: complete app orchestration, end-to-end integration and documentation"
```
