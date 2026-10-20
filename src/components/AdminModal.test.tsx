import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminModal } from './AdminModal';
import { ConfigProvider, useConfig } from '../context/ConfigContext';
import * as imageCompressionModule from '../utils/imageCompression';
import { soundManager } from '../utils/sound';
import { DEFAULT_CONFIG } from '../data/defaultConfig';

// Mock compressImage
vi.mock('../utils/imageCompression', () => ({
  compressImage: vi.fn(),
}));

describe('AdminModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default mock for compressImage
    vi.mocked(imageCompressionModule.compressImage).mockResolvedValue(
      'data:image/jpeg;base64,mockCompressedBase64'
    );
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const renderModal = (isOpen = true, onClose = onCloseMock) => {
    return render(
      <ConfigProvider>
        <AdminModal isOpen={isOpen} onClose={onClose} />
      </ConfigProvider>
    );
  };

  describe('Modal Visibility and Dismissal', () => {
    it('renders nothing when isOpen is false', () => {
      renderModal(false);
      expect(screen.queryByTestId('admin-modal')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Bảng Điều Khiển Bí Mật/i)
      ).not.toBeInTheDocument();
    });

    it('renders modal dialog and header when isOpen is true', () => {
      renderModal(true);
      expect(screen.getByTestId('admin-modal')).toBeInTheDocument();
      expect(
        screen.getByText(/Bảng Điều Khiển Bí Mật \(Admin 💌\)/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Đóng/i)).toBeInTheDocument();
    });

    it('calls onClose when clicking close button X', () => {
      renderModal(true);
      const closeBtn = screen.getByLabelText(/Đóng/i);
      fireEvent.click(closeBtn);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking Hủy button in footer without updating config', () => {
      renderModal(true);
      const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
      fireEvent.click(cancelBtn);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when pressing Escape key', () => {
      renderModal(true);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tab Navigation', () => {
    it('renders all 5 tab buttons', () => {
      renderModal(true);
      expect(
        screen.getByRole('tab', { name: /Thông tin chung/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Câu hỏi/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /(Album ảnh|Ảnh kỷ niệm)/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Thư & Voucher/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /Nhạc nền/i })
      ).toBeInTheDocument();
    });

    it('switches between tabs and shows correct content', () => {
      renderModal(true);

      // Default tab: Thông tin chung
      expect(screen.getByLabelText(/Tên người nhận/i)).toBeInTheDocument();

      // Switch to Câu hỏi kỷ niệm
      fireEvent.click(screen.getByRole('tab', { name: /Câu hỏi/i }));
      expect(screen.getByText(/Danh sách câu hỏi trắc nghiệm/i)).toBeInTheDocument();
      expect(screen.getByText(/Thêm câu hỏi mới/i)).toBeInTheDocument();

      // Switch to Album ảnh
      fireEvent.click(screen.getByRole('tab', { name: /(Album ảnh|Ảnh kỷ niệm)/i }));
      expect(screen.getByText(/Tải ảnh từ thiết bị/i)).toBeInTheDocument();
      expect(screen.getByTestId('photo-file-input')).toBeInTheDocument();

      // Switch to Thư & Voucher
      fireEvent.click(screen.getByRole('tab', { name: /Thư & Voucher/i }));
      expect(screen.getByLabelText(/Tiêu đề bức thư/i)).toBeInTheDocument();
      expect(screen.getByText(/Danh sách voucher tình yêu/i)).toBeInTheDocument();

      // Switch to Nhạc nền & Dữ liệu
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));
      expect(screen.getByLabelText(/Đường dẫn nhạc nền/i)).toBeInTheDocument();
      expect(screen.getByText(/Sao chép cấu hình \(Export JSON\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Khôi phục dữ liệu gốc/i)).toBeInTheDocument();
    });
  });

  describe('Tab 1: General Info & Save', () => {
    it('modifies general info inputs and saves to ConfigContext', async () => {
      // Wrapper to inspect config changes
      let currentConfig: any;
      function TestConsumer() {
        const { config } = useConfig();
        currentConfig = config;
        return <div data-testid="recipient-display">{config.recipientName}</div>;
      }

      render(
        <ConfigProvider>
          <TestConsumer />
          <AdminModal isOpen={true} onClose={onCloseMock} />
        </ConfigProvider>
      );

      const recipientInput = screen.getByLabelText(/Tên người nhận/i);
      expect(recipientInput).toHaveValue(DEFAULT_CONFIG.recipientName);

      fireEvent.change(recipientInput, {
        target: { value: 'Bé Yêu Tuyệt Nhất' },
      });

      const senderInput = screen.getByLabelText(/Tên người gửi/i);
      fireEvent.change(senderInput, {
        target: { value: 'Chàng Hoàng Tử Của Em' },
      });

      const flowersTargetInput = screen.getByLabelText(/Số hoa cần hứng/i);
      fireEvent.change(flowersTargetInput, {
        target: { value: '15' },
      });

      const saveBtn = screen.getByRole('button', { name: /Lưu thay đổi/i });
      fireEvent.click(saveBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('recipient-display')).toHaveTextContent(
        'Bé Yêu Tuyệt Nhất'
      );
      expect(currentConfig.senderName).toBe('Chàng Hoàng Tử Của Em');
      expect(currentConfig.catchFlowersTarget).toBe(15);
    });
  });

  describe('Tab 2: Quiz Management', () => {
    it('allows editing question, adding a new question, and deleting a question', () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Câu hỏi/i }));

      // Check default questions are rendered
      const questionInputs = screen.getAllByLabelText(/Nội dung câu hỏi/i);
      expect(questionInputs.length).toBe(DEFAULT_CONFIG.quizQuestions.length);

      // Edit first question
      fireEvent.change(questionInputs[0], {
        target: { value: 'Câu hỏi mới số 1 là gì?' },
      });
      expect(questionInputs[0]).toHaveValue('Câu hỏi mới số 1 là gì?');

      // Add new question
      const addQuestionBtn = screen.getByRole('button', {
        name: /Thêm câu hỏi mới/i,
      });
      fireEvent.click(addQuestionBtn);

      const updatedInputs = screen.getAllByLabelText(/Nội dung câu hỏi/i);
      expect(updatedInputs.length).toBe(
        DEFAULT_CONFIG.quizQuestions.length + 1
      );

      // Delete the first question
      const deleteButtons = screen.getAllByTestId('delete-quiz-btn');
      fireEvent.click(deleteButtons[0]);

      const afterDeleteInputs = screen.getAllByLabelText(/Nội dung câu hỏi/i);
      expect(afterDeleteInputs.length).toBe(DEFAULT_CONFIG.quizQuestions.length);
    });
  });

  describe('Tab 3: Photo Album & Upload via compressImage', () => {
    it('displays photos, allows deleting a photo and uploading a compressed photo', async () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /(Album ảnh|Ảnh kỷ niệm)/i }));

      // Check existing photos are rendered
      const photoItems = screen.getAllByTestId('admin-photo-item');
      expect(photoItems.length).toBe(DEFAULT_CONFIG.photos.length);

      // Delete first photo
      const deletePhotoBtns = screen.getAllByTestId('delete-photo-btn');
      fireEvent.click(deletePhotoBtns[0]);

      expect(screen.getAllByTestId('admin-photo-item').length).toBe(
        DEFAULT_CONFIG.photos.length - 1
      );

      // Upload new photo file
      const fileInput = screen.getByTestId('photo-file-input');
      const testFile = new File(['dummy-content'], 'ky-niem-dep.jpg', {
        type: 'image/jpeg',
      });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(imageCompressionModule.compressImage).toHaveBeenCalledWith(
          testFile
        );
      });

      // Newly added photo item appears in list
      await waitFor(() => {
        const currentPhotos = screen.getAllByTestId('admin-photo-item');
        expect(currentPhotos.length).toBe(DEFAULT_CONFIG.photos.length);
      });
    });
  });

  describe('Tab 4: Gift Letter & Coupons Management', () => {
    it('allows editing letter paragraphs and managing coupons', () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Thư & Voucher/i }));

      // Edit letter title
      const titleInput = screen.getByLabelText(/Tiêu đề bức thư/i);
      fireEvent.change(titleInput, {
        target: { value: 'Bức Thư Tình Trăm Năm' },
      });
      expect(titleInput).toHaveValue('Bức Thư Tình Trăm Năm');

      // Letter paragraphs: check existing
      const paragraphTextareas = screen.getAllByTestId('letter-paragraph-input');
      expect(paragraphTextareas.length).toBe(
        DEFAULT_CONFIG.giftLetter.paragraphs.length
      );

      // Add paragraph
      const addParagraphBtn = screen.getByRole('button', {
        name: /Thêm đoạn văn/i,
      });
      fireEvent.click(addParagraphBtn);
      expect(screen.getAllByTestId('letter-paragraph-input').length).toBe(
        DEFAULT_CONFIG.giftLetter.paragraphs.length + 1
      );

      // Delete paragraph
      const deleteParagraphBtns = screen.getAllByTestId(
        'delete-paragraph-btn'
      );
      fireEvent.click(deleteParagraphBtns[0]);
      expect(screen.getAllByTestId('letter-paragraph-input').length).toBe(
        DEFAULT_CONFIG.giftLetter.paragraphs.length
      );

      // Coupons: check existing
      const couponItems = screen.getAllByTestId('admin-coupon-item');
      expect(couponItems.length).toBe(DEFAULT_CONFIG.coupons.length);

      // Add coupon
      const addCouponBtn = screen.getByRole('button', {
        name: /Thêm voucher mới/i,
      });
      fireEvent.click(addCouponBtn);
      expect(screen.getAllByTestId('admin-coupon-item').length).toBe(
        DEFAULT_CONFIG.coupons.length + 1
      );

      // Delete coupon
      const deleteCouponBtns = screen.getAllByTestId('delete-coupon-btn');
      fireEvent.click(deleteCouponBtns[0]);
      expect(screen.getAllByTestId('admin-coupon-item').length).toBe(
        DEFAULT_CONFIG.coupons.length
      );
    });
  });

  describe('Tab 5: BGM & JSON Data Import/Export/Reset', () => {
    it('handles test playing BGM', () => {
      const toggleBgmSpy = vi
        .spyOn(soundManager, 'toggleBgm')
        .mockResolvedValue(undefined);

      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));

      const bgmInput = screen.getByLabelText(/Đường dẫn nhạc nền/i);
      expect(bgmInput).toHaveValue(DEFAULT_CONFIG.bgmUrl);

      const testPlayBtn = screen.getByRole('button', { name: /Nghe thử/i });
      fireEvent.click(testPlayBtn);

      expect(toggleBgmSpy).toHaveBeenCalledWith(DEFAULT_CONFIG.bgmUrl);
    });

    it('exports config to clipboard', async () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));

      const exportBtn = screen.getByRole('button', {
        name: /Sao chép cấu hình \(Export JSON\)/i,
      });
      fireEvent.click(exportBtn);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/Đã sao chép cấu hình vào bộ nhớ tạm/i)
      ).toBeInTheDocument();
    });

    it('imports config when valid JSON is entered and updates draft across tabs', async () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));

      const importTextarea = screen.getByTestId('import-json-textarea');
      const validCustomConfig = {
        recipientName: 'Công Chúa Của Anh',
        senderName: 'Hoàng Tử',
      };

      fireEvent.change(importTextarea, {
        target: { value: JSON.stringify(validCustomConfig) },
      });

      const importBtn = screen.getByRole('button', { name: /Áp dụng JSON/i });
      fireEvent.click(importBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Nhập cấu hình thành công/i)
        ).toBeInTheDocument();
      });

      // Switch back to General tab and verify recipientName immediately reflects imported data
      fireEvent.click(screen.getByRole('tab', { name: /Thông tin chung/i }));
      expect(screen.getByLabelText(/Tên người nhận/i)).toHaveValue(
        'Công Chúa Của Anh'
      );
      expect(screen.getByLabelText(/Tên người gửi/i)).toHaveValue('Hoàng Tử');
    });

    it('pauses BGM preview when closing modal', () => {
      vi.spyOn(soundManager, 'isPlayingBgm').mockReturnValue(true);
      const pauseBgmSpy = vi.spyOn(soundManager, 'pauseBgm').mockImplementation(() => {});

      renderModal(true);
      const closeBtn = screen.getByLabelText(/Đóng/i);
      fireEvent.click(closeBtn);

      expect(pauseBgmSpy).toHaveBeenCalled();
    });

    it('shows error message when importing invalid JSON', async () => {
      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));

      const importTextarea = screen.getByTestId('import-json-textarea');
      fireEvent.change(importTextarea, {
        target: { value: '{ invalid JSON content }' },
      });

      const importBtn = screen.getByRole('button', { name: /Áp dụng JSON/i });
      fireEvent.click(importBtn);

      expect(
        screen.getByText(/Định dạng JSON không hợp lệ/i)
      ).toBeInTheDocument();
    });

    it('resets config to default when clicking Khôi phục dữ liệu gốc', async () => {
      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderModal(true);
      fireEvent.click(screen.getByRole('tab', { name: /Nhạc nền/i }));

      const resetBtn = screen.getByRole('button', {
        name: /Khôi phục dữ liệu gốc/i,
      });
      fireEvent.click(resetBtn);

      expect(confirmSpy).toHaveBeenCalled();
      expect(
        screen.getByText(/Đã khôi phục dữ liệu gốc thành công/i)
      ).toBeInTheDocument();
    });
  });
});