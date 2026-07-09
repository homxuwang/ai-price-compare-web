// OpenPriceHub · Sheet — 带角标定位记号的图纸面板
// 用作规格卡片/区块容器,四角绘制蓝图定位角标。

import React from 'react';

interface SheetProps {
  children: React.ReactNode;
  className?: string;
  /** 是否显示四角定位记号,默认显示 */
  corners?: boolean;
  as?: 'div' | 'section' | 'article';
}

function Sheet({ children, className = '', corners = true, as = 'div' }: SheetProps) {
  const Tag = as;
  return (
    <Tag className={`relative border border-line bg-panel ${className}`}>
      {corners && (
        <>
          <span className="corner corner-tl" aria-hidden />
          <span className="corner corner-tr" aria-hidden />
          <span className="corner corner-bl" aria-hidden />
          <span className="corner corner-br" aria-hidden />
        </>
      )}
      {children}
    </Tag>
  );
}

export default Sheet;
