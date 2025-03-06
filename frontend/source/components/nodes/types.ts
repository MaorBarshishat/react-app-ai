import { ReactNode } from 'react';

export interface NodeData {
  id: string;
  type: string;
  label: string;
  color?: string;
  icon?: ReactNode;
  category?: string;
  description?: string;
  // Add any other properties that your nodes might need
} 