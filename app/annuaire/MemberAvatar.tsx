"use client";

import { useState } from "react";
import { UserCircle } from "lucide-react";

interface MemberAvatarProps {
  avatarUrl: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function MemberAvatar({
  avatarUrl,
  alt = "",
  className = "h-14 w-14 rounded-full object-cover border border-border",
  fallbackClassName = "h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-border",
}: MemberAvatarProps) {
  const [error, setError] = useState(false);

  if (avatarUrl && !error) {
    return (
      <img
        src={avatarUrl}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      <UserCircle className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}
