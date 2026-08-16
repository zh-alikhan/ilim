'use client';

import { useEffect } from 'react';
import { useLocale } from '@/components/layout/LocaleProvider';

/**
 * Kazakh-only Google Translate driver.
 *
 * English and Russian use the app's verified translations. Kazakh is produced
 * on the fly by Google Translate: the page renders its English base, and this
 * component drives a hidden Google widget to translate the visible DOM to `kk`.
 * The Google UI itself is never shown — the app's own EN/RU/KZ control is the
 * only language switcher the user sees.
 *
 * Requires a network connection (loads Google's script). If it can't load,
 * Kazakh gracefully falls back to the English base text.
 */

const GT_LANG = 'kk';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __ilimGTReady?: boolean;
  }
}

function getCombo(): HTMLSelectElement | null {
  return (
    (document.querySelector(
      '#google_translate_element select.goog-te-combo',
    ) as HTMLSelectElement | null) ||
    (document.querySelector('select.goog-te-combo') as HTMLSelectElement | null)
  );
}

function applyTranslate(lang: string, tries = 0) {
  const combo = getCombo();
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change'));
    return;
  }
  if (tries < 40) {
    window.setTimeout(() => applyTranslate(lang, tries + 1), 150);
  }
}

function clearTranslate() {
  const combo = getCombo();
  if (combo && combo.value && combo.value !== '') {
    combo.value = '';
    combo.dispatchEvent(new Event('change'));
  }
  // Also strip the ?_x_tr / #googtrans hash Google may add.
  if (document.cookie.includes('googtrans')) {
    document.cookie =
      'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function GoogleTranslate() {
  const { locale } = useLocale();

  // Load the Google Translate script once.
  useEffect(() => {
    if (window.__ilimGTReady || document.getElementById('ilim-gt-script')) {
      return;
    }
    window.googleTranslateElementInit = () => {
      try {
        // eslint-disable-next-line new-cap
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: GT_LANG,
            autoDisplay: false,
          },
          'google_translate_element',
        );
        window.__ilimGTReady = true;
      } catch {
        /* no-op: offline / blocked */
      }
    };
    const s = document.createElement('script');
    s.id = 'ilim-gt-script';
    s.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // React to locale changes.
  useEffect(() => {
    if (locale === 'kk') {
      applyTranslate(GT_LANG);
    } else {
      clearTranslate();
    }
  }, [locale]);

  // Google re-injects a top banner and an "Original text" hover bubble even
  // when hidden via CSS. Continuously strip them so no chrome ever flashes.
  useEffect(() => {
    const strip = () => {
      const selectors = [
        '.goog-te-banner-frame',
        'iframe.skiptranslate',
        '#goog-gt-tt',
        '.goog-tooltip',
        '.jfk-bubble.gtx-bubble',
        '.goog-te-balloon-frame',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      });
      // Google offsets <body> by 40px via inline style — undo it.
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    };
    strip();
    const observer = new MutationObserver(strip);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Hidden mount point for Google's widget (kept offscreen).
  return (
    <div
      id="google_translate_element"
      aria-hidden
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    />
  );
}
