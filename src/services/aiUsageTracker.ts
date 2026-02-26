/**
 * AI Usage Tracker — GP Medical Health
 * Tracks Gemini API token usage and estimated costs
 */

export interface AIUsageEntry {
    id: string;
    timestamp: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
    fileName?: string;
    documentType?: string;
}

export interface AIUsageStats {
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCostUSD: number;
    avgTokensPerCall: number;
    history: AIUsageEntry[];
}

// Gemini 2.0 Flash pricing (per 1M tokens)
const PRICING = {
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
    'gemini-2.0-flash-lite': { input: 0.025, output: 0.10 },
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
} as Record<string, { input: number; output: number }>;

const STORAGE_KEY = 'gp_medical_ai_usage';

function getHistory(): AIUsageEntry[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function saveHistory(entries: AIUsageEntry[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-500)));
}

export function trackUsage(model: string, inputTokens: number, outputTokens: number, fileName?: string, documentType?: string): AIUsageEntry {
    const pricing = PRICING[model] || PRICING['gemini-2.0-flash'];
    const cost = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
    const entry: AIUsageEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCostUSD: Math.round(cost * 1_000_000) / 1_000_000,
        fileName,
        documentType,
    };
    const history = getHistory();
    history.push(entry);
    saveHistory(history);
    return entry;
}

export function getUsageStats(): AIUsageStats {
    const history = getHistory();
    const totalInputTokens = history.reduce((s, e) => s + e.inputTokens, 0);
    const totalOutputTokens = history.reduce((s, e) => s + e.outputTokens, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalCostUSD = history.reduce((s, e) => s + e.estimatedCostUSD, 0);
    return {
        totalCalls: history.length,
        totalInputTokens,
        totalOutputTokens,
        totalTokens,
        totalCostUSD: Math.round(totalCostUSD * 1_000_000) / 1_000_000,
        avgTokensPerCall: history.length > 0 ? Math.round(totalTokens / history.length) : 0,
        history,
    };
}

export function clearUsageHistory() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getModelInfo() {
    return {
        current: 'gemini-2.0-flash',
        alternatives: [
            { name: 'Gemini 2.0 Flash', id: 'gemini-2.0-flash', speed: '⚡ Más rápido', cost: '$0.10/$0.40 per 1M tokens', recommended: true },
            { name: 'Gemini 2.0 Flash Lite', id: 'gemini-2.0-flash-lite', speed: '⚡⚡ Ultra rápido', cost: '$0.025/$0.10 per 1M tokens', recommended: false },
            { name: 'Gemini 1.5 Pro', id: 'gemini-1.5-pro', speed: '🧠 Más preciso', cost: '$1.25/$5.00 per 1M tokens', recommended: false },
            { name: 'Gemini 1.5 Flash', id: 'gemini-1.5-flash', speed: '⚡ Rápido', cost: '$0.075/$0.30 per 1M tokens', recommended: false },
        ],
        pricing: PRICING,
    };
}
