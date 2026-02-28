export default function Navbar() {
    return (
        <>
            {/* Top bar */}
            <nav className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                {/* Left: Logo */}
                <span className="text-xl font-bold text-[var(--accent-blue)] tracking-tight">
                    Kuberns
                </span>

                {/* Center: Search */}
                <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2 w-80">
                    <span className="text-[var(--text-muted)] text-sm">Quick Search</span>
                    <svg className="w-4 h-4 text-[var(--text-muted)] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Right: Credits + Add New + Notification + Avatar */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-[#2665fe] font-semibold">●</span>
                        <span className="text-[#2665fe] font-bold">350</span>
                        <span className="text-[var(--text-muted)] text-xs">CREDITS LEFT</span>
                    </div>
                    <button className="bg-[#2665fe] hover:cursor-pointer text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1">
                        Add New
                    </button>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-[#2665fe] flex items-center justify-center text-sm font-bold cursor-pointer">
                        U
                    </div>
                </div>
            </nav>

            {/* Sub-nav */}
            <div className="flex items-center gap-6 px-6 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <span className="text-[var(--accent-blue)] text-sm font-medium flex items-center gap-1 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Projects
                </span>
                <span className="text-[var(--text-muted)] text-sm flex items-center gap-1 cursor-pointer hover:text-[var(--text-secondary)] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>
                    Datastore
                </span>
                <div className="ml-auto flex items-center gap-6 text-sm text-[var(--text-muted)]">
                    <span className="hover:text-[var(--text-secondary)] cursor-pointer transition-colors">Documentation</span>
                    <span className="hover:text-[var(--text-secondary)] cursor-pointer transition-colors">Support</span>
                </div>
            </div>
        </>
    );
}
