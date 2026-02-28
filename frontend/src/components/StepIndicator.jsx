export default function StepIndicator({ currentStep }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= 1
                    ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}>
                1
            </span>
            <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                    <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${currentStep >= 2 ? 'bg-[var(--accent-blue)]' : 'bg-[var(--text-muted)]'
                            }`}
                    />
                ))}
            </div>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= 2
                    ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}>
                2
            </span>
        </div>
    );
}
