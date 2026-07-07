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
          'transition-all duration-fast ease-standard focus:ring-2 focus:ring-primary-soft-muted',
          errorMsg && 'border-destructive bg-destructive-soft text-destructive',
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
            'flex justify-center items-center h-[97%] w-10 absolute right-0 rounded-r-hard top-1/2 -translate-y-1/2 transition-colors duration-fast ease-standard',
            errorMsg
              ? 'border-destructive bg-destructive-soft-hover text-destructive'
              : 'bg-primary text-foreground hover:text-foreground',
          )}
        >
          {seePassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  );
}
