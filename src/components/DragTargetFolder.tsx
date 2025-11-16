import React from 'react';
import { FolderIcon } from './FolderIcon';

interface DragTargetFolderProps {
  label: string;
  color: string;
  side: 'left' | 'right';
  isActive?: boolean;
  count?: number;
}

export function DragTargetFolder({ label, color, side, isActive = false, count = 0 }: DragTargetFolderProps) {
  return (
    <div 
      className={`flex flex-col items-center transition-all ${
        isActive ? 'scale-110' : 'scale-100'
      }`}
      style={{
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <FolderIcon 
        color={color} 
        size={isActive ? 100 : 85} 
        label={label}
        isActive={isActive}
        count={count}
      />
    </div>
  );
}
