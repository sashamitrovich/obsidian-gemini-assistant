import { requestUrl } from "obsidian";
import { type ModelOption, FALLBACK_MODELS } from "./settings";

const MODELS_API =
	"https://generativelanguage.googleapis.com/v1beta/models";

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

export async function fetchAvailableModels(
	apiKey: string
): Promise<ModelOption[]> {
	const response = await requestUrl({
		url: `${MODELS_API}?key=${apiKey}`,
		method: "GET",
	});

	const data = response.json;

	if (!data.models || !Array.isArray(data.models)) {
		return FALLBACK_MODELS;
	}

	const models: ModelOption[] = data.models
		.filter((m: GeminiModelInfo) => {
			if (
				!m.supportedGenerationMethods?.includes("generateContent")
			) {
				return false;
			}
			if (!m.name.startsWith("models/gemini")) {
				return false;
			}
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

	// Sort: higher version numbers first, then alphabetically
	models.sort((a, b) => {
		const versionA = extractVersion(a.id);
		const versionB = extractVersion(b.id);
		if (versionA !== versionB) return versionB - versionA;
		return a.label.localeCompare(b.label);
	});

	return models;
}

function extractVersion(id: string): number {
	const match = id.match(/gemini-(\d+(?:\.\d+)?)/);
	return match ? parseFloat(match[1]) : 0;
}
