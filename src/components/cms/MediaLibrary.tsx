"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: number;
}

interface MediaLibraryProps {
  show: boolean;
  onHide: () => void;
  onSelect?: (url: string) => void;
}

export default function MediaLibrary({
  show,
  onHide,
  onSelect,
}: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

  // This is a placeholder implementation
  // In a full implementation, you would:
  // 1. Fetch media items from Firestore
  // 2. Implement search/filter functionality
  // 3. Add upload functionality
  // 4. Add delete functionality

  const filteredItems = items.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onHide}
    >
      <div
        className={cn(
          "relative w-full max-w-3xl mx-4 rounded-xl border shadow-lg",
          "bg-card border-border text-foreground",
          "dark:bg-card-dark dark:border-border-dark",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border dark:border-border-dark px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Media Library
          </h2>
          <button
            onClick={onHide}
            className="text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
                "border-border bg-card text-foreground placeholder:text-foreground-secondary",
                "dark:border-border-dark dark:bg-card-dark",
                "focus:ring-2 focus:ring-primary-500",
              )}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <svg
                className="h-8 w-8 animate-spin text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-foreground-secondary py-10">
              <p>No media items found.</p>
              <p className="text-sm mt-1">
                Media library integration coming soon. For now, use the upload
                button in the post editor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect && onSelect(item.url)}
                  className={cn(
                    "cursor-pointer rounded-xl border shadow overflow-hidden transition-shadow hover:shadow-md",
                    "bg-card border-border",
                    "dark:bg-card-dark dark:border-border-dark",
                  )}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-[150px] w-full object-cover"
                  />
                  <div className="p-2">
                    <p className="text-sm truncate text-foreground">
                      {item.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border dark:border-border-dark px-6 py-4">
          <button
            onClick={onHide}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "bg-gray-200 text-foreground hover:bg-gray-300",
              "dark:bg-gray-700 dark:text-foreground dark:hover:bg-gray-600",
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
