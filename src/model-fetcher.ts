import { requestUrl } from "obsidian";

export interface ModelOption {
	id: string;
	label: string;
}

export const FALLBACK_MODELS: ModelOption[] = [
	{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
	{ id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
	{ id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
	{ id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
	{ id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
];

const EXCLUDED_PATTERNS = [
	"embedding",
	"aqa",
	"tts",
	"live",
	"native-audio",
	"image-generation",
	"1.0",
];

interface GeminiModelInfo {
	name: string;
	displayName?: string;
	supportedGenerationMethods?: string[];
}

function parseVersion(id: string): number[] {
	const match = id.match(/gemini-(\d+)\.(\d+)/);
	if (!match) return [0, 0];
	return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

export async function fetchAvailableModels(
	apiKey: string
): Promise<ModelOption[]> {
	const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

	const response = await requestUrl({ url, method: "GET" });
	const data = response.json;

	if (!data.models || !Array.isArray(data.models)) {
		return FALLBACK_MODELS;
	}

	const models: ModelOption[] = data.models
		.filter((m: GeminiModelInfo) => {
			if (!m.name.startsWith("models/gemini")) return false;
			if (
				!m.supportedGenerationMethods?.includes("generateContent")
			)
				return false;
			const nameLower = m.name.toLowerCase();
			return !EXCLUDED_PATTERNS.some((p) => nameLower.includes(p));
		})
		.map((m: GeminiModelInfo) => ({
			id: m.name.replace("models/", ""),
			label: m.displayName || m.name.replace("models/", ""),
		}));

	if (models.length === 0) {
		return FALLBACK_MODELS;
	}

	models.sort((a, b) => {
		const va = parseVersion(a.id);
		const vb = parseVersion(b.id);
		if (vb[0] !== va[0]) return vb[0] - va[0];
		if (vb[1] !== va[1]) return vb[1] - va[1];
		return a.label.localeCompare(b.label);
	});

	return models;
}
