"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImage } from "@/server/upload-actions";
import { Input } from "@/components/admin/admin-input";
import { X, Upload, Loader2, Link2, Plus } from "lucide-react";

export function ImageUploader({
  name,
  initialImages = [],
  folder = "products",
  multiple = true,
}: {
  name: string;
  initialImages?: string[];
  folder?: "products" | "categories";
  multiple?: boolean;
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showUrlField, setShowUrlField] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadImage(formData, folder);
        if (result.error) {
          setError(result.error);
        } else if (result.url) {
          setImages((prev) => (multiple ? [...prev, result.url!] : [result.url!]));
        }
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function addImageUrl() {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setError("That doesn't look like a valid URL");
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      setError("Link must start with http:// or https://");
      return;
    }
    setError(null);
    setImages((prev) => (multiple ? [...prev, trimmed] : [trimmed]));
    setUrlValue("");
    setShowUrlField(false);
  }

  const canAddMore = multiple || images.length === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
            {/* Plain <img>, not next/image: these URLs can come from a
                pasted link on any domain, and next/image only renders
                hosts listed in next.config.ts's remotePatterns - it would
                throw on anything else. A fixed 80px preview thumbnail
                doesn't need next/image's optimization anyway. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-full w-full object-cover" />
            <input type="hidden" name={name} value={img} />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((i) => i !== img))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-brand hover:text-brand">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-[10px]">Upload</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple={multiple}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}

        {canAddMore && !showUrlField && (
          <button
            type="button"
            onClick={() => {
              setShowUrlField(true);
              setError(null);
            }}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted hover:border-brand hover:text-brand"
          >
            <Link2 className="h-5 w-5" />
            <span className="text-[10px]">Add link</span>
          </button>
        )}
      </div>

      {canAddMore && showUrlField && (
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImageUrl();
              }
            }}
            placeholder="https://example.com/photo.jpg"
            autoFocus
            className="h-9 flex-1"
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-brand px-3 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlField(false);
              setUrlValue("");
              setError(null);
            }}
            className="h-9 shrink-0 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
