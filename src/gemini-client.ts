import { requestUrl } from "obsidian";

const ENDPOINTS = [
	"https://generativelanguage.googleapis.com/v1beta/models",
	"https://generativelanguage.googleapis.com/v1/models",
];

export class GeminiClient {
	private apiKey: string;
	private model: string;
	private temperature: number;
	private maxTokens: number;
	private systemPrompt: string;

	constructor(
		apiKey: string,
		model: string,
		temperature: number,
		maxTokens: number,
		systemPrompt: string
	) {
		this.apiKey = apiKey;
		this.model = model;
		this.temperature = temperature;
		this.maxTokens = maxTokens;
		this.systemPrompt = systemPrompt;
	}

	async generate(userPrompt: string, contextText?: string): Promise<string> {
		if (!this.apiKey) {
			throw new Error(
				"Gemini API key is not set. Please configure it in the plugin settings."
			);
		}

		const parts: { text: string }[] = [];
		if (contextText) {
			parts.push({
				text: `Context (full note):\n${contextText}`,
			});
		}
		parts.push({ text: userPrompt });

		const body: Record<string, unknown> = {
			contents: [
				{
					role: "user",
					parts,
				},
			],
			generationConfig: {
				temperature: this.temperature,
				maxOutputTokens: this.maxTokens,
			},
		};

		if (this.systemPrompt.trim()) {
			body.systemInstruction = {
				parts: [{ text: this.systemPrompt }],
			};
		}

		let lastError: unknown;
		for (const base of ENDPOINTS) {
			const url = `${base}/${this.model}:generateContent?key=${this.apiKey}`;
			try {
				const response = await requestUrl({
					url,
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});

				const data = response.json;

				if (
					!data.candidates ||
					data.candidates.length === 0 ||
					!data.candidates[0].content
				) {
					throw new Error(
						"Gemini returned an empty response. The content may have been filtered."
					);
				}

				return data.candidates[0].content.parts[0].text;
			} catch (err: unknown) {
				const error = err as { status?: number; message?: string };
				if (error.status === 404) {
					lastError = err;
					continue;
				}
				if (error.status === 400) {
					throw new Error(
						"Bad request — check your prompt or model settings."
					);
				}
				if (error.status === 401 || error.status === 403) {
					throw new Error(
						"Invalid or unauthorized API key. Please check your Gemini API key in settings."
					);
				}
				if (error.status === 429) {
					throw new Error(
						"Rate limit exceeded. Please wait a moment and try again."
					);
				}
				if (error.status && error.status >= 500) {
					throw new Error(
						"Gemini server error. Please try again later."
					);
				}
				throw err;
			}
		}

		throw new Error(
			`Model "${this.model}" not found (404). Try selecting a different model in settings, or click "Refresh Models" to load available models for your API key.`
		);
	}
}
