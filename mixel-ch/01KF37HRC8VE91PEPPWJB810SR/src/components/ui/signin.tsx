import { forwardRef, useCallback } from "react";
import type { ComponentProps, MouseEvent } from "react";
import { type VariantProps } from "class-variance-authority";
import { Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button.tsx";

export interface SignInButtonProps
  extends Omit<ComponentProps<"button">, "onClick">,
    VariantProps<typeof buttonVariants> {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  showIcon?: boolean;
  label?: string;
  requestEmail?: string;
  asChild?: boolean;
}

export const SignInButton = forwardRef<HTMLButtonElement, SignInButtonProps>(
  (
    {
      onClick,
      disabled,
      showIcon = true,
      label = "Request Access",
      requestEmail = "info@mixel.ch",
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        window.location.href = `mailto:${requestEmail}?subject=Portal%20access%20request`;
      },
      [onClick, requestEmail],
    );

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        variant={variant}
        size={size}
        className={className}
        asChild={asChild}
        aria-label="Request portal access by email"
        {...props}
      >
        {showIcon && <Mail className="size-4" />}
        {label}
      </Button>
    );
  },
);

SignInButton.displayName = "SignInButton";
