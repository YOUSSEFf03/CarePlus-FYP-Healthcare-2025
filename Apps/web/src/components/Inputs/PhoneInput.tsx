import React, { useEffect, useMemo, useRef, useState } from "react";
import "./phoneInput.css"; // styles below

type Variant = "normal" | "error" | "disabled";

type CountryKey =
    | "Australia"
    | "France"
    | "Germany"
    | "Lebanon"
    | "Netherlands"
    | "Saudi Arabia"
    | "Singapore"
    | "Switzerland"
    | "United Arab Emirates"
    | "United States";

const MIN_LOCAL = 4;
const MAX_LOCAL = 14;

type Country = {
    key: CountryKey;
    name: string;
    dial: string;      // "+961"
    iso2: string;      // "lb", "us", ...
    flag: string;      // path to your SVG (adjust paths)
    nsnRegex: RegExp;
    mask: string;  // validation for national number (no country code)
    placeholder: string;
};

const RAW_COUNTRIES: Country[] = [
    { key: "Australia", name: "Australia", dial: "+61", iso2: "au", flag: "/flags/au.svg", nsnRegex: /^\d{9}$/, mask: "### ### ###", placeholder: "### ### ###" },
    { key: "Germany", name: "Germany", dial: "+49", iso2: "de", flag: "/flags/de.svg", nsnRegex: /^\d{11}$/, mask: "### #### ####", placeholder: "### #### ####" },
    { key: "France", name: "France", dial: "+33", iso2: "fr", flag: "/flags/fr.svg", nsnRegex: /^\d{9}$/, mask: "# ## ## ## ##", placeholder: "# ## ## ## ##" },
    { key: "Lebanon", name: "Lebanon", dial: "+961", iso2: "lb", flag: "/flags/lb.svg", nsnRegex: /^\d{8}$/, mask: "## ### ###", placeholder: "## ### ###" }, // e.g., "03 123 456"
    { key: "Netherlands", name: "Netherlands", dial: "+31", iso2: "nl", flag: "/flags/nl.svg", nsnRegex: /^\d{8}$/, mask: "#########", placeholder: "#########" },
    { key: "Saudi Arabia", name: "Saudi Arabia", dial: "+966", iso2: "sa", flag: "/flags/sa.svg", nsnRegex: /^\d{8}$/, mask: "#########", placeholder: "#########" },
    { key: "Singapore", name: "Singapore", dial: "+65", iso2: "sg", flag: "/flags/sg.svg", nsnRegex: /^\d{8}$/, mask: "########", placeholder: "########" },
    { key: "Switzerland", name: "Switzerland", dial: "+41", iso2: "ch", flag: "/flags/ch.svg", nsnRegex: /^\d{8}$/, mask: "# ### ## ##", placeholder: "# ### ## ##" },
    { key: "United Arab Emirates", name: "United Arab Emirates", dial: "+971", iso2: "ae", flag: "/flags/ae.svg", nsnRegex: /^\d{8}$/, mask: "## ### ####", placeholder: "## ### ####" },
    { key: "United States", name: "United States", dial: "+1", iso2: "us", flag: "/flags/us.svg", nsnRegex: /^\d{10}$/, mask: "(###) ###-####", placeholder: "(###) ###-####" },
] satisfies Country[];

const COUNTRY_MAX: Record<CountryKey, number> = {
    Australia: 9,               // e.g. 4xx xxx xxx (no trunk '0')
    France: 9,                  // 9 local digits
    Germany: 11,                // allow long NSNs
    Lebanon: 8,                 // e.g. 03 123 456
    Netherlands: 9,
    "Saudi Arabia": 9,
    Singapore: 8,
    Switzerland: 9,
    "United Arab Emirates": 9,
    "United States": 10         // both mobile & landline are 10 local digits
};

export const COUNTRIES: Country[] = [...RAW_COUNTRIES].sort((a, b) =>
    a.name.localeCompare(b.name)
);

function normalizeDigits(value: string) {
    return value.replace(/\D+/g, "");
}

function groupTailBy3(d: string) {
    const parts: string[] = [];
    for (let i = 0; i < d.length; i += 3) parts.push(d.slice(i, i + 3));
    return parts.join(" ");
}

function applyMaskFlexible(digits: string, mask: string) {
    if (!digits.length) return "";
    let out = "";
    let i = 0;
    let seenSlot = false; // have we encountered a '#' yet?

    for (const ch of mask) {
        if (ch === "#") {
            seenSlot = true;
            if (i < digits.length) out += digits[i++];
            else break;
        } else {
            // render punctuation:
            // - prefix (before first '#') should appear once user starts typing
            // - after we've filled at least one slot, always render punctuation
            if (!seenSlot || i > 0) out += ch;
        }
    }

    // extra digits beyond the mask: append grouped by 3
    if (i < digits.length) {
        const tail = digits.slice(i);
        out += (out ? " " : "") + groupTailBy3(tail);
    }
    return out;
}

function buildE164(dial: string, localDigits: string) {
    return `${dial}${localDigits}`;
}

/** Simple grouping helper: groups like [2,3,3] => "03 123 456" */
function group(d: string, pattern: number[]) {
    const parts: string[] = [];
    let i = 0, p = 0;
    while (i < d.length && p < pattern.length) {
        const sz = pattern[p++];
        parts.push(d.slice(i, i + sz));
        i += sz;
    }
    if (i < d.length) parts.push(d.slice(i));
    return parts.filter(Boolean).join(" ");
}

export interface PhoneInputProps {
    label?: string;
    value: string; // expects "+{code}{digits}" or "" (E.164)
    onChange: (value: string) => void; // emits E.164
    optional?: boolean;
    variant?: Variant;
    message?: string;
    defaultCountry?: CountryKey;
    disabled?: boolean;
}

export default function PhoneInput({
    label,
    value,
    onChange,
    optional,
    variant = "normal",
    message,
    defaultCountry = "Lebanon",
    disabled,
}: PhoneInputProps) {
    // derive selected country + local number from value (if present)
    const fallbackCountry = useMemo(
        () => COUNTRIES.find(c => c.key === defaultCountry) || COUNTRIES[0],
        [defaultCountry]
    );

    const parsed = useMemo(() => {
        if (!value.startsWith("+")) return { country: fallbackCountry, local: "" };
        const match = COUNTRIES
            .map(c => [c, value.startsWith(c.dial)] as const)
            .find(([, ok]) => ok);
        if (!match) return { country: fallbackCountry, local: "" };
        const [country] = match;
        const local = normalizeDigits(value.slice(country.dial.length));
        return { country, local };
    }, [value, fallbackCountry]);

    const [open, setOpen] = useState(false);
    const [country, setCountry] = useState<Country>(parsed.country);
    const [local, setLocal] = useState<string>(parsed.local);

    // keep internal state in sync if parent value changes externally
    useEffect(() => {
        setCountry(parsed.country);
        setLocal(parsed.local);
    }, [parsed.country.key, parsed.local]); // eslint-disable-line

    const isError = variant === "error";
    const isDisabled = variant === "disabled" || disabled;

    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (ev: MouseEvent) => {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(ev.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ---- live formatting (display) ----
    const formattedLocal = useMemo(() => applyMaskFlexible(local, country.mask), [local, country.mask]);

    function selectCountry(c: Country) {
        setCountry(c);
        setOpen(false);
        // emit with current local digits
        onChange(buildE164(c.dial, normalizeDigits(local)));
    }

    function onLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = normalizeDigits(e.target.value);
        const maxLen = COUNTRY_MAX[country.key] ?? MAX_LOCAL;
        const digits = raw.slice(0, maxLen);
        setLocal(digits);
        onChange(`${country.dial}${digits}`); // E.164 to parent/DB
    }

    const STRICT_COUNTRIES: Partial<Record<CountryKey, number>> = {
        "United States": 10, // keep US exactly 10
    };

    const strictLen = STRICT_COUNTRIES[country.key];
    const maxLen = COUNTRY_MAX[country.key] ?? MAX_LOCAL;

    const invalidLocal =
        local.length > 0 &&
        ((strictLen != null && local.length !== strictLen) || local.length > maxLen);

    const finalMessage =
        message ??
        (invalidLocal
            ? (strictLen
                ? `${country.name} numbers must be ${strictLen} digits.`
                : `Maximum ${maxLen} digits for ${country.name}.`)
            : undefined);

    return (
        <div className={`custom-input-container ${variant}`} ref={wrapperRef}>
            {label && (
                <label className="custom-input-label">
                    {label}
                    {optional && <span className="optional-text"> (optional)</span>}
                </label>
            )}

            <div className="custom-input-wrapper">
                {/* Country selector */}
                <button
                    type="button"
                    className="pi-select"
                    onClick={() => setOpen(o => !o)}
                    disabled={isDisabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <img className="pi-flag" src={country.flag} alt={`${country.name} flag`} />
                    <span className="pi-dial">{country.dial}</span>
                    <svg className="pi-caret" width="14" height="14" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>

                <div className="pi-divider" aria-hidden />

                {/* Local number */}
                <input
                    type="tel"
                    className="custom-input-field pi-input"
                    placeholder={country.mask}
                    value={formattedLocal}
                    onChange={onLocalChange}
                    disabled={isDisabled}
                    inputMode="numeric"
                    autoComplete="tel"
                />

                {/* Dropdown */}
                {open && (
                    <ul className="pi-menu" role="listbox">
                        {COUNTRIES.map(c => (
                            <li
                                key={c.key}
                                role="option"
                                aria-selected={country.key === c.key}
                                className={`pi-option ${country.key === c.key ? "active" : ""}`}
                                onClick={() => selectCountry(c)}
                            >
                                <img className="pi-flag" src={c.flag} alt="" />
                                <span className="pi-name">{c.name}</span>
                                <span className="pi-dial">{c.dial}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {finalMessage && (
                <div className={`custom-input-message ${isError || invalidLocal ? "error" : ""}`}>
                    <span className="message-icon">
                        <svg
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
                        </svg>
                    </span>
                    <span>{finalMessage}</span>
                </div>
            )}
        </div>
    );
}