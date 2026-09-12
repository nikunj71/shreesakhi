import React from 'react';
import { APP_CONFIG } from '@/constants';

/**
 * Normalizes an Instagram URL to ensure it has https protocol
 */
export function getInstagramUrl(rawUrl?: string): string {
  const url = rawUrl?.trim();
  if (!url) {
    return APP_CONFIG.DEFAULT_INSTAGRAM_PROFILE || 'https://www.instagram.com/shree.sakhi_boutique';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Redirects or launches the Instagram native mobile app with the given post/reel/profile URL.
 * 
 * - On Android: Uses the Android Intent scheme (`intent://...#Intent;package=com.instagram.android;scheme=https;end`)
 *   which instructs Android OS to open the Instagram app directly, and falls back to web if not installed.
 * - On iOS: For profiles, launches `instagram://user?username=...`. For posts/reels, Universal Links
 *   open the Instagram app automatically.
 * - On Desktop: Opens the Instagram URL cleanly in a new browser tab.
 */
export function openInstagram(rawUrl?: string, e?: React.MouseEvent): void {
  if (e) {
    e.stopPropagation();
  }

  const cleanUrl = getInstagramUrl(rawUrl);

  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

  if (isAndroid) {
    if (e) e.preventDefault();
    // Strip protocol for Android Intent syntax
    const urlWithoutProtocol = cleanUrl.replace(/^https?:\/\//i, '');
    const intentUrl = `intent://${urlWithoutProtocol}#Intent;package=com.instagram.android;scheme=https;end`;

    // Trigger intent directly to launch native Instagram app
    window.location.href = intentUrl;
    return;
  }

  if (isIOS) {
    // Check if it's a profile URL (e.g. instagram.com/shree.sakhi_boutique)
    const profileMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/);
    const isProfile = profileMatch && !['p', 'reel', 'stories', 'explore', 'direct'].includes(profileMatch[1].toLowerCase());

    if (isProfile) {
      if (e) e.preventDefault();
      const username = profileMatch[1];
      window.location.href = `instagram://user?username=${username}`;
      // Fallback to web if app did not open after brief delay
      setTimeout(() => {
        window.location.href = cleanUrl;
      }, 1500);
      return;
    }

    // For posts / reels on iOS:
    // If triggered from a non-anchor or button element, navigate to cleanUrl to invoke Universal Links
    if (!e || (e.currentTarget && (e.currentTarget as HTMLElement).tagName !== 'A')) {
      window.location.href = cleanUrl;
    }
    // If it's an <a> tag, letting the event proceed naturally triggers iOS Universal Link
    return;
  }

  // Desktop: open in a new tab to keep the boutique tab intact
  if (e) e.preventDefault();
  window.open(cleanUrl, '_blank', 'noopener,noreferrer');
}
