// OpenPriceHub · 工具字母标 (无图占位) — 带场景色调

import React from 'react';
import type { ToolCategory } from '../../shared/types';
import { SCENE_BG_SOFT, SCENE_TEXT } from '../lib/scene';

export function ToolLogo({
  text,
  category,
  size = 'md',
}: {
  text?: string;
  category: ToolCategory;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'h-12 w-12 text-lg' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <span
      className={`inline-flex flex-none items-center justify-center rounded-lg font-display font-bold ${dim} ${SCENE_BG_SOFT[category]} ${SCENE_TEXT[category]}`}
      aria-hidden
    >
      {text || '·'}
    </span>
  );
}
