"use client";

import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type InputMode = InputHTMLAttributes<HTMLInputElement>["inputMode"];

interface ValidatedFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  inputMode?: InputMode;
  className?: string;
}

export function ValidatedField({
  label,
  value,
  onChange,
  min,
  max,
  inputMode = "decimal",
  className,
}: ValidatedFieldProps) {
  const num = parseFloat(value);
  const hasValue = value !== "" && !isNaN(num);
  const tooLow = hasValue && min !== undefined && num < min;
  const tooHigh = hasValue && max !== undefined && num > max;
  const isWarning = tooLow || tooHigh;

  const warningText =
    min !== undefined && max !== undefined
      ? `Expected range: ${min}–${max}`
      : tooLow && min !== undefined
        ? `Minimum: ${min}`
        : max !== undefined
          ? `Maximum: ${max}`
          : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          isWarning
            ? "border-amber-500 focus-visible:ring-amber-500"
            : undefined
        }
      />
      {isWarning && warningText && (
        <p className="text-xs text-amber-500">{warningText}</p>
      )}
    </div>
  );
}
