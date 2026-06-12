"use client";

import * as React from "react";
import { useActionState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Phone, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { updateUserProfile, type ProfileSettingsState } from "@/features/auth";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/zod";
import { AvatarUploadControl } from "@/features/auth/components/avatar-upload";
import { CitySelectControl } from "@/features/auth/components/city-select";

// --- Main Component ---

export default function ProfileCompletionForm({ initialAvatarUrl }: { initialAvatarUrl?: string }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      city: "",
      phoneNumber: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [state, action, pending] = useActionState<ProfileSettingsState, FormData>(
    updateUserProfile,
    { success: false, errorMessage: {} },
  );

  // Track city value for the hidden input
  const cityValue = form.watch("city");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold tracking-tight text-foreground">
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Add a photo and your contact details so others can recognize you.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          
          {/* AVATAR UPLOAD */}
          <div className="flex flex-col items-center space-y-4">
            <AvatarUploadControl
              error={form.formState.errors.avatar?.message as string}
              disabled={pending}
              initialUrl={initialAvatarUrl}
            />
          </div>

          {/* Hidden input to sync city combobox value into native FormData */}
          <input type="hidden" name="city" value={cityValue} />

          <div className="space-y-4">
            {/* CITY FIELD */}
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Controller
                control={form.control}
                name="city"
                render={({ field }) => (
                  <CitySelectControl
                    value={field.value}
                    onChange={field.onChange}
                    disabled={pending}
                  />
                )}
              />
              <FieldError>
                {form.formState.errors.city?.message ||
                  state.errorMessage?.city?.[0]}
              </FieldError>
            </Field>

            {/* PHONE FIELD */}
            <Field>
              <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
              <div className="relative flex items-center group">
                {/* Fixed Prefix */}
                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3 border-r border-input bg-muted rounded-l-md z-10">
                  <span className="text-foreground font-medium text-sm">+02</span>
                </div>

                <Input
                  id="phoneNumber"
                 
                  type="tel"
                  placeholder="100 123 4567"
                  className="pl-14 h-11 text-lg"
                  disabled={pending}
                  {...form.register("phoneNumber")}
                />

                <div className="pointer-events-none absolute right-0 text-muted-foreground pr-3">
                  <Phone className="h-4 w-4 opacity-50" />
                </div>
              </div>
              <FieldError>
                {form.formState.errors.phoneNumber?.message ||
                  state.errorMessage?.phoneNumber?.[0]}
              </FieldError>
            </Field>
          </div>

          {/* SERVER ERROR */}
          {state.errorMessage?.server && (
            <p className="text-destructive text-sm">
              {state.errorMessage.server[0]}
            </p>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              className="w-full py-5 text-base font-bold shadow-sm"
              disabled={pending}
            >
              {pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save & Continue"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-auto py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              disabled={pending}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}