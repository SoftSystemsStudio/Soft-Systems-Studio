import React from 'react';

export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
