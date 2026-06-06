"use client";
import React from "react";
import { cn } from "../../lib/utils";

const AnimatedLoader = ({
  size = "md",
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      {/* Animated Loader */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={cn(
            "border-4 border-slate-600/20 rounded-full  animate-spin",
            sizeClasses[size]
          )}
        >
          <div
            className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin"
            style={{ animationDuration: "1s" }}
          />
        </div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Glowing effect */}
        <div
          className={cn(
            "absolute inset-0 border-4 border-blue-500/30 rounded-full animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDuration: "2s",
            filter: "blur(2px)",
          }}
        />
      </div>

      {/* Loading message */}
      {showMessage && message && (
        <div className="text-center space-y-1">
          <p className="text-white font-medium text-lg animate-pulse">
            {message}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Alternative loader designs for variety
export const SpinnerLoader = ({
  size = "md",
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "border-3 border-slate-600/20 border-t-blue-500 border-r-blue-400 rounded-full animate-spin",
            sizeClasses[size]
          )}
        />
      </div>

      {showMessage && message && (
        <p className="text-slate-300 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export const PulseLoader = ({
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>

      {showMessage && message && (
        <p className="text-white font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
};

// Simple clean loader like the reference image
export const SimpleLoader = ({
  size = "md",
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      {/* Simple spinning loader */}
      <div
        className={cn(
          "border-4 border-gray-600/20 border-t-white rounded-full animate-spin",
          sizeClasses[size]
        )}
      />

      {/* Loading message */}
      {showMessage && message && (
        <p className="text-white font-medium text-lg">{message}</p>
      )}
    </div>
  );
};

// Elegant white and gray fade loader
export const ElegantLoader = ({
  size = "md",
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4",
        className
      )}
    >
      {/* Elegant Animated Loader */}
      <div className="relative">
        {/* Outer rotating ring with white/gray gradient */}
        <div
          className={cn(
            "border-4 border-gray-600/20 rounded-full animate-spin",
            sizeClasses[size]
          )}
        >
          <div
            className="absolute inset-0 border-4 border-transparent border-t-white border-r-gray-300 rounded-full animate-spin"
            style={{ animationDuration: "1.2s" }}
          />
        </div>

        {/* Secondary ring with fade effect */}
        <div
          className={cn(
            "absolute inset-1 border-2 border-gray-400/40 rounded-full animate-spin",
            size === "xl" ? "inset-2" : "inset-1"
          )}
          style={{
            animationDuration: "2s",
            animationDirection: "reverse",
          }}
        >
          <div className="absolute inset-0 border-2 border-transparent border-l-white/60 border-b-gray-200/60 rounded-full" />
        </div>

        {/* Inner pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/30"
            style={{ animationDuration: "1.8s" }}
          />
        </div>

        {/* Outer glow effect */}
        <div
          className={cn(
            "absolute inset-0 border-2 border-white/20 rounded-full animate-pulse",
            sizeClasses[size]
          )}
          style={{
            animationDuration: "3s",
            filter: "blur(1px)",
            transform: "scale(1.1)",
          }}
        />
      </div>

      {/* Loading message */}
      {showMessage && message && (
        <div className="text-center space-y-2">
          <p className="text-white font-medium text-lg animate-pulse">
            {message}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Main loader component with multiple variations
export const ModernLoader = ({
  variant = "default",
  size = "md",
  message = "Loading...",
  showMessage = true,
  className,
}) => {
  switch (variant) {
    case "spinner":
      return (
        <SpinnerLoader
          size={size}
          message={message}
          showMessage={showMessage}
          className={className}
        />
      );
    case "pulse":
      return (
        <PulseLoader
          message={message}
          showMessage={showMessage}
          className={className}
        />
      );
    case "simple":
      return (
        <SimpleLoader
          size={size}
          message={message}
          showMessage={showMessage}
          className={className}
        />
      );
    case "elegant":
      return (
        <ElegantLoader
          size={size}
          message={message}
          showMessage={showMessage}
          className={className}
        />
      );
    default:
      return (
        <AnimatedLoader
          size={size}
          message={message}
          showMessage={showMessage}
          className={className}
        />
      );
  }
};

export default AnimatedLoader;