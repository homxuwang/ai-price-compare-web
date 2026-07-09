// OpenPriceHub · 场景强调色映射 (签名) — 生图/生视频/LLM 各有身份

import type { ToolCategory } from '../../shared/types';

export const SCENE_TEXT: Record<ToolCategory, string> = {
  image: 'text-scene-image',
  video: 'text-scene-video',
  'llm-api': 'text-scene-llm',
};

export const SCENE_BG_SOFT: Record<ToolCategory, string> = {
  image: 'bg-primary-50',
  video: 'bg-accent-soft',
  'llm-api': 'bg-[#F3EEFF]',
};

export const SCENE_RING: Record<ToolCategory, string> = {
  image: 'ring-scene-image/25',
  video: 'ring-scene-video/25',
  'llm-api': 'ring-scene-llm/25',
};

export const SCENE_HEX: Record<ToolCategory, string> = {
  image: '#4F46E5',
  video: '#06B6D4',
  'llm-api': '#7C3AED',
};
