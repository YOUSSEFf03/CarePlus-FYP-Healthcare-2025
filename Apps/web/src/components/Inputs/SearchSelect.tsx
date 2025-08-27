import React, { useEffect, useMemo, useRef, useState } from "react";
import "./searchSelect.css";

type Variant = "normal" | "error" | "disabled";
export type Option = { value: string; label: string };

interface SearchSelectProps {
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    optional?: boolean;
    message?: string;
    variant?: Variant;
    disabled?: boolean;
    creatable?: boolean;               // <-- NEW
    showOtherRow?: boolean;            // <-- NEW
}

export default function SearchSelect({
    label,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    options,
    value,
    onChange,
    optional,
    message,
    variant = "normal",
    disabled,
    creatable = true,
    showOtherRow = true,
}: SearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);

    const isDisabled = variant === "disabled" || disabled;
    const isError = variant === "error";

    const current = useMemo(
        () => options.find(o => o.value.toLowerCase() === value.toLowerCase()) || null,
        [options, value]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(o => o.label.toLowerCase().includes(q));
    }, [options, query]);

    // Does an option already exactly match the query?
    const exactExists = useMemo(() => {
        const q = query.trim().toLowerCase();
        return !!options.find(o => o.label.toLowerCase() === q);
    }, [options, query]);

    // outside click
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);
    useEffect(() => setHighlight(0), [open, query]);

    function choose(opt: Option) {
        onChange(opt.value);
        setOpen(false);
        setQuery("");
    }
    function createFromQuery() {
        const val = query.trim();
        if (!val) return;
        onChange(val);
        setOpen(false);
        setQuery("");
    }
    function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault(); setOpen(true); return;
        }
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(filtered.length - 1, h + 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)); }
        else if (e.key === "Enter") {
            e.preventDefault();
            if (creatable && query.trim() && !exactExists) { createFromQuery(); }
            else {
                const opt = filtered[highlight];
                if (opt) choose(opt);
            }
        } else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    }

    const hasValue = value.trim().length > 0;

    return (
        <div className={`custom-input-container ${variant}`} ref={ref}>
            {label && (
                <label className="custom-input-label">
                    {label}{optional && <span className="optional-text"> (optional)</span>}
                </label>
            )}

            <div className={`custom-input-wrapper ss-trigger ${open ? "open" : ""}`}>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className="ss-btn"
                    onClick={() => { setOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 0); }}
                    onKeyDown={onKeyDown}
                    disabled={isDisabled}
                >

                    <span className={`ss-value ${hasValue ? "" : "placeholder"}`}>
                        {hasValue ? (current?.label ?? value) : placeholder}
                    </span>
                    <svg className="ss-caret" width="16" height="16" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>

                {open && (
                    <div className="ss-menu" role="listbox" aria-label={label || "Select"}>
                        <div className="ss-search">
                            <svg width="16" height="16" viewBox="0 0 24 24" className="ss-search-icon">
                                <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <input
                                ref={searchRef}
                                autoFocus
                                className="ss-search-input"
                                placeholder={searchPlaceholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        <ul className="ss-options">
                            {filtered.length === 0 && !creatable && <li className="ss-empty">No results</li>}
                            {filtered.map((opt, i) => {
                                const selected = opt.value.toLowerCase() === value.toLowerCase();
                                return (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={selected}
                                        className={`ss-option ${i === highlight ? "active" : ""} ${selected ? "selected" : ""}`}
                                        onMouseEnter={() => setHighlight(i)}
                                        onClick={() => choose(opt)}
                                    >
                                        <span className="ss-option-label">{opt.label}</span>
                                        {selected && (
                                            <svg className="ss-check" width="16" height="16" viewBox="0 0 24 24">
                                                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </li>
                                );
                            })}

                            {/* Creatable footer */}
                            {creatable && (
                                <>
                                    {query.trim() && !exactExists && (
                                        <li className="ss-create" onClick={createFromQuery}>
                                            <span>Add “{query.trim()}”</span>
                                        </li>
                                    )}
                                    {showOtherRow && (
                                        <>
                                            <li className="ss-sep" aria-hidden="true"></li>
                                            <li
                                                className="ss-create"
                                                onClick={() => { setQuery(""); searchRef.current?.focus(); }}
                                                title="Type your specialization in the search box, then press Enter"
                                            >
                                                Other… (type your own)
                                            </li>
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {message && (
                <div className={`custom-input-message ${isError ? "error" : ""}`}>
                    <span className="message-icon">!</span>
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}