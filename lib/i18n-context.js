'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { locales, defaultLocale } from './i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children, locale, messages }) {
  const [currentMessages, setCurrentMessages] = useState(messages);

  useEffect(() => {
    setCurrentMessages(messages);
  }, [messages]);

  const value = {
    locale,
    messages: currentMessages,
    t: (key, params = {}) => {
      const keys = key.split('.');
      let value = currentMessages;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key as fallback
        }
      }
      
      // Handle template strings with {{variable}}
      if (typeof value === 'string') {
        return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return params[varName] !== undefined ? params[varName] : match;
        });
      }
      
      return value || key;
    },
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
