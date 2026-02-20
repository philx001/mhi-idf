"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_PATH = "/mhi-logo.png";

type MhiLogoProps = {
  href?: string;
  className?: string;
  size?: "sidebar" | "home" | "small";
};

const sizeClasses = {
  sidebar: "h-8 w-auto max-w-[140px]",
  home: "h-16 w-auto max-w-[240px] sm:h-20 sm:max-w-[280px]",
  small: "h-6 w-auto max-w-[100px]",
};

export function MhiLogo({ href = "/dashboard", className, size = "sidebar" }: MhiLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const content = (
    <span className="flex items-center">
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_PATH}
          alt="MHI — Ministère des Hommes d'Impact"
          className={cn(sizeClasses[size], "object-contain object-left")}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className={cn("flex flex-col", size === "sidebar" && "leading-tight")}>
          <span
            className={cn(
              "font-bold text-[var(--mhi-primary)]",
              size === "home" && "text-2xl sm:text-3xl",
              size === "sidebar" && "text-lg",
              size === "small" && "text-base"
            )}
          >
            MHI
          </span>
          {size === "sidebar" && (
            <span className="text-[10px] font-medium text-sidebar-foreground mt-0.5">Île-de-France</span>
          )}
        </span>
      )}
    </span>
  );

  const wrapperClass = "flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded";
  if (href) {
    return (
      <Link href={href} className={cn(wrapperClass, className)}>
        {content}
      </Link>
    );
  }
  return <div className={cn(wrapperClass, className)}>{content}</div>;
}
