import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import CustomSelect from '../components/CustomSelect';

const REGIONS = [
    { value: 'us-east-1', label: 'United States - N. Virginia' },
    { value: 'us-west-2', label: 'United States - Oregon' },
    { value: 'eu-west-1', label: 'Europe - Ireland' },
    { value: 'ap-south-1', label: 'Asia Pacific - Mumbai' },
    { value: 'ap-southeast-1', label: 'Asia Pacific - Singapore' },
];

const FRAMEWORKS = [
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'vue', label: 'Vue.js', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'nextjs', label: 'Next.js', icon: '▲' },
    { value: 'django', label: 'Django', icon: '🐍' },
    { value: 'flask', label: 'Flask', icon: '🌶️' },
    { value: 'express', label: 'Express.js', icon: '🟢' },
];

const PLANS = {
    starter: {
        name: 'Starter',
        storage: '10 GB', bandwidth: '10 GB', ram: '2 GB', cpu: '1 vCPU',
        cost: '₹0', perHour: '₹0',
        description: 'Ideal for personal blogs and small websites',
    },
    pro: {
        name: 'Pro',
        storage: '50 GB', bandwidth: '100 GB', ram: '4 GB', cpu: '2 vCPU',
        cost: '₹499', perHour: '₹1.5',
        description: 'Best for production apps and APIs',
    },
};

// Mock data for GitHub connection
const MOCK_ORGS = ['Adith Narain T', 'kuberns-org', 'my-team'];
const MOCK_REPOS = ['Kuberns Page', 'my-app', 'portfolio', 'api-server'];
const MOCK_BRANCHES = ['main', 'develop', 'staging', 'feature/deploy'];

export default function AppSetup({ formData, setFormData }) {
    const navigate = useNavigate();
    const [githubConnected, setGithubConnected] = useState(true);
    const [errors, setErrors] = useState({});

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'App name is required';
        if (!formData.region) newErrors.region = 'Please select a region';
        if (!formData.framework) newErrors.framework = 'Please select a framework';
        if (!formData.plan_type) newErrors.plan_type = 'Please select a plan';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            navigate('/env-setup');
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
                <StepIndicator currentStep={1} />
            </div>

            {/* Section: Version Control */}
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold">Choose your Version Control System</h2>
                    <span className="text-xs text-[var(--text-muted)]">
                        Need Help?{' '}
                        <span className="text-[var(--accent-blue)] cursor-pointer">Refer to our documentation</span>
                    </span>
                </div>

                {/* GitHub / GitLab toggle */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setGithubConnected(true)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${githubConnected
                            ? 'bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20'
                            : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-muted)]'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        Github
                        {githubConnected && <span className="text-[10px] uppercase tracking-wider opacity-75">Connected</span>}
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:border-[var(--text-muted)] transition-all">
                        <span className="text-orange-500 text-lg">🦊</span>
                        GitLab
                        <span className="text-[10px] uppercase tracking-wider opacity-75">Not Connected</span>
                    </button>
                </div>

                {/* Org / Repo / Branch selectors */}
                <div className="grid grid-cols-4 gap-4">
                    <CustomSelect
                        label="*Select Organization"
                        value={formData.owner}
                        onChange={(val) => updateField('owner', val)}
                        options={MOCK_ORGS}
                        placeholder="Select Organization"
                    />
                    <CustomSelect
                        label="*Select Repository"
                        value={formData.repo_name}
                        onChange={(val) => updateField('repo_name', val)}
                        options={MOCK_REPOS}
                        placeholder="Select Repository"
                    />
                    <CustomSelect
                        label="*Select Branch"
                        value={formData.branch}
                        onChange={(val) => updateField('branch', val)}
                        options={MOCK_BRANCHES}
                        placeholder="Select Branch"
                    />
                    <div className="flex items-end">
                        <button className="text-[var(--accent-blue)] text-sm font-medium flex items-center gap-1 hover:underline">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Configure Github
                        </button>
                    </div>
                </div>
            </section>

            {/* Section: App Details */}
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-semibold">Fill in the details of your App</h2>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                        Need Help?{' '}
                        <span className="text-[var(--accent-blue)] cursor-pointer">Refer to our documentation</span>
                    </span>
                </div>

                <h3 className="text-sm font-semibold mb-1">Basic Details</h3>
                <p className="text-xs text-[var(--text-muted)] mb-5">
                    Enter the basic details of your application such as the name, region of deployment and the framework or the template for your application.
                </p>

                <div className="grid grid-cols-3 gap-4">
                    {/* App Name */}
                    <div>
                        <label className="text-xs text-[var(--text-muted)] mb-1 block">*Choose a name</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-blue)]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="CloudCity"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className={`w-full bg-[var(--bg-input)] border ${errors.name ? 'border-[var(--accent-red)]' : 'border-[var(--border-color)]'} rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors`}
                            />
                        </div>
                        {errors.name && <p className="text-[var(--accent-red)] text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Region */}
                    <CustomSelect
                        label="*Choose Region"
                        value={formData.region}
                        onChange={(val) => updateField('region', val)}
                        options={REGIONS}
                        placeholder="Select Region"
                        error={errors.region}
                    />

                    {/* Framework */}
                    <CustomSelect
                        label="*Choose Template"
                        value={formData.framework}
                        onChange={(val) => updateField('framework', val)}
                        options={FRAMEWORKS}
                        placeholder="Choose Template"
                        error={errors.framework}
                    />
                </div>
            </section>

            {/* Section: Plan Type */}
            <section className="bg-[var(--bg-card)] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold">Plan Type</h2>
                    <span className="text-[var(--accent-blue)] text-xs font-medium cursor-pointer flex items-center gap-1">
                        Upgrade Plan
                    </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-5">
                    Select the plan type that best suits your application's needs. Each plan offers different features, resources, and limitations.
                </p>

                {errors.plan_type && <p className="text-[var(--accent-red)] text-xs mb-3">{errors.plan_type}</p>}

                {/* Plan table */}
                <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--bg-input)] text-[var(--text-muted)] text-xs">
                                <th className="text-left px-4 py-3 font-medium">Plan type</th>
                                <th className="text-left px-4 py-3 font-medium">Storage</th>
                                <th className="text-left px-4 py-3 font-medium">Bandwidth</th>
                                <th className="text-left px-4 py-3 font-medium">Memory (RAM)</th>
                                <th className="text-left px-4 py-3 font-medium">CPU</th>
                                <th className="text-left px-4 py-3 font-medium">Monthly Cost</th>
                                <th className="text-left px-4 py-3 font-medium">Price per hour</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(PLANS).map(([key, plan]) => (
                                <tr
                                    key={key}
                                    onClick={() => updateField('plan_type', key)}
                                    className={`cursor-pointer transition-all border-t border-[var(--border-color)] ${formData.plan_type === key
                                        ? 'bg-[var(--bg-input)]'
                                        : ''
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${formData.plan_type === key
                                            ? 'bg-[var(--accent-green)] text-white shadow-md shadow-green-500/20'
                                            : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                                            }`}>
                                            {plan.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.storage}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.bandwidth}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.ram}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.cpu}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)] font-medium">{plan.cost}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.perHour}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {formData.plan_type && (
                    <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                        *{PLANS[formData.plan_type].description}
                    </p>
                )}
            </section>

            {/* Section: Database */}
            <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Database Selection</h2>
                    <span className="text-xs text-[var(--text-muted)]">
                        Need Help?{' '}
                        <span className="text-[var(--accent-blue)] cursor-pointer">Refer to our documentation</span>
                    </span>
                </div>

                <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-4 mb-5">
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Please be informed that the proper functioning of our application is dependent on a valid database connection during deployment.
                        Failing to establish a correct database connection will result in an inability to access or manipulate essential data,
                        rendering the application non-functional. It's crucial to ensure a reliable database connection to guarantee the app's operational success.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button className="bg-[var(--accent-green)] hover:bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" /></svg>
                        Connect Database
                    </button>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm font-medium transition-colors">
                        Maybe Later
                    </button>
                </div>
            </section>

            {/* CTA */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                    Set Up Env Variables
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
