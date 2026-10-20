import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  Music,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Play,
  Pause,
  Upload,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { compressImage } from '../utils/imageCompression';
import { soundManager } from '../utils/sound';
import { cleanVietnameseText } from '../utils/vietnameseText';
import { AppConfig, QuizQuestion, LoveCoupon, PhotoItem } from '../types';
import { DEFAULT_CONFIG } from '../data/defaultConfig';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'quiz' | 'photos' | 'letter-coupons' | 'bgm-data';

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } =
    useConfig();

  const [localDraft, setLocalDraft] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [fixFeedback, setFixFeedback] = useState<string | null>(null);
  const [isPlayingTestBgm, setIsPlayingTestBgm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft state with context config whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalDraft(config);
      setCopyFeedback(false);
      setImportFeedback(null);
      setResetFeedback(null);
      setImportJsonInput('');
      setIsPlayingTestBgm(soundManager.isPlayingBgm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Clean up BGM preview if modal unmounts
  useEffect(() => {
    return () => {
      if (soundManager.isPlayingBgm()) {
        soundManager.pauseBgm();
      }
    };
  }, []);

  // Clean up BGM preview when modal closes
  useEffect(() => {
    if (!isOpen && soundManager.isPlayingBgm()) {
      soundManager.pauseBgm();
      setIsPlayingTestBgm(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (soundManager.isPlayingBgm()) {
      soundManager.pauseBgm();
      setIsPlayingTestBgm(false);
    }
    onClose();
  };

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // General tab updates
  const handleGeneralChange = (
    field: keyof Pick<
      AppConfig,
      | 'recipientName'
      | 'senderName'
      | 'greetingTitle'
      | 'greetingSubtitle'
      | 'catchFlowersTarget'
    >,
    value: string | number
  ) => {
    setLocalDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Quiz tab handlers
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `quiz-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      wrongMessage: '',
    };
    setLocalDraft((prev) => ({
      ...prev,
      quizQuestions: [...prev.quizQuestions, newQuestion],
    }));
  };

  const handleUpdateQuestion = <K extends keyof QuizQuestion>(
    index: number,
    field: K,
    value: QuizQuestion[K]
  ) => {
    setLocalDraft((prev) => {
      const updated = [...prev.quizQuestions];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, quizQuestions: updated };
    });
  };

  const handleUpdateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setLocalDraft((prev) => {
      const updatedQuestions = [...prev.quizQuestions];
      const targetQuestion = { ...updatedQuestions[questionIndex] };
      const updatedOptions = [...targetQuestion.options];
      updatedOptions[optionIndex] = value;
      targetQuestion.options = updatedOptions;
      updatedQuestions[questionIndex] = targetQuestion;
      return { ...prev, quizQuestions: updatedQuestions };
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setLocalDraft((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((_, i) => i !== index),
    }));
  };

  // Photos tab handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImage(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: compressed,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          date: new Date().toLocaleDateString('vi-VN'),
        });
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    if (newPhotos.length > 0) {
      setLocalDraft((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }

    // Reset input value so same files can be re-selected if desired
    e.target.value = '';
  };

  const handleUpdatePhoto = (
    index: number,
    field: 'caption' | 'date',
    value: string
  ) => {
    setLocalDraft((prev) => {
      const updated = [...prev.photos];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, photos: updated };
    });
  };

  const handleDeletePhoto = (index: number) => {
    setLocalDraft((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Letter & Coupons handlers
  const handleUpdateLetter = (field: 'title' | 'closing', value: string) => {
    setLocalDraft((prev) => ({
      ...prev,
      giftLetter: {
        ...prev.giftLetter,
        [field]: value,
      },
    }));
  };

  const handleUpdateParagraph = (index: number, value: string) => {
    setLocalDraft((prev) => {
      const updated = [...prev.giftLetter.paragraphs];
      updated[index] = value;
      return {
        ...prev,
        giftLetter: {
          ...prev.giftLetter,
          paragraphs: updated,
        },
      };
    });
  };

  const handleAddParagraph = () => {
    setLocalDraft((prev) => ({
      ...prev,
      giftLetter: {
        ...prev.giftLetter,
        paragraphs: [...prev.giftLetter.paragraphs, ''],
      },
    }));
  };

  const handleDeleteParagraph = (index: number) => {
    setLocalDraft((prev) => ({
      ...prev,
      giftLetter: {
        ...prev.giftLetter,
        paragraphs: prev.giftLetter.paragraphs.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddCoupon = () => {
    const newCoupon: LoveCoupon = {
      id: `coupon-${Date.now()}`,
      title: '',
      description: '',
      icon: '🎁',
    };
    setLocalDraft((prev) => ({
      ...prev,
      coupons: [...prev.coupons, newCoupon],
    }));
  };

  const handleUpdateCoupon = (
    index: number,
    field: keyof LoveCoupon,
    value: string
  ) => {
    setLocalDraft((prev) => {
      const updated = [...prev.coupons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, coupons: updated };
    });
  };

  const handleDeleteCoupon = (index: number) => {
    setLocalDraft((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index),
    }));
  };

  // BGM & Data handlers
  const handleToggleTestBgm = async () => {
    try {
      await soundManager.toggleBgm(localDraft.bgmUrl);
      setIsPlayingTestBgm(soundManager.isPlayingBgm());
    } catch (err) {
      console.error('Failed to toggle test bgm:', err);
    }
  };

  const handleExportJson = async () => {
    try {
      const jsonStr = exportConfig();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 3000);
    } catch (err) {
      console.error('Failed to copy json:', err);
    }
  };

  const handleImportJson = () => {
    try {
      if (!importJsonInput.trim()) {
        setImportFeedback({
          type: 'error',
          message: 'Vui lòng dán mã JSON cấu hình!',
        });
        return;
      }
      const parsed = JSON.parse(importJsonInput);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setImportFeedback({
          type: 'error',
          message: 'Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại.',
        });
        return;
      }

      const success = importConfig(importJsonInput);
      if (success) {
        const merged: AppConfig = {
          ...DEFAULT_CONFIG,
          ...parsed,
          quizQuestions: Array.isArray(parsed.quizQuestions)
            ? parsed.quizQuestions
            : DEFAULT_CONFIG.quizQuestions,
          photos: Array.isArray(parsed.photos)
            ? parsed.photos
            : DEFAULT_CONFIG.photos,
          coupons: Array.isArray(parsed.coupons)
            ? parsed.coupons
            : DEFAULT_CONFIG.coupons,
          giftLetter: {
            ...DEFAULT_CONFIG.giftLetter,
            ...(parsed.giftLetter && typeof parsed.giftLetter === 'object'
              ? parsed.giftLetter
              : {}),
          },
        };
        setLocalDraft(merged);
        setImportFeedback({
          type: 'success',
          message: 'Nhập cấu hình thành công!',
        });
        setImportJsonInput('');
      } else {
        setImportFeedback({
          type: 'error',
          message: 'Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại.',
        });
      }
    } catch {
      setImportFeedback({
        type: 'error',
        message: 'Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại.',
      });
    }
  };

  const handleResetToDefault = () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt gốc? Mọi thay đổi sẽ trở về mặc định.'
    );
    if (confirmed) {
      resetConfig();
      setLocalDraft(DEFAULT_CONFIG);
      setResetFeedback('Đã khôi phục dữ liệu gốc thành công!');
      setTimeout(() => setResetFeedback(null), 3000);
    }
  };

  const handleAutoFixLetterFormatting = () => {
    setLocalDraft((prev) => ({
      ...prev,
      recipientName: cleanVietnameseText(prev.recipientName),
      senderName: cleanVietnameseText(prev.senderName),
      greetingTitle: cleanVietnameseText(prev.greetingTitle),
      greetingSubtitle: cleanVietnameseText(prev.greetingSubtitle),
      giftLetter: {
        title: cleanVietnameseText(prev.giftLetter.title),
        paragraphs: prev.giftLetter.paragraphs.map(cleanVietnameseText),
        closing: cleanVietnameseText(prev.giftLetter.closing),
      },
    }));
    setFixFeedback('Đã tự động sửa các lỗi tách dấu tiếng Việt!');
    setTimeout(() => setFixFeedback(null), 3000);
  };

  const handleSaveAndClose = () => {
    if (soundManager.isPlayingBgm()) {
      soundManager.pauseBgm();
      setIsPlayingTestBgm(false);
    }
    const sanitizedDraft: AppConfig = {
      ...localDraft,
      recipientName: cleanVietnameseText(localDraft.recipientName),
      senderName: cleanVietnameseText(localDraft.senderName),
      greetingTitle: cleanVietnameseText(localDraft.greetingTitle),
      greetingSubtitle: cleanVietnameseText(localDraft.greetingSubtitle),
      giftLetter: {
        title: cleanVietnameseText(localDraft.giftLetter.title),
        paragraphs: localDraft.giftLetter.paragraphs.map(cleanVietnameseText),
        closing: cleanVietnameseText(localDraft.giftLetter.closing),
      },
    };
    updateConfig(sanitizedDraft);
    onClose();
  };

  return (
    <div
      data-testid="admin-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        data-testid="admin-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-rose-100 dark:border-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100 dark:border-slate-800 bg-rose-50/40 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="admin-modal-title"
                className="text-base sm:text-lg font-bold text-slate-800 dark:text-rose-100"
              >
                Bảng Điều Khiển Bí Mật (Admin 💌)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tùy chỉnh thông điệp, câu hỏi, ảnh và quà tặng
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          className="flex border-b border-rose-100 dark:border-slate-800 overflow-x-auto scrollbar-none bg-rose-50/20 dark:bg-slate-900/40 px-2 pt-2 gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Thông tin chung</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quiz'}
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-rose-500" />
            <span>Câu hỏi kỷ niệm</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'photos'}
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === 'photos'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <span>Album ảnh kỷ niệm</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'letter-coupons'}
            onClick={() => setActiveTab('letter-coupons')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === 'letter-coupons'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span>Thư & Voucher</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'bgm-data'}
            onClick={() => setActiveTab('bgm-data')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-t-xl transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === 'bgm-data'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold border-b-2 border-rose-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Music className="w-4 h-4 text-rose-500" />
            <span>Nhạc nền & Dữ liệu</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: THÔNG TIN CHUNG */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label
                  htmlFor="recipient-name"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tên người nhận (Em yêu / Vợ yêu / Tên bạn gái)
                </label>
                <input
                  id="recipient-name"
                  type="text"
                  value={localDraft.recipientName}
                  onChange={(e) =>
                    handleGeneralChange('recipientName', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Ví dụ: Em Yêu, Bé Na, ..."
                />
              </div>

              <div>
                <label
                  htmlFor="sender-name"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tên người gửi (Anh / Chồng yêu / Tên bạn trai)
                </label>
                <input
                  id="sender-name"
                  type="text"
                  value={localDraft.senderName}
                  onChange={(e) =>
                    handleGeneralChange('senderName', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="Ví dụ: Anh, Chồng Yêu, ..."
                />
              </div>

              <div>
                <label
                  htmlFor="greeting-title"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tiêu đề lời chúc
                </label>
                <input
                  id="greeting-title"
                  type="text"
                  value={localDraft.greetingTitle}
                  onChange={(e) =>
                    handleGeneralChange('greetingTitle', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="greeting-subtitle"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Phụ đề / Thông điệp chào mừng
                </label>
                <textarea
                  id="greeting-subtitle"
                  rows={3}
                  value={localDraft.greetingSubtitle}
                  onChange={(e) =>
                    handleGeneralChange('greetingSubtitle', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label
                  htmlFor="flowers-target"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Số hoa cần hứng (Minigame)
                </label>
                <input
                  id="flowers-target"
                  type="number"
                  min="1"
                  max="100"
                  value={localDraft.catchFlowersTarget}
                  onChange={(e) =>
                    handleGeneralChange(
                      'catchFlowersTarget',
                      parseInt(e.target.value, 10) || 1
                    )
                  }
                  className="w-32 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CÂU HỎI KỶ NIỆM */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Danh sách câu hỏi trắc nghiệm ({localDraft.quizQuestions.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Người chơi cần trả lời đúng để mở quà. Chọn nút tròn để đánh dấu đáp án đúng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[40px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm câu hỏi mới</span>
                </button>
              </div>

              <div className="space-y-5">
                {localDraft.quizQuestions.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-700 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-full">
                        Câu hỏi #{qIndex + 1}
                      </span>
                      <button
                        type="button"
                        data-testid="delete-quiz-btn"
                        onClick={() => handleDeleteQuestion(qIndex)}
                        aria-label="Xóa câu hỏi"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`quiz-q-${qIndex}`}
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Nội dung câu hỏi
                      </label>
                      <input
                        id={`quiz-q-${qIndex}`}
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          handleUpdateQuestion(qIndex, 'question', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        placeholder="Nhập câu hỏi kỷ niệm..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        4 lựa chọn (chọn nút tròn để đánh dấu đáp án đúng)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[0, 1, 2, 3].map((optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              q.correctAnswerIndex === optIndex
                                ? 'border-rose-400 bg-rose-50/70 dark:bg-rose-950/30'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-answer-${qIndex}`}
                              checked={q.correctAnswerIndex === optIndex}
                              onChange={() =>
                                handleUpdateQuestion(
                                  qIndex,
                                  'correctAnswerIndex',
                                  optIndex
                                )
                              }
                              className="w-4 h-4 text-rose-500 focus:ring-rose-400 cursor-pointer"
                              title="Chọn làm đáp án đúng"
                            />
                            <input
                              type="text"
                              value={q.options[optIndex] || ''}
                              onChange={(e) =>
                                handleUpdateOption(
                                  qIndex,
                                  optIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Lựa chọn ${optIndex + 1}`}
                              className="flex-1 bg-transparent text-sm focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`quiz-w-${qIndex}`}
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Lời nhắn khi trả lời sai
                      </label>
                      <input
                        id={`quiz-w-${qIndex}`}
                        type="text"
                        value={q.wrongMessage}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            qIndex,
                            'wrongMessage',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        placeholder="Ơ kìa, chọn sai rồi nè!..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ALBUM ẢNH KỶ NIỆM */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-rose-50/50 dark:bg-slate-800/40 rounded-2xl border border-rose-100 dark:border-slate-700">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    Tải ảnh từ thiết bị
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ảnh sẽ được tự động nén tối ưu (dưới 200KB) để lưu trữ nhanh và mượt mà.
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    data-testid="photo-file-input"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all min-h-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn ảnh từ thiết bị</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ảnh kỷ niệm hiện có ({localDraft.photos.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localDraft.photos.map((photo, pIndex) => (
                    <div
                      key={photo.id || pIndex}
                      data-testid="admin-photo-item"
                      className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 flex gap-3 items-center shadow-xs"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Photo preview'}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-rose-50 flex-shrink-0 border border-rose-100 dark:border-slate-700"
                      />
                      <div className="flex-1 space-y-2 min-w-0">
                        <input
                          type="text"
                          value={photo.caption}
                          placeholder="Chú thích ảnh..."
                          onChange={(e) =>
                            handleUpdatePhoto(pIndex, 'caption', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                        <input
                          type="text"
                          value={photo.date || ''}
                          placeholder="Ngày / mốc thời gian..."
                          onChange={(e) =>
                            handleUpdatePhoto(pIndex, 'date', e.target.value)
                          }
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                      <button
                        type="button"
                        data-testid="delete-photo-btn"
                        onClick={() => handleDeletePhoto(pIndex)}
                        aria-label="Xóa ảnh"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THƯ & VOUCHER */}
          {activeTab === 'letter-coupons' && (
            <div className="space-y-8 max-w-3xl">
              {/* Phần bức thư */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-rose-500" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Bức thư tình 20/10
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="letter-title"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Tiêu đề bức thư
                  </label>
                  <input
                    id="letter-title"
                    type="text"
                    value={localDraft.giftLetter.title}
                    onChange={(e) => handleUpdateLetter('title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Các đoạn văn trong bức thư
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFixLetterFormatting}
                        title="Tự động sửa lỗi gõ tách dấu/dấu rời do bàn phím Unikey/Telex"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors min-h-[36px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sửa lỗi dấu tiếng Việt ✨</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm đoạn văn</span>
                      </button>
                    </div>
                  </div>

                  {fixFeedback && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{fixFeedback}</span>
                    </div>
                  )}

                  {localDraft.giftLetter.paragraphs.map((p, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <textarea
                          data-testid="letter-paragraph-input"
                          rows={3}
                          value={p}
                          onChange={(e) =>
                            handleUpdateParagraph(pIdx, e.target.value)
                          }
                          placeholder={`Nội dung đoạn #${pIdx + 1}...`}
                          className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                      <button
                        type="button"
                        data-testid="delete-paragraph-btn"
                        onClick={() => handleDeleteParagraph(pIdx)}
                        aria-label="Xóa đoạn"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="letter-closing"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Chữ ký / Lời kết
                  </label>
                  <input
                    id="letter-closing"
                    type="text"
                    value={localDraft.giftLetter.closing}
                    onChange={(e) =>
                      handleUpdateLetter('closing', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <hr className="border-rose-100 dark:border-slate-800" />

              {/* Phần vouchers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Danh sách voucher tình yêu ({localDraft.coupons.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Những voucher đặc quyền nàng có thể đổi bất cứ lúc nào
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCoupon}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm voucher mới</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {localDraft.coupons.map((coupon, cIdx) => (
                    <div
                      key={coupon.id || cIdx}
                      data-testid="admin-coupon-item"
                      className="p-3.5 bg-rose-50/40 dark:bg-slate-800/40 rounded-2xl border border-rose-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                    >
                      <input
                        type="text"
                        value={coupon.icon}
                        onChange={(e) =>
                          handleUpdateCoupon(cIdx, 'icon', e.target.value)
                        }
                        className="w-12 h-10 text-center text-lg rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        title="Biểu tượng icon"
                      />
                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          value={coupon.title}
                          placeholder="Tiêu đề voucher..."
                          onChange={(e) =>
                            handleUpdateCoupon(cIdx, 'title', e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <input
                          type="text"
                          value={coupon.description}
                          placeholder="Mô tả voucher..."
                          onChange={(e) =>
                            handleUpdateCoupon(
                              cIdx,
                              'description',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                      <button
                        type="button"
                        data-testid="delete-coupon-btn"
                        onClick={() => handleDeleteCoupon(cIdx)}
                        aria-label="Xóa voucher"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NHẠC NỀN & DỮ LIỆU */}
          {activeTab === 'bgm-data' && (
            <div className="space-y-6 max-w-2xl">
              {/* Nhạc nền */}
              <div className="p-4 bg-rose-50/40 dark:bg-slate-800/40 rounded-2xl border border-rose-100 dark:border-slate-700 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Music className="w-4 h-4 text-rose-500" />
                  Cài đặt nhạc nền
                </h3>
                <div>
                  <label
                    htmlFor="bgm-url"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Đường dẫn nhạc nền (MP3 URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="bgm-url"
                      type="text"
                      value={localDraft.bgmUrl}
                      onChange={(e) =>
                        setLocalDraft((prev) => ({
                          ...prev,
                          bgmUrl: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      placeholder="https://example.com/audio.mp3"
                    />
                    <button
                      type="button"
                      onClick={handleToggleTestBgm}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all min-h-[40px] whitespace-nowrap"
                    >
                      {isPlayingTestBgm ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Dừng nghe thử</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Nghe thử</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sao chép & Nhập cấu hình JSON */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-rose-500" />
                  Sao chép & Nhập cấu hình (JSON)
                </h3>

                <div>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold rounded-xl transition-all min-h-[42px]"
                  >
                    {copyFeedback ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          Đã sao chép cấu hình vào bộ nhớ tạm!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép cấu hình (Export JSON)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <label
                    htmlFor="import-json"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nhập cấu hình từ JSON:
                  </label>
                  <textarea
                    id="import-json"
                    data-testid="import-json-textarea"
                    rows={4}
                    value={importJsonInput}
                    onChange={(e) => setImportJsonInput(e.target.value)}
                    placeholder="Dán mã JSON cấu hình vào đây..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-rose-200 dark:border-slate-700 bg-rose-50/20 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  {importFeedback && (
                    <div
                      className={`text-xs p-2 rounded-lg flex items-center gap-1.5 ${
                        importFeedback.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {importFeedback.type === 'success' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{importFeedback.message}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleImportJson}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-all min-h-[38px]"
                  >
                    Áp dụng JSON
                  </button>
                </div>
              </div>

              {/* Khôi phục gốc */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-300">
                    Cài đặt mặc định ban đầu
                  </h4>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Xóa tất cả tùy biến cá nhân và khôi phục nội dung ban đầu
                  </p>
                  {resetFeedback && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      {resetFeedback}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all min-h-[40px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Khôi phục dữ liệu gốc</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-rose-100 dark:border-slate-800 p-4 bg-rose-50/30 dark:bg-slate-800/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all min-h-[44px]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold shadow-md shadow-rose-200 dark:shadow-none transition-all min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
