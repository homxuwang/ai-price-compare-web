// OpenPriceHub · DimDivider — 尺寸线分隔符
// 形如机械制图的尺寸标注线: 端点竖记号 + 横线 + 居中标签。

import React from 'react';

interface DimDividerProps {
  label?: string;
  className?: string;
}

function DimDivider({ label, className = '' }: DimDividerProps) {
  return (
    <div className={`dim-divider ${className}`} role="separator" aria-label={label}>
      <span className="tick" aria-hidden />
      <span className="rule" aria-hidden />
      {label && <span className="dim-label">{label}</span>}
      <span className="rule" aria-hidden />
      <span className="tick" aria-hidden />
    </div>
  );
}

export default DimDivider;
