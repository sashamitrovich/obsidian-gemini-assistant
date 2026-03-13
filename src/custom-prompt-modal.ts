import { App, Modal } from "obsidian";

export class CustomPromptModal extends Modal {
	private onSubmit: (instruction: string) => void;

	constructor(app: App, onSubmit: (instruction: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("gemini-custom-prompt-modal");

		contentEl.createEl("h3", { text: "Custom Prompt" });
		contentEl.createEl("p", {
			text: "Enter your instruction for Gemini. It will be applied to your selected text or full note.",
			cls: "gemini-custom-prompt-desc",
		});

		const textArea = contentEl.createEl("textarea", {
			cls: "gemini-custom-prompt-input",
			attr: {
				placeholder:
					"e.g., Rewrite this as a formal email, Add citations, Convert to bullet points…",
				rows: "5",
			},
		});

		const buttonContainer = contentEl.createEl("div", {
			cls: "gemini-custom-prompt-buttons",
		});

		const cancelBtn = buttonContainer.createEl("button", {
			text: "Cancel",
		});
		cancelBtn.addEventListener("click", () => {
			this.close();
		});

		const submitBtn = buttonContainer.createEl("button", {
			text: "Submit",
			cls: "mod-cta",
		});
		submitBtn.addEventListener("click", () => {
			const value = textArea.value.trim();
			if (value) {
				this.onSubmit(value);
				this.close();
			}
		});

		// Submit on Ctrl/Cmd+Enter
		textArea.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				const value = textArea.value.trim();
				if (value) {
					this.onSubmit(value);
					this.close();
				}
			}
		});

		const style = contentEl.createEl("style");
		style.textContent = `
			.gemini-custom-prompt-modal {
				padding: 16px;
			}
			.gemini-custom-prompt-modal h3 {
				margin-top: 0;
			}
			.gemini-custom-prompt-desc {
				color: var(--text-muted);
				font-size: 13px;
				margin-bottom: 12px;
			}
			.gemini-custom-prompt-input {
				width: 100%;
				resize: vertical;
				font-family: inherit;
				font-size: 14px;
				padding: 8px;
				border-radius: 4px;
				border: 1px solid var(--background-modifier-border);
				background: var(--background-primary);
				color: var(--text-normal);
			}
			.gemini-custom-prompt-buttons {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
				margin-top: 12px;
			}
		`;

		// Focus textarea
		setTimeout(() => textArea.focus(), 10);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
