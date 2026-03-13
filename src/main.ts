import { Editor, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import {
	GeminiAssistantSettings,
	DEFAULT_SETTINGS,
	GeminiAssistantSettingTab,
} from "./settings";
import { GeminiClient } from "./gemini-client";
import { GeminiSidebarView, VIEW_TYPE_GEMINI } from "./sidebar-view";
import { SuggestionModal } from "./suggestion-modal";
import { CustomPromptModal } from "./custom-prompt-modal";

const PROMPTS: Record<string, string> = {
	grammar:
		"Check the following text for grammar, spelling, and punctuation errors. Return the corrected version, then list the changes you made as bullet points.\n\nText:\n{text}",
	improve:
		"Improve the writing style, clarity, and flow of the following text. Keep the author's original voice and meaning intact. Return the improved version.\n\nText:\n{text}",
	expand:
		"Suggest additional content, arguments, examples, or details to expand and enrich the following text. Return the expanded version.\n\nText:\n{text}",
	summarize:
		"Write a concise summary of the following text in 2–4 sentences.\n\nText:\n{text}",
	translate:
		"Translate the following text to {targetLanguage}. Return only the translation.\n\nText:\n{text}",
	headings:
		"Suggest a compelling title and 3–5 section headings for the following note content.\n\nText:\n{text}",
};

interface CommandDef {
	id: string;
	name: string;
	promptKey: string;
}

const COMMANDS: CommandDef[] = [
	{ id: "grammar", name: "Check Grammar & Spelling", promptKey: "grammar" },
	{ id: "improve", name: "Improve Writing Style", promptKey: "improve" },
	{ id: "expand", name: "Expand Content", promptKey: "expand" },
	{ id: "summarize", name: "Summarize", promptKey: "summarize" },
	{ id: "translate", name: "Translate", promptKey: "translate" },
	{
		id: "headings",
		name: "Generate Title & Headings",
		promptKey: "headings",
	},
];

export default class GeminiAssistantPlugin extends Plugin {
	settings: GeminiAssistantSettings = DEFAULT_SETTINGS;
	private ribbonIconEl: HTMLElement | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_GEMINI,
			(leaf) => new GeminiSidebarView(leaf)
		);

		for (const cmd of COMMANDS) {
			this.addCommand({
				id: cmd.id,
				name: cmd.name,
				editorCallback: (editor: Editor) => {
					this.runCommand(cmd.promptKey, editor);
				},
			});
		}

		this.addCommand({
			id: "custom",
			name: "Custom Prompt",
			editorCallback: (editor: Editor) => {
				new CustomPromptModal(this.app, (instruction: string) => {
					this.runCommand("custom", editor, instruction);
				}).open();
			},
		});

		this.updateRibbonIcon();

		this.addSettingTab(new GeminiAssistantSettingTab(this.app, this));
	}

	onunload(): void {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_GEMINI);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	updateRibbonIcon(): void {
		if (this.ribbonIconEl) {
			this.ribbonIconEl.remove();
			this.ribbonIconEl = null;
		}
		if (this.settings.showRibbonIcon) {
			this.ribbonIconEl = this.addRibbonIcon(
				"sparkles",
				"Gemini Assistant",
				() => {
					this.activateView();
				}
			);
		}
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GEMINI);
		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_GEMINI,
					active: true,
				});
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	private getClient(): GeminiClient {
		return new GeminiClient(
			this.settings.apiKey,
			this.settings.model,
			this.settings.temperature,
			this.settings.maxTokens,
			this.settings.systemPrompt
		);
	}

	private async runCommand(
		promptKey: string,
		editor: Editor,
		customInstruction?: string
	): Promise<void> {
		const selection = editor.getSelection();
		const fullNote = editor.getValue();
		const text = selection || fullNote;

		if (!text.trim()) {
			new Notice("No text to process. Write something first.");
			return;
		}

		let prompt: string;
		if (promptKey === "custom" && customInstruction) {
			prompt = `${customInstruction}\n\nText:\n${text}`;
		} else if (promptKey === "translate") {
			prompt = PROMPTS[promptKey]
				.replace("{targetLanguage}", this.settings.defaultLanguage)
				.replace("{text}", text);
		} else {
			prompt = PROMPTS[promptKey].replace("{text}", text);
		}

		const context = selection ? fullNote : undefined;

		const notice = new Notice("Gemini is thinking…", 0);

		await this.activateView();
		const view = this.app.workspace
			.getLeavesOfType(VIEW_TYPE_GEMINI)[0]
			?.view as GeminiSidebarView | undefined;

		if (view) {
			view.showLoading();
		}

		try {
			const client = this.getClient();
			const result = await client.generate(prompt, context);

			notice.hide();

			if (view) {
				await view.setContent(result);
			}

			if (selection) {
				new SuggestionModal(
					this.app,
					selection,
					result,
					(accepted: string) => {
						editor.replaceSelection(accepted);
					}
				).open();
			}
		} catch (err: unknown) {
			notice.hide();
			if (view) {
				await view.setContent(
					`**Error:** ${err instanceof Error ? err.message : "An unknown error occurred."}`
				);
			}
			new Notice(
				err instanceof Error
					? err.message
					: "An error occurred while calling Gemini.",
				5000
			);
		}
	}
}
