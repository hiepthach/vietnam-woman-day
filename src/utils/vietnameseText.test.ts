import { describe, it, expect } from 'vitest';
import { cleanVietnameseText } from './vietnameseText';

describe('cleanVietnameseText', () => {
  it('handles null, undefined or empty strings', () => {
    expect(cleanVietnameseText('')).toBe('');
    // @ts-expect-error testing invalid input
    expect(cleanVietnameseText(null)).toBe(null);
  });

  it('preserves already clean Vietnamese text without modifications', () => {
    const clean = 'Gửi Người Con Gái Anh Yêu Thương Nhất';
    expect(cleanVietnameseText(clean)).toBe(clean);
  });

  it('repairs words with detached acute accent and space (e.g. Nhất, muốn, đến, xuất)', () => {
    expect(cleanVietnameseText('Gửi Người Con Gái Anh Yêu Thương Nhấ´ t')).toBe('Gửi Người Con Gái Anh Yêu Thương Nhất');
    expect(cleanVietnameseText('Nhấ t')).toBe('Nhất');
    expect(cleanVietnameseText('nhấ t')).toBe('nhất');
    expect(cleanVietnameseText('anh muố´ n gửi đế´ n em')).toBe('anh muốn gửi đến em');
    expect(cleanVietnameseText('xuấ´ t hiện')).toBe('xuất hiện');
  });

  it('repairs words with detached grave accent and space (e.g. đong đầy, niềm, đều, nhiều, bằng)', () => {
    expect(cleanVietnameseText('đong đâ` y')).toBe('đong đầy');
    expect(cleanVietnameseText('niề` m vui')).toBe('niềm vui');
    expect(cleanVietnameseText('đề` u là')).toBe('đều là');
    expect(cleanVietnameseText('chiê` u chuộng')).toBe('chiều chuộng');
    expect(cleanVietnameseText('đồ` ng hành')).toBe('đồng hành');
    expect(cleanVietnameseText('bằ` ng tất cả')).toBe('bằng tất cả');
    expect(cleanVietnameseText('nhiề` u hơn')).toBe('nhiều hơn');
  });

  it('preserves "ở đây" while fixing "đong đầy"', () => {
    expect(cleanVietnameseText('anh vẫn luôn ở đây')).toBe('anh vẫn luôn ở đây');
    expect(cleanVietnameseText('đong đâ` y tình cảm')).toBe('đong đầy tình cảm');
  });

  it('repairs the entire corrupted letter from screenshot', () => {
    const corrupted = [
      'Nhân ngày Phụ nữ Việt Nam 20/10, anh muố´ n gửi đế´ n em những lời chúc ngọt ngào, chân thành và đong đâ` y tình yêu thương nhấ´ t từ tận đáy lòng mình.',
      'Cảm ơn em đã xuấ´ t hiện trong cuộc đời anh, mang đế´ n cho anh vô vàn nụ cười, niề` m vui và những khoảnh khắ´ c ấ´ m áp vô giá. Có em ở bên, mỗi ngày trôi qua đề` u là một ngày ngập tràn ý nghĩa và bình yên.',
      'Chúc cô gái của anh luôn xinh đẹp rạng rỡ, tự tin, hạnh phúc và luôn giữ được nụ cười tỏa nắ´ ng trên môi. Mong em luôn được yêu thương, chiê` u chuộng không chỉ riêng ngày 20/10 mà trong suố´ t 365 ngày của năm.',
      'Dù chặng đường phía trước có ra sao, anh vẫn luôn ở đây, đồ` ng hành, lắ´ ng nghe, che chở và yêu thương em bằ` ng tấ´ t cả trái tim mình. Yêu em nhiề` u hơn những gì lời nói có thể diễn tả! 💖'
    ];

    expect(cleanVietnameseText(corrupted[0])).toBe(
      'Nhân ngày Phụ nữ Việt Nam 20/10, anh muốn gửi đến em những lời chúc ngọt ngào, chân thành và đong đầy tình yêu thương nhất từ tận đáy lòng mình.'
    );
    expect(cleanVietnameseText(corrupted[1])).toBe(
      'Cảm ơn em đã xuất hiện trong cuộc đời anh, mang đến cho anh vô vàn nụ cười, niềm vui và những khoảnh khắc ấm áp vô giá. Có em ở bên, mỗi ngày trôi qua đều là một ngày ngập tràn ý nghĩa và bình yên.'
    );
    expect(cleanVietnameseText(corrupted[2])).toBe(
      'Chúc cô gái của anh luôn xinh đẹp rạng rỡ, tự tin, hạnh phúc và luôn giữ được nụ cười tỏa nắng trên môi. Mong em luôn được yêu thương, chiều chuộng không chỉ riêng ngày 20/10 mà trong suốt 365 ngày của năm.'
    );
    expect(cleanVietnameseText(corrupted[3])).toBe(
      'Dù chặng đường phía trước có ra sao, anh vẫn luôn ở đây, đồng hành, lắng nghe, che chở và yêu thương em bằng tất cả trái tim mình. Yêu em nhiều hơn những gì lời nói có thể diễn tả! 💖'
    );
  });
});

