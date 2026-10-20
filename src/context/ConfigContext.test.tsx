import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigProvider, useConfig } from './ConfigContext';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { AppConfig } from '../types';

const STORAGE_KEY = 'vietnam_woman_day_config_v1';

// Helper component for testing hook
function TestConsumer({
  onRender,
}: {
  onRender?: (contextVal: ReturnType<typeof useConfig>) => void;
}) {
  const context = useConfig();
  if (onRender) {
    onRender(context);
  }
  return (
    <div>
      <span data-testid="recipient-name">{context.config.recipientName}</span>
      <span data-testid="sender-name">{context.config.senderName}</span>
      <button
        data-testid="update-btn"
        onClick={() => context.updateConfig({ recipientName: 'Vợ Yêu 💖' })}
      >
        Update
      </button>
      <button data-testid="reset-btn" onClick={() => context.resetConfig()}>
        Reset
      </button>
      <button
        data-testid="import-valid-btn"
        onClick={() =>
          context.importConfig(
            JSON.stringify({
              ...DEFAULT_CONFIG,
              recipientName: 'Công Chúa Nhỏ',
            })
          )
        }
      >
        Import Valid
      </button>
      <button
        data-testid="import-invalid-btn"
        onClick={() => context.importConfig('invalid-json-string')}
      >
        Import Invalid
      </button>
    </div>
  );
}

describe('ConfigContext & useConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('provides default configuration when localStorage is empty', () => {
    render(
      <ConfigProvider>
        <TestConsumer />
      </ConfigProvider>
    );

    expect(screen.getByTestId('recipient-name').textContent).toBe(
      DEFAULT_CONFIG.recipientName
    );
    expect(screen.getByTestId('sender-name').textContent).toBe(
      DEFAULT_CONFIG.senderName
    );
  });

  it('loads configuration from localStorage when valid stored config exists', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_CONFIG,
      recipientName: 'Bé Miu Xinh Đẹp',
      senderName: 'Chàng Ngốc',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customConfig));

    render(
      <ConfigProvider>
        <TestConsumer />
      </ConfigProvider>
    );

    expect(screen.getByTestId('recipient-name').textContent).toBe(
      'Bé Miu Xinh Đẹp'
    );
    expect(screen.getByTestId('sender-name').textContent).toBe('Chàng Ngốc');
  });

  it('falls back safely to DEFAULT_CONFIG if localStorage data is corrupted or invalid', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, '{invalid_json_corrupted:');

    render(
      <ConfigProvider>
        <TestConsumer />
      </ConfigProvider>
    );

    expect(screen.getByTestId('recipient-name').textContent).toBe(
      DEFAULT_CONFIG.recipientName
    );
    consoleSpy.mockRestore();
  });

  it('updateConfig updates state and persists into localStorage', () => {
    render(
      <ConfigProvider>
        <TestConsumer />
      </ConfigProvider>
    );

    act(() => {
      screen.getByTestId('update-btn').click();
    });

    expect(screen.getByTestId('recipient-name').textContent).toBe('Vợ Yêu 💖');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.recipientName).toBe('Vợ Yêu 💖');
  });

  it('resetConfig restores DEFAULT_CONFIG in state and localStorage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_CONFIG,
        recipientName: 'Tùy Biến Trước Đó',
      })
    );

    render(
      <ConfigProvider>
        <TestConsumer />
      </ConfigProvider>
    );

    expect(screen.getByTestId('recipient-name').textContent).toBe(
      'Tùy Biến Trước Đó'
    );

    act(() => {
      screen.getByTestId('reset-btn').click();
    });

    expect(screen.getByTestId('recipient-name').textContent).toBe(
      DEFAULT_CONFIG.recipientName
    );

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.recipientName).toBe(DEFAULT_CONFIG.recipientName);
  });

  it('exportConfig returns serialized JSON matching current config', () => {
    let capturedContext: ReturnType<typeof useConfig> | null = null;

    render(
      <ConfigProvider>
        <TestConsumer onRender={(ctx) => (capturedContext = ctx)} />
      </ConfigProvider>
    );

    expect(capturedContext).not.null;
    const exported = capturedContext!.exportConfig();
    const parsed = JSON.parse(exported);
    expect(parsed.recipientName).toBe(DEFAULT_CONFIG.recipientName);
    expect(parsed.quizQuestions).toHaveLength(
      DEFAULT_CONFIG.quizQuestions.length
    );
  });

  it('importConfig successfully parses and saves valid JSON config', () => {
    let capturedContext: ReturnType<typeof useConfig> | null = null;

    render(
      <ConfigProvider>
        <TestConsumer onRender={(ctx) => (capturedContext = ctx)} />
      </ConfigProvider>
    );

    let success = false;
    act(() => {
      success = capturedContext!.importConfig(
        JSON.stringify({
          ...DEFAULT_CONFIG,
          recipientName: 'Nàng Thơ',
        })
      );
    });

    expect(success).toBe(true);
    expect(screen.getByTestId('recipient-name').textContent).toBe('Nàng Thơ');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.recipientName).toBe('Nàng Thơ');
  });

  it('importConfig safely returns false on invalid JSON without crashing', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let capturedContext: ReturnType<typeof useConfig> | null = null;

    render(
      <ConfigProvider>
        <TestConsumer onRender={(ctx) => (capturedContext = ctx)} />
      </ConfigProvider>
    );

    let success = true;
    act(() => {
      success = capturedContext!.importConfig('invalid JSON string {{{');
    });

    expect(success).toBe(false);
    expect(screen.getByTestId('recipient-name').textContent).toBe(
      DEFAULT_CONFIG.recipientName
    );
    consoleSpy.mockRestore();
  });

  it('aborts state update and returns false if localStorage.setItem fails during importConfig', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    let capturedContext: ReturnType<typeof useConfig> | null = null;
    render(
      <ConfigProvider>
        <TestConsumer onRender={(ctx) => (capturedContext = ctx)} />
      </ConfigProvider>
    );

    let success = true;
    act(() => {
      success = capturedContext!.importConfig(
        JSON.stringify({
          ...DEFAULT_CONFIG,
          recipientName: 'Tên Không Thể Lưu',
        })
      );
    });

    expect(success).toBe(false);
    expect(screen.getByTestId('recipient-name').textContent).toBe(
      DEFAULT_CONFIG.recipientName
    );

    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('falls back to default arrays if imported config has non-array quizQuestions, photos, or coupons', () => {
    let capturedContext: ReturnType<typeof useConfig> | null = null;
    render(
      <ConfigProvider>
        <TestConsumer onRender={(ctx) => (capturedContext = ctx)} />
      </ConfigProvider>
    );

    let success = false;
    act(() => {
      success = capturedContext!.importConfig(
        JSON.stringify({
          ...DEFAULT_CONFIG,
          recipientName: 'Công Chúa',
          quizQuestions: 'not-an-array',
          photos: null,
          coupons: 12345,
        })
      );
    });

    expect(success).toBe(true);
    expect(capturedContext!.config.quizQuestions).toEqual(
      DEFAULT_CONFIG.quizQuestions
    );
    expect(capturedContext!.config.photos).toEqual(DEFAULT_CONFIG.photos);
    expect(capturedContext!.config.coupons).toEqual(DEFAULT_CONFIG.coupons);
  });

  it('throws an error when useConfig is used outside of ConfigProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useConfig must be used within a ConfigProvider');

    consoleSpy.mockRestore();
  });
});
