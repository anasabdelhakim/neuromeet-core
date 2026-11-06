import { Check, Circle } from "lucide-react";
import { useWatch, type Control, type FieldError } from "react-hook-form";
import { cn } from "@/src/lib/utils";
import { passwordRules } from "@/src/validations/passwordRules";

const PASSWORD_COLORS = [
  "var(--destructive)",
  "var(--status-warning)",
  "var(--action-join)",
  "var(--status-success)",
];

interface PasswordStrengthUIProps {
  control: any;
  error?: FieldError;
}

export function PasswordStrengthUI({
  control,
  error,
}: PasswordStrengthUIProps) {
  const passwordValue = (useWatch({
    control: control as any,
    name: "password",
    defaultValue: "",
  }) || "") as string;

  const passwordStatus = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(passwordValue),
  }));

  const passwordStrength =
    (passwordStatus.filter((r) => r.passed).length / passwordRules.length) * 100;

  return (
    <>
      <div className="flex gap-2 items-center mt-2">
        <div className="w-11/12 flex gap-1">
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
                    Math.min(
                      Math.floor(passwordStrength / 25),
                      PASSWORD_COLORS.length - 1,
                    )
                  ]
                : "var(--muted-foreground)",
          }}
        >
          {passwordStrength <= 25 && passwordStrength > 0 && "Weak"}
          {passwordStrength > 25 && passwordStrength <= 50 && "Fair"}
          {passwordStrength > 50 && passwordStrength <= 75 && "Good"}
          {passwordStrength > 75 && "Strong"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {passwordStatus.map((rule, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors duration-fast ease-standard",
              rule.passed
                ? "text-status-success font-medium"
                : error
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {rule.passed ? (
              <Check className="size-3.5 shrink-0 stroke-[2.5]" />
            ) : (
              <Circle className="size-3.5 shrink-0 stroke-[1.5]" />
            )}
            <span>{rule.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
