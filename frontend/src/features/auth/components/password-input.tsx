import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';

interface PasswordInputProps {
  control: Control<any>;
  pending: boolean;
  registerProps: UseFormRegisterReturn;
  errorMsg?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function PasswordInput({
  control,
  pending,
  registerProps,
  errorMsg,
  onKeyDown,
  placeholder = 'Enter your password',
}: PasswordInputProps) {
  const [seePassword, setSeePassword] = useState(false);
  const passwordValue = useWatch({
    control,
    name: registerProps.name,
    defaultValue: '',
  });
  const isPasswordEmpty = passwordValue === '';

  return (
    <div className="relative">
      <Input
        id={registerProps.name}
        type={seePassword ? 'text' : 'password'}
        placeholder={placeholder}
        className={cn(
          'transition-all focus:ring-2 focus:ring-primary/20',
          errorMsg && 'border-destructive bg-destructive/10 text-destructive',
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
          className={cn(
            'flex justify-center items-center h-[95%] w-10 absolute right-0.25 rounded-r-md top-1/2 -translate-y-1/2 transition-colors',
            errorMsg
              ? 'border-destructive bg-red-200 text-destructive'
              : 'bg-white text-muted-foreground hover:text-foreground',
          )}
        >
          {seePassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  );
}
