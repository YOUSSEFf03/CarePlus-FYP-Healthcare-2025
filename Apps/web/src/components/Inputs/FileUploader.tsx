import React, { useEffect, useMemo, useRef, useState } from "react";
import "./fileUploader.css";

type Variant = "normal" | "error" | "disabled";

interface FileUploaderProps {
    label?: string;
    description?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    optional?: boolean;
    accept?: string;          // default: image/*, PDF
    maxSizeMB?: number;       // default: 10
    variant?: Variant;
    message?: string;
    disabled?: boolean;
}

export default function FileUploader({
    label,
    description,
    value,
    onChange,
    optional,
    accept = "image/*,application/pdf",
    maxSizeMB = 10,
    variant = "normal",
    message,
    disabled,
}: FileUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const isDisabled = variant === "disabled" || !!disabled;
    const isError = variant === "error" || !!localError;

    const maxBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);
    const inputRef = useRef<HTMLInputElement>(null);

    function pick() {
        if (isDisabled) return;
        inputRef.current?.click();
    }

    function validateFile(file: File): string | null {
        const okType = file.type.startsWith("image/") || file.type === "application/pdf";
        if (!okType) return "Only images or PDF files are allowed.";
        if (file.size > maxBytes) return `Max size is ${maxSizeMB} MB.`;
        return null;
    }

    function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        const file = files[0];
        const err = validateFile(file);
        if (err) {
            setLocalError(err);
            onChange(null);
        } else {
            setLocalError(null);
            onChange(file);
        }
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        if (isDisabled) return;
        handleFiles(e.dataTransfer.files);
    }

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    useEffect(() => {
        if (value && value.type.startsWith("image/")) {
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [value]);

    return (
        <div className={`fu-container ${variant}`}>
            {label && (
                <label className="custom-input-label">
                    {label}
                    {optional && <span className="optional-text"> (optional)</span>}
                </label>
            )}

            {description && <p className="fu-desc">{description}</p>}

            <div
                className={`fu-dropzone ${dragOver ? "drag" : ""} ${isError ? "error" : ""}`}
                onClick={pick}
                onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                role="button"
                aria-disabled={isDisabled}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFiles(e.target.files)}
                    hidden
                    disabled={isDisabled}
                />

                {!value && (
                    <div className="fu-empty">
                        <div className="fu-icon" aria-hidden>
                            <svg width="38" height="38" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="fu-text">
                            <strong>Click to upload</strong> or drag & drop
                            <div className="fu-sub">Images or PDF • up to {maxSizeMB}MB</div>
                        </div>
                    </div>
                )}

                {value && (
                    <div className="fu-file">
                        {previewUrl ? (
                            <img src={previewUrl} alt="preview" className="fu-preview" />
                        ) : (
                            <div className="fu-pdf">
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M6 2h8l4 4v16H6z" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span>PDF document</span>
                            </div>
                        )}
                        <div className="fu-meta">
                            <div className="fu-name" title={value.name}>{value.name}</div>
                            <div className="fu-size">{(value.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <div className="fu-actions">
                            <button type="button" className="fu-btn" onClick={pick}>Replace</button>
                            <button type="button" className="fu-btn danger" onClick={(e) => { e.stopPropagation(); onChange(null); }}>
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {(localError || message) && (
                <div className={`custom-input-message ${isError ? "error" : ""}`}>
                    <span className="message-icon">!</span>
                    <span>{localError || message}</span>
                </div>
            )}
        </div>
    );
}