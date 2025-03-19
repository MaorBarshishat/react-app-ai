import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    jsx?: boolean;
  }
} 