/**
 * AI Usage Tracker — GP Medical Health
 * Tracks Gemini + OpenAI API token usage and estimated costs
 */

export interface AIUsageEntry {
    id: string;
    timestamp: string;
    model: string;
    provider: 'gemini' | 'openai';
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
    byProvider: Record<string, { calls: number; tokens: number; cost: number }>;
    history: AIUsageEntry[];
}

// Pricing per 1M tokens
const PRICING: Record<string, { input: number; output: number; provider: 'gemini' | 'openai' }> = {
    'gemini-2.0-flash': { input: 0.10, output: 0.40, provider: 'gemini' },
    'gemini-2.0-flash-lite': { input: 0.025, output: 0.10, provider: 'gemini' },
    'gemini-1.5-pro': { input: 1.25, output: 5.00, provider: 'gemini' },
    'gemini-1.5-flash': { input: 0.075, output: 0.30, provider: 'gemini' },
    'gpt-4o': { input: 2.50, output: 10.00, provider: 'openai' },
    'gpt-4o-mini': { input: 0.15, output: 0.60, provider: 'openai' },
    'gpt-4-turbo': { input: 10.00, output: 30.00, provider: 'openai' },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50, provider: 'openai' },
};

const STORAGE_KEY = 'gp_medical_ai_usage';

function getHistory(): AIUsageEntry[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
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
        provider: pricing.provider,
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

    const byProvider: Record<string, { calls: number; tokens: number; cost: number }> = {};
    history.forEach(e => {
        if (!byProvider[e.provider]) byProvider[e.provider] = { calls: 0, tokens: 0, cost: 0 };
        byProvider[e.provider].calls++;
        byProvider[e.provider].tokens += e.totalTokens;
        byProvider[e.provider].cost += e.estimatedCostUSD;
    });

    return {
        totalCalls: history.length,
        totalInputTokens,
        totalOutputTokens,
        totalTokens,
        totalCostUSD: Math.round(totalCostUSD * 1_000_000) / 1_000_000,
        avgTokensPerCall: history.length > 0 ? Math.round(totalTokens / history.length) : 0,
        byProvider,
        history,
    };
}

export function clearUsageHistory() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getModelInfo() {
    const hasGemini = !!import.meta.env.VITE_GOOGLE_API_KEY;
    const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;

    return {
        current: hasGemini ? 'gemini-2.0-flash' : hasOpenAI ? 'gpt-4o-mini' : 'none',
        hasGemini,
        hasOpenAI,
        models: [
            { name: 'Gemini 2.0 Flash', id: 'gemini-2.0-flash', provider: 'gemini' as const, speed: '⚡ Rápido', cost: '$0.10/$0.40 /1M', vision: true, recommended: true, available: hasGemini },
            { name: 'Gemini 1.5 Pro', id: 'gemini-1.5-pro', provider: 'gemini' as const, speed: '🧠 Preciso', cost: '$1.25/$5.00 /1M', vision: true, recommended: false, available: hasGemini },
            { name: 'GPT-4o Mini', id: 'gpt-4o-mini', provider: 'openai' as const, speed: '⚡ Rápido', cost: '$0.15/$0.60 /1M', vision: true, recommended: false, available: hasOpenAI },
            { name: 'GPT-4o', id: 'gpt-4o', provider: 'openai' as const, speed: '🧠 Preciso', cost: '$2.50/$10.00 /1M', vision: true, recommended: false, available: hasOpenAI },
        ],
        pricing: PRICING,
    };
}
