"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface PasswordInputProps {
  control: Control<any>;
  pending: boolean;
  registerProps: UseFormRegisterReturn;
  errorMsg?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function PasswordInput({
  control,
  pending,
  registerProps,
  errorMsg,
  onKeyDown,
  placeholder = "Enter your password",
  className,
}: PasswordInputProps) {
  const [seePassword, setSeePassword] = useState(false);
  const passwordValue = useWatch({
    control,
    name: registerProps.name,
    defaultValue: "",
  });
  const isPasswordEmpty = passwordValue === "";

  return (
    <div className="relative">
      <Input
        id={registerProps.name}
        type={seePassword ? "text" : "password"}
        placeholder={placeholder}
        className={cn(
          "h-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 pr-10 focus:border-primary focus:ring-primary text-sm rounded-lg transition-all",
          errorMsg && "border-destructive bg-destructive/10 text-destructive",
          className
        )}
        disabled={pending}
        {...registerProps}
        aria-invalid={!!errorMsg}
        onKeyDown={onKeyDown}
        required
      />
      {!isPasswordEmpty && (
        <button
          type="button"
          onClick={() => setSeePassword((p) => !p)}
          onMouseDown={(e) => e.preventDefault()}
          className="flex justify-center items-center h-full w-10 absolute right-0 top-0 text-zinc-400 hover:text-white bg-transparent transition-colors cursor-pointer"
        >
          {seePassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  );
}
