import { AppConfig } from '../types';

// Crisp inline SVGs for default placeholder photos (works 100% offline)
const svgRose = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe4e6"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="20" fill="url(#bg)"/>
  <circle cx="200" cy="180" r="85" fill="#fda4af" opacity="0.6"/>
  <text x="200" y="210" font-size="90" text-anchor="middle" dominant-baseline="middle">🌹</text>
  <text x="200" y="320" font-family="sans-serif" font-weight="bold" font-size="20" fill="#881337" text-anchor="middle">Đóa hoa ngát hương tặng em</text>
</svg>
`)}`;

const svgSunset = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="sunset" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="20" fill="url(#sunset)"/>
  <circle cx="200" cy="190" r="70" fill="#fff" opacity="0.8"/>
  <text x="200" y="210" font-size="80" text-anchor="middle" dominant-baseline="middle">🌅</text>
  <text x="200" y="320" font-family="sans-serif" font-weight="bold" font-size="20" fill="#fff" text-anchor="middle">Hoàng hôn lãng mạn bên nhau</text>
</svg>
`)}`;

const svgHandInHand = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="hands" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fce7f3"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="20" fill="url(#hands)"/>
  <circle cx="200" cy="180" r="80" fill="#f472b6" opacity="0.4"/>
  <text x="200" y="200" font-size="85" text-anchor="middle" dominant-baseline="middle">🤝</text>
  <text x="200" y="320" font-family="sans-serif" font-weight="bold" font-size="20" fill="#831843" text-anchor="middle">Nắm tay nhau qua mọi giông bão</text>
</svg>
`)}`;

const svgSmile = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="smile" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fb7185"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="20" fill="url(#smile)"/>
  <circle cx="200" cy="180" r="80" fill="#fde68a" opacity="0.5"/>
  <text x="200" y="205" font-size="85" text-anchor="middle" dominant-baseline="middle">🥰</text>
  <text x="200" y="320" font-family="sans-serif" font-weight="bold" font-size="20" fill="#9f1239" text-anchor="middle">Nụ cười tỏa nắng của em</text>
</svg>
`)}`;

export const DEFAULT_CONFIG: AppConfig = {
  recipientName: 'Vợ yêu',
  senderName: 'Chồng yêu',
  greetingTitle: 'Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10',
  greetingSubtitle: 'Dành tặng người con gái tuyệt vời nhất của anh một ngày thật trọn vẹn và hạnh phúc 💖',
  quizQuestions: [
    {
      id: 'quiz-1',
      question: 'Ngày hai đứa mình chính thức bắt đầu câu chuyện tình yêu ngọt ngào là ngày nào ta?',
      options: [
        'Hôm qua mới yêu',
        'Ngày sinh Bác Hồ',
        'Không nhớ nữa (chuẩn bị ăn đòn nha)',
        'Ngày mai mới tính'
      ],
      correctAnswerIndex: 1,
      wrongMessage: 'Ơ kìa, quên ngày này là bị phạt 100 cái thơm má đó nha! Chọn lại mau mau! 😝'
    },
    {
      id: 'quiz-2',
      question: 'Mỗi khi đi hẹn hò hoặc dạo phố, món mà em mê tít thò lò nhất là gì nè?',
      options: [
        'Trà sữa trân châu full topping',
        'Bánh tráng nướng vỉa hè',
        'Tất cả các món anh dắt đi ăn',
        'Cơm chó cho thiên hạ xem'
      ],
      correctAnswerIndex: 2,
      wrongMessage: 'Sai gùi nha! Dù có thèm gì thì đáp án chuẩn nhất vẫn là thích đi ăn cùng anh nè! Thử lại đi bé ơi! 🍜'
    },
    {
      id: 'quiz-3',
      question: 'Trong mắt anh, khoảnh khắc nào em là cô gái đáng yêu và rạng ngời nhất?',
      options: [
        'Khi cười tít mắt vui vẻ',
        'Khi giận dỗi phụng phịu má bánh bao',
        'Khi vừa ngủ dậy ngơ ngác',
        'Mọi khoảnh khắc vì lúc nào em cũng là số 1!'
      ],
      correctAnswerIndex: 3,
      wrongMessage: 'Dù chọn câu nào thì em vẫn luôn đáng yêu, nhưng đáp án đúng là em đẹp trong mọi khoảnh khắc cơ! Thử lại nha! 🥰'
    }
  ],
  catchFlowersTarget: 10,
  giftLetter: {
    title: 'Gửi Người Con Gái Anh Yêu Thương Nhất',
    paragraphs: [
      'Nhân ngày Phụ nữ Việt Nam 20/10, anh muốn gửi đến em những lời chúc ngọt ngào, chân thành và đong đầy tình yêu thương nhất từ tận đáy lòng mình.',
      'Cảm ơn em đã xuất hiện trong cuộc đời anh, mang đến cho anh vô vàn nụ cười, niềm vui và những khoảnh khắc ấm áp vô giá. Có em ở bên, mỗi ngày trôi qua đều là một ngày ngập tràn ý nghĩa và bình yên.',
      'Chúc cô gái của anh luôn xinh đẹp rạng rỡ, tự tin, hạnh phúc và luôn giữ được nụ cười tỏa nắng trên môi. Mong em luôn được yêu thương, chiều chuộng không chỉ riêng ngày 20/10 mà trong suốt 365 ngày của năm.',
      'Dù chặng đường phía trước có ra sao, anh vẫn luôn ở đây, đồng hành, lắng nghe, che chở và yêu thương em bằng tất cả trái tim mình. Yêu em nhiều hơn những gì lời nói có thể diễn tả! ❤️'
    ],
    closing: 'Mãi yêu em, công chúa của anh 💌'
  },
  coupons: [
    {
      id: 'coupon-1',
      title: 'Voucher massage vai gáy',
      description: 'Có giá trị bất kỳ lúc nào em mệt mỏi, được phục vụ tận tình không giới hạn thời gian.',
      icon: '💆‍♀️'
    },
    {
      id: 'coupon-2',
      title: 'Voucher nấu bữa tối món em mê',
      description: 'Anh sẽ vào bếp trổ tài nấu tất cả những món em thích, kèm theo rửa bát dọn dẹp sạch sẽ.',
      icon: '🍳'
    },
    {
      id: 'coupon-3',
      title: 'Voucher quyền miễn giận 24h',
      description: 'Áp dụng khi hai đứa giận hờn, anh sẽ vô điều kiện xin lỗi và làm em cười ngay lập tức.',
      icon: '🕊️'
    },
    {
      id: 'coupon-4',
      title: 'Voucher trà sữa full topping',
      description: 'Một ly trà sữa chuẩn vị em thích kèm 100% tình yêu và trân châu đường đen.',
      icon: '🧋'
    }
  ],
  photos: [
    {
      id: 'photo-1',
      url: svgRose,
      caption: 'Bó hoa tươi thắm dành riêng cho em 🌹',
      date: '20/10'
    },
    {
      id: 'photo-2',
      url: svgSunset,
      caption: 'Buổi chiều hoàng hôn bình yên bên nhau 🌅',
      date: 'Mùa thu'
    },
    {
      id: 'photo-3',
      url: svgHandInHand,
      caption: 'Nắm tay em đi qua mọi con phố 🤝',
      date: 'Kỷ niệm'
    },
    {
      id: 'photo-4',
      url: svgSmile,
      caption: 'Nụ cười tỏa nắng làm tim anh tan chảy 🥰',
      date: 'Mỗi ngày'
    }
  ],
  bgmUrl: '/audio/thegioicuaanh.mp3'
};
