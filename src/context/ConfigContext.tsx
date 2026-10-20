import { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig, ConfigContextType } from '../types';
import { DEFAULT_CONFIG } from '../data/defaultConfig';

export const CONFIG_STORAGE_KEY = 'vietnam_woman_day_config_v1';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function loadInitialConfig(): AppConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!saved) {
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
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
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Failed to parse config from localStorage, falling back to DEFAULT_CONFIG:', error);
    return DEFAULT_CONFIG;
  }
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(loadInitialConfig);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updated: AppConfig = {
      ...config,
      ...newConfig,
      giftLetter: newConfig.giftLetter
        ? { ...config.giftLetter, ...newConfig.giftLetter }
        : config.giftLetter,
    };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
    setConfig(updated);
  };

  const resetConfig = () => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    } catch (error) {
      console.error('Failed to reset config in localStorage:', error);
    }
    setConfig(DEFAULT_CONFIG);
  };

  const exportConfig = (): string => {
    return JSON.stringify(config, null, 2);
  };

  const importConfig = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return false;
      }
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

      // Transactional storage sync: persist first
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));

      // Update state only after storage write succeeds
      setConfig(merged);
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        exportConfig,
        importConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
