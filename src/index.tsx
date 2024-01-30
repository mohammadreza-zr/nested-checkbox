'use client';

import React, { ReactNode } from 'react';

import './styles.css';

interface NestedCheckboxProps {
  children: ReactNode;
}

export const NestedCheckbox: React.FC<NestedCheckboxProps> = ({ children }) => {
  return <>{children}</>;
};

// export * from './assets';
export * from './component';
