"use client";

import { Plus } from "lucide-react";

export function AssignStudentButton({ groupId }: { groupId: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Using native pushState updates the URL and triggers useSearchParams 
    // instantly without causing a slow server-side navigation in Next.js
    window.history.pushState(null, '', `?assignGroupId=${groupId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center rounded-md bg-primary/10 text-primary px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-normal ease-standard shrink-0 shadow-soft"
      title="Assign Student"
    >
      <Plus className="w-3.5 h-3.5 mr-1.5 font-bold" />
      Assign
    </button>
  );
}
