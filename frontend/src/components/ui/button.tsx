import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          variant === 'ghost' && 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
          size === 'icon' && 'w-9 h-9 p-0',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
