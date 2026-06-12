import { Check, Circle } from "lucide-react";
import { useWatch, type Control, type FieldError } from "react-hook-form";
import { cn } from "@/src/lib/utils";
import { passwordRules } from "@/src/validations/passwordRules";

const PASSWORD_COLORS = ["#FF4D4F", "#FAAD14", "#40A9FF", "#52C41A"];

interface PasswordStrengthUIProps {
  control: Control<any>;
  error?: FieldError;
}

export function PasswordStrengthUI({
  control,
  error,
}: PasswordStrengthUIProps) {
  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordStatus = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(passwordValue),
  }));

  const passwordStrength =
    (passwordStatus.filter((r) => r.passed).length / passwordRules.length) *
    100;

  return (
    <>
      {/* Strength Bar */}
      <div className="flex gap-2 items-center mt-2">
        <div className="w-[95%] flex gap-1">
          {[25, 50, 75, 100].map((limit, idx) => (
            <div
              key={limit}
              className="h-1.5 flex-1 rounded-full transition-all duration-normal ease-out"
              style={{
                backgroundColor:
                  passwordStrength >= limit
                    ? PASSWORD_COLORS[idx]
                    : "var(--muted)",
              }}
            />
          ))}
        </div>
        <span
          className="text-xs font-medium w-14 text-right transition-colors duration-normal"
          style={{
            color:
              passwordStrength > 0
                ? PASSWORD_COLORS[
                    Math.max(0, Math.ceil(passwordStrength / 25) - 1)
                  ]
                : "inherit",
          }}
        >
          {passwordStrength === 100
            ? "Strong"
            : passwordStrength >= 75
              ? "Good"
              : passwordStrength >= 50
                ? "Medium"
                : passwordStrength > 0
                  ? "Weak"
                  : ""}
        </span>
      </div>

      {/* Rules List */}
      <div className="pt-2 grid grid-cols-2 gap-y-2">
        {passwordStatus.map((rule) => (
          <p
            key={rule.message}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-normal",
              rule.passed
                ? "text-green-600 dark:text-green-500"
                : error
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {rule.passed ? (
              <Check
                size={14}
                className="animate-in zoom-in spin-in-12 duration-normal text-green-600 dark:text-green-500"
              />
            ) : (
              <Circle size={14} className="opacity-50" />
            )}
            {rule.message}
          </p>
        ))}
      </div>
    </>
  );
}
