import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import { createWebApp } from '../api/webapps';

export default function EnvSetup({ formData, setFormData }) {
    const navigate = useNavigate();
    const [portType, setPortType] = useState('random');
    const [customPort, setCustomPort] = useState('');
    const [envVars, setEnvVars] = useState([
        { key: 'API_URL', value: 'https://api.example.com', is_secret: false, editing: false },
        { key: 'DB_HOST', value: 'localhost:5432', is_secret: false, editing: false },
    ]);
    const [newVar, setNewVar] = useState({ key: '', value: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const randomPort = 8080;
    const activePort = portType === 'random' ? randomPort : (parseInt(customPort) || 3000);

    const addEnvVar = () => {
        if (!newVar.key.trim() || !newVar.value.trim()) return;
        setEnvVars([...envVars, { ...newVar, is_secret: false, editing: false }]);
        setNewVar({ key: '', value: '' });
    };

    const removeEnvVar = (index) => {
        setEnvVars(envVars.filter((_, i) => i !== index));
    };

    const toggleEdit = (index) => {
        setEnvVars(envVars.map((v, i) => i === index ? { ...v, editing: !v.editing } : v));
    };

    const updateEnvVar = (index, field, value) => {
        setEnvVars(envVars.map((v, i) => i === index ? { ...v, [field]: value } : v));
    };

    const handleFinish = async () => {
        setSubmitting(true);
        setError('');

        const payload = {
            name: formData.name,
            owner: formData.owner || 'Adith Narain T',
            region: formData.region,
            framework: formData.framework,
            plan_type: formData.plan_type,
            repo_url: `https://github.com/${encodeURIComponent(formData.owner || 'user')}/${encodeURIComponent(formData.repo_name || 'repo')}`,
            repo_name: formData.repo_name || 'Kuberns Page',
            branch: formData.branch || 'main',
            environment: {
                name: 'production',
                branch: formData.branch || 'main',
                port: activePort,
            },
            env_variables: envVars.map(({ key, value, is_secret }) => ({ key, value, is_secret })),
        };

        try {
            const response = await createWebApp(payload);
            // Navigate to a success / deploy page with the new app data
            navigate('/deploy-status', { state: { webapp: response.data } });
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create New App</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Connect your repository and fill in the requirements to see the app deployed in seconds.
                    </p>
                </div>
                <StepIndicator currentStep={2} />
            </div>

            {/* Section: Port Configuration */}
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Port Configuration</h2>

                <div className="flex items-start gap-8">
                    <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                        You can choose a specific port for your application, or we'll take care of it and assign one for you automatically.
                    </p>

                    <div className="flex-1">
                        {/* Radio buttons */}
                        <div className="flex items-center gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="portType"
                                    checked={portType === 'random'}
                                    onChange={() => setPortType('random')}
                                    className="w-4 h-4 accent-[var(--accent-blue)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-secondary)] transition-colors">
                                    Assign a random port
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="portType"
                                    checked={portType === 'custom'}
                                    onChange={() => setPortType('custom')}
                                    className="w-4 h-4 accent-[var(--accent-blue)]"
                                />
                                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-secondary)] transition-colors">
                                    Set a Custom Port
                                </span>
                            </label>
                        </div>

                        {/* Port display */}
                        <div className="flex items-center gap-3">
                            {portType === 'custom' ? (
                                <input
                                    type="number"
                                    placeholder="e.g. 3000"
                                    value={customPort}
                                    onChange={(e) => setCustomPort(e.target.value)}
                                    className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:outline-none transition-colors w-48"
                                />
                            ) : (
                                <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm flex-1 flex items-center gap-1">
                                    <span className="text-[var(--text-muted)]">localhost/</span>
                                    <span className="text-[var(--accent-blue)] font-mono font-semibold">{randomPort}</span>
                                </div>
                            )}
                            <span className="flex items-center gap-1 text-xs text-[var(--accent-green)] font-medium">
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                                {portType === 'random' ? 'Random Port Assigned' : 'Custom Port Set'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Environment Variables */}
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Configure Environment Variables</h2>
                    <span className="text-xs text-[var(--text-muted)]">
                        Need Help?{' '}
                        <span className="text-[var(--accent-blue)] cursor-pointer">Refer to our documentation</span>
                    </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                    Manage and customize environment variables for your application. Environment variables are key-value pairs
                    that allow you to configure settings, API endpoints, and sensitive information specific to each environment.
                    Add, edit, or delete variables to tailor your application's behavior and integration with external services.
                </p>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_2fr_auto] gap-4 mb-3 px-2">
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">Key</span>
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">Value</span>
                    <span className="w-24" />
                </div>

                {/* Existing vars */}
                <div className="space-y-2 mb-4">
                    {envVars.map((envVar, i) => (
                        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center px-2 py-2 rounded-lg hover:bg-[var(--bg-input)]/50 transition-colors group">
                            <div className="flex items-center gap-2">
                                {envVar.editing ? (
                                    <input
                                        value={envVar.key}
                                        onChange={(e) => updateEnvVar(i, 'key', e.target.value)}
                                        className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:outline-none w-full"
                                    />
                                ) : (
                                    <span className="text-sm text-[var(--text-secondary)] font-mono">{envVar.key}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {envVar.editing ? (
                                    <input
                                        value={envVar.value}
                                        onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
                                        className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1 text-sm text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:outline-none w-full"
                                    />
                                ) : (
                                    <span className="text-sm text-[var(--text-muted)]">{envVar.value}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 w-24 justify-end">
                                <button
                                    onClick={() => toggleEdit(i)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20 transition-colors"
                                >
                                    {envVar.editing ? 'Save' : 'Edit'}
                                </button>
                                <button
                                    onClick={() => removeEnvVar(i)}
                                    className="text-xs font-semibold px-2 py-1.5 rounded bg-[var(--accent-red)]/10 text-[var(--accent-red)] hover:bg-[var(--accent-red)]/20 transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* New variable row */}
                    <div className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center px-2 py-2 border-t border-dashed border-[var(--border-color)]">
                        <div className="flex items-center gap-2">
                            <input
                                placeholder="Enter Key"
                                value={newVar.key}
                                onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                placeholder="Enter Value"
                                value={newVar.value}
                                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-24 justify-end">
                            <button
                                onClick={addEnvVar}
                                className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] hover:bg-[var(--accent-green)]/20 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setNewVar({ key: '', value: '' })}
                                className="text-xs font-semibold px-2 py-1.5 rounded bg-[var(--accent-red)]/10 text-[var(--accent-red)] hover:bg-[var(--accent-red)]/20 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add New button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => setNewVar({ key: '', value: '' })}
                        className="bg-[#2665fe] hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-lg flex items-center gap-1 transition-all"
                    >
                        Add New
                    </button>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="bg-[var(--accent-red)]/10 border border-[var(--accent-red)] rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm text-[var(--accent-red)]">{error}</p>
                </div>
            )}

            {/* CTA */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <button
                    onClick={handleFinish}
                    disabled={submitting}
                    className="bg-[var(--accent-blue)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Finish my Setup
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
