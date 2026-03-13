import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type GeminiAssistantPlugin from "./main";
import { fetchAvailableModels } from "./model-fetcher";

export interface ModelOption {
	id: string;
	label: string;
}

export const FALLBACK_MODELS: ModelOption[] = [
	{ id: "gemini-3.1-pro", label: "Gemini 3.1 Pro (Preview)" },
	{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
	{ id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
	{ id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
	{ id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
	{ id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" },
];

export interface GeminiAssistantSettings {
	apiKey: string;
	model: string;
	temperature: number;
	maxTokens: number;
	defaultLanguage: string;
	systemPrompt: string;
	showRibbonIcon: boolean;
	availableModels: ModelOption[];
}

export const DEFAULT_SETTINGS: GeminiAssistantSettings = {
	apiKey: "",
	model: "gemini-2.5-flash",
	temperature: 0.7,
	maxTokens: 2048,
	defaultLanguage: "English",
	systemPrompt: "",
	showRibbonIcon: true,
	availableModels: FALLBACK_MODELS,
};

export class GeminiAssistantSettingTab extends PluginSettingTab {
	plugin: GeminiAssistantPlugin;

	constructor(app: App, plugin: GeminiAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Gemini Assistant Settings" });

		new Setting(containerEl)
			.setName("Gemini API Key")
			.setDesc(
				"Enter your Google Gemini API key. Get one at https://aistudio.google.com/app/apikey"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key")
					.setValue(this.plugin.settings.apiKey)
					.then((t) => {
						t.inputEl.type = "password";
						t.inputEl.style.width = "100%";
					})
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		const modelSetting = new Setting(containerEl)
			.setName("Model")
			.setDesc(
				"Select the Gemini model to use. Click 'Refresh' to load all available models from the Gemini API."
			)
			.addDropdown((dropdown) => {
				for (const m of this.plugin.settings.availableModels) {
					dropdown.addOption(m.id, m.label);
				}
				dropdown
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					});
			})
			.addButton((button) =>
				button.setButtonText("Refresh Models").onClick(async () => {
					if (!this.plugin.settings.apiKey) {
						new Notice("Please enter your API key first.");
						return;
					}
					button.setDisabled(true);
					button.setButtonText("Loading…");
					try {
						const models = await fetchAvailableModels(
							this.plugin.settings.apiKey
						);
						this.plugin.settings.availableModels = models;
						await this.plugin.saveSettings();
						new Notice(
							`Models loaded successfully (${models.length} models).`
						);
						this.display();
					} catch (err) {
						new Notice(
							`Failed to load models: ${err instanceof Error ? err.message : "Unknown error"}`
						);
						button.setDisabled(false);
						button.setButtonText("Refresh Models");
					}
				})
			);

		new Setting(containerEl)
			.setName("Temperature")
			.setDesc(
				`Controls randomness of responses. Current value: ${this.plugin.settings.temperature.toFixed(1)}`
			)
			.addSlider((slider) =>
				slider
					.setLimits(0, 1, 0.1)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Max Tokens")
			.setDesc("Maximum number of tokens in the AI response.")
			.addText((text) =>
				text
					.setPlaceholder("2048")
					.setValue(String(this.plugin.settings.maxTokens))
					.onChange(async (value) => {
						const num = parseInt(value, 10);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.maxTokens = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Default Translation Language")
			.setDesc("Target language for the Translate command.")
			.addText((text) =>
				text
					.setPlaceholder("English")
					.setValue(this.plugin.settings.defaultLanguage)
					.onChange(async (value) => {
						this.plugin.settings.defaultLanguage = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Custom System Prompt")
			.setDesc(
				"Optional instructions prepended to all requests sent to Gemini."
			)
			.addTextArea((text) =>
				text
					.setPlaceholder(
						"e.g., Always respond in a concise, academic tone."
					)
					.setValue(this.plugin.settings.systemPrompt)
					.then((t) => {
						t.inputEl.rows = 4;
						t.inputEl.style.width = "100%";
					})
					.onChange(async (value) => {
						this.plugin.settings.systemPrompt = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show Ribbon Icon")
			.setDesc(
				"Show the Gemini Assistant icon in the left ribbon bar."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showRibbonIcon)
					.onChange(async (value) => {
						this.plugin.settings.showRibbonIcon = value;
						await this.plugin.saveSettings();
						this.plugin.updateRibbonIcon();
					})
			);

		// Auto-refresh models if API key is set and still using fallback defaults
		if (
			this.plugin.settings.apiKey &&
			this.isFallbackModels(this.plugin.settings.availableModels)
		) {
			this.autoRefreshModels();
		}
	}

	private isFallbackModels(models: ModelOption[]): boolean {
		if (models.length !== FALLBACK_MODELS.length) return false;
		return models.every(
			(m, i) =>
				m.id === FALLBACK_MODELS[i].id &&
				m.label === FALLBACK_MODELS[i].label
		);
	}

	private async autoRefreshModels(): Promise<void> {
		try {
			const models = await fetchAvailableModels(
				this.plugin.settings.apiKey
			);
			this.plugin.settings.availableModels = models;
			await this.plugin.saveSettings();
			this.display();
		} catch {
			// Silently fall back to existing list
		}
	}
}
