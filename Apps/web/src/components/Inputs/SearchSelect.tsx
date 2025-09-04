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
                    <span className="message-icon"><svg
                        width="18"
                        height="18"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 3.00049C13.4288 3.00049 10.9154 3.76293 8.77759 5.19138C6.63975 6.61984 4.97351 8.65016 3.98957 11.0256C3.00563 13.401 2.74819 16.0149 3.2498 18.5367C3.75141 21.0584 4.98953 23.3748 6.80762 25.1929C8.6257 27.011 10.9421 28.2491 13.4638 28.7507C15.9856 29.2523 18.5995 28.9949 20.9749 28.0109C23.3503 27.027 25.3807 25.3607 26.8091 23.2229C28.2376 21.0851 29 18.5716 29 16.0005C28.9964 12.5538 27.6256 9.2493 25.1884 6.81212C22.7512 4.37494 19.4467 3.00413 16 3.00049ZM16 27.0005C13.8244 27.0005 11.6977 26.3554 9.88873 25.1467C8.07979 23.938 6.66989 22.22 5.83733 20.21C5.00477 18.2 4.78693 15.9883 5.21137 13.8545C5.63581 11.7207 6.68345 9.76069 8.22183 8.22231C9.76021 6.68394 11.7202 5.63629 13.854 5.21185C15.9878 4.78741 18.1995 5.00525 20.2095 5.83781C22.2195 6.67038 23.9375 8.08027 25.1462 9.88922C26.3549 11.6982 27 13.8249 27 16.0005C26.9967 18.9169 25.8367 21.7128 23.7745 23.775C21.7123 25.8372 18.9164 26.9972 16 27.0005ZM15 17.0005V10.0005C15 9.73527 15.1054 9.48092 15.2929 9.29338C15.4804 9.10585 15.7348 9.00049 16 9.00049C16.2652 9.00049 16.5196 9.10585 16.7071 9.29338C16.8946 9.48092 17 9.73527 17 10.0005V17.0005C17 17.2657 16.8946 17.5201 16.7071 17.7076C16.5196 17.8951 16.2652 18.0005 16 18.0005C15.7348 18.0005 15.4804 17.8951 15.2929 17.7076C15.1054 17.5201 15 17.2657 15 17.0005ZM17.5 21.5005C17.5 21.7972 17.412 22.0872 17.2472 22.3338C17.0824 22.5805 16.8481 22.7728 16.574 22.8863C16.2999 22.9998 15.9983 23.0295 15.7074 22.9717C15.4164 22.9138 15.1491 22.7709 14.9393 22.5611C14.7296 22.3514 14.5867 22.0841 14.5288 21.7931C14.471 21.5022 14.5007 21.2006 14.6142 20.9265C14.7277 20.6524 14.92 20.4181 15.1667 20.2533C15.4133 20.0885 15.7033 20.0005 16 20.0005C16.3978 20.0005 16.7794 20.1585 17.0607 20.4398C17.342 20.7211 17.5 21.1027 17.5 21.5005Z"
                            fill="currentColor"
                        />
                    </svg></span>
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
}