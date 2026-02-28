import { useState, useRef, useEffect } from 'react';

/**
 * Custom dropdown that looks like the GitLab button —
 * consistent rounded borders, hover:border effect, no native <select> weirdness.
 */
export default function CustomSelect({ label, value, onChange, options, placeholder, error }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find((o) => (typeof o === 'string' ? o : o.value) === value);
    const displayText = selected
        ? (typeof selected === 'string' ? selected : selected.label)
        : placeholder;

    return (
        <div ref={ref} className="relative">
            {label && <label className="text-xs text-[var(--text-muted)] mb-1 block">{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between bg-[var(--bg-input)] border ${error ? 'border-[var(--accent-red)]' : 'border-[var(--border-color)]'
                    } rounded-lg px-3 py-2.5 text-sm text-left cursor-pointer transition-all
                hover:border-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none
                ${open ? 'border-[var(--border-focus)]' : ''}
                ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
                <span className="truncate">{displayText}</span>
                <svg className={`w-4 h-4 text-[var(--text-muted)] shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl shadow-black/30 overflow-hidden max-h-48 overflow-y-auto">
                    {options.map((opt) => {
                        const optValue = typeof opt === 'string' ? opt : opt.value;
                        const optLabel = typeof opt === 'string' ? opt : opt.label;
                        const isSelected = optValue === value;

                        return (
                            <div
                                key={optValue}
                                onClick={() => { onChange(optValue); setOpen(false); }}
                                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected
                                        ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {optLabel}
                            </div>
                        );
                    })}
                </div>
            )}

            {error && <p className="text-[var(--accent-red)] text-xs mt-1">{error}</p>}
        </div>
    );
}
