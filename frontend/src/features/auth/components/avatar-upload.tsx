"use client";

import * as React from "react";
import { Camera, User, ImagePlus } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface AvatarUploadProps {
  error?: string;
  disabled?: boolean;
  initialUrl?: string;
}

export function AvatarUploadControl({ error, disabled, initialUrl }: AvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(initialUrl ?? null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // Sync dragged/dropped file into the hidden file input so it's in native FormData
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const triggerFileDialog = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileDialog}
        className={cn(
          "group relative flex flex-col items-center justify-center cursor-pointer rounded-full p-1.5 transition-all duration-normal",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input
          type="file"
          name="avatar"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp"
        />

        {/* Drag Indicator Ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-dashed transition-all duration-normal",
          isDragging ? "border-primary scale-105 bg-primary-soft-subtle opacity-100" : "border-transparent scale-100 opacity-0",
          "group-hover:border-primary/30 group-hover:scale-105"
        )} />

        <Avatar className={cn(
          "h-32 w-32 border-4  shadow-hard ring-2 ring-offset-2 ring-offset-background transition-all duration-normal ease-out group-hover:shadow-brand-cyan-soft",
          error ? "ring-destructive" : isDragging ? "ring-primary" : "ring-border",
          "group-hover:ring-primary/50"
        )}>
          <AvatarImage src={preview || ""} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-muted to-custom-gray flex flex-col items-center justify-center text-muted-foreground">
            <User className="h-14 w-14 opacity-40" />
          </AvatarFallback>
        </Avatar>

        {/* Hover Overlay */}
        <div className="absolute inset-1.5 rounded-full bg-black/40 backdrop-blur-sm opacity-0 transition-all duration-normal flex items-center justify-center group-hover:opacity-100 scale-95 group-hover:scale-100">
           {!isDragging &&
             <ImagePlus className="h-8 w-8 text-white drop-shadow-md transform transition-transform duration-normal group-hover:-translate-y-1" />
           }
        </div>

        {/* Edit Badge */}
        {!isDragging && (
          <div className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple text-white shadow-hard ring-4 ring-background transition-transform duration-fast group-hover:scale-110 group-hover:rotate-12">
            <Camera className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="text-center space-y-1.5">
        <button
          type="button"
          onClick={triggerFileDialog}
          disabled={disabled}
          className="text-sm font-semibold bg-primary-soft-subtle text-primary hover:bg-primary-soft-muted px-4 py-1.5 rounded-full transition-colors focus:outline-none disabled:opacity-50"
        >
          {preview ? "Change Photo" : "Upload Photo"}
        </button>
        <p className="text-xs text-muted-foreground pt-1">
          Drag & drop or click to upload (max 5MB)
        </p>
        {error && <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{error}</p>}
      </div>
    </div>
  );
}
