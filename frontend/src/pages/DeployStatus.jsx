import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { deployWebApp, getDeployLogs } from '../api/webapps';

export default function DeployStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const webapp = location.state?.webapp;

    const [deployment, setDeployment] = useState(null);
    const [logs, setLogs] = useState([]);
    const [deploying, setDeploying] = useState(false);
    const [deployed, setDeployed] = useState(false);

    const triggerDeploy = useCallback(async () => {
        if (!webapp) return;
        setDeploying(true);
        try {
            const res = await deployWebApp(webapp.id, { triggered_by: 'web-ui' });
            setDeployment(res.data);
        } catch (err) {
            console.error('Deploy failed:', err);
        }
    }, [webapp]);

    // Poll logs while deploying
    useEffect(() => {
        if (!webapp || deployed) return;

        const interval = setInterval(async () => {
            try {
                const res = await getDeployLogs(webapp.id);
                const logData = res.data?.results || res.data;
                if (Array.isArray(logData)) {
                    setLogs(logData);
                    // Check if deployment is complete
                    const hasComplete = logData.some(
                        (l) => l.message.includes('complete') || l.message.includes('failed')
                    );
                    if (hasComplete) {
                        setDeployed(true);
                        setDeploying(false);
                    }
                }
            } catch {
                // No logs yet, keep polling
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [webapp, deployed]);

    if (!webapp) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                <p className="text-[var(--text-muted)]">No app data found.</p>
                <button onClick={() => navigate('/')} className="text-[var(--accent-blue)] mt-2 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const statusColor = deployed
        ? 'text-[var(--accent-green)]'
        : deploying
            ? 'text-[var(--accent-orange)]'
            : 'text-[var(--accent-blue)]';

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-bold mb-2">Deploy Status</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">
                Your app <span className="text-[var(--text-primary)] font-semibold">{webapp.name}</span> has been created.
            </p>

            {/* App Summary Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">App Name</p>
                        <p className="text-sm font-semibold">{webapp.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Region</p>
                        <p className="text-sm font-semibold">{webapp.region}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Framework</p>
                        <p className="text-sm font-semibold capitalize">{webapp.framework}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Plan</p>
                        <p className="text-sm font-semibold capitalize">{webapp.plan_type}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Repository</p>
                        <p className="text-sm font-semibold">{webapp.repo_name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Branch</p>
                        <p className="text-sm font-semibold">{webapp.branch}</p>
                    </div>
                </div>
            </div>

            {/* Deploy Button */}
            {!deployment && (
                <div className="flex justify-center mb-8">
                    <button
                        onClick={triggerDeploy}
                        className="bg-[var(--accent-green)] hover:bg-green-600 text-white font-semibold px-10 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:-translate-y-0.5 text-sm"
                    >
                        Deploy to AWS
                    </button>
                </div>
            )}

            {/* Status */}
            {deployment && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Deployment Progress</h2>
                        <span className={`text-sm font-bold uppercase ${statusColor} flex items-center gap-2`}>
                            {!deployed && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                            {deployed ? 'Active' : deploying ? 'Deploying...' : 'Pending'}
                        </span>
                    </div>

                    {/* Deployment Logs */}
                    <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
                        {logs.length === 0 && (
                            <p className="text-[var(--text-muted)]">Waiting for logs...</p>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3">
                                <span className="text-[var(--text-muted)] shrink-0">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={
                                    log.log_level === 'error' ? 'text-[var(--accent-red)]' :
                                        log.log_level === 'warning' ? 'text-[var(--accent-orange)]' :
                                            'text-[var(--accent-green)]'
                                }>
                                    [{log.log_level.toUpperCase()}]
                                </span>
                                <span className="text-[var(--text-secondary)]">{log.message}</span>
                            </div>
                        ))}
                        {!deployed && (
                            <div className="flex items-center gap-2 text-[var(--text-muted)] mt-2">
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Done */}
            {deployed && (
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white text-sm font-semibold px-8 py-3 rounded-lg transition-all"
                    >
                        Create Another App
                    </button>
                </div>
            )}
        </div>
    );
}
