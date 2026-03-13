import { App, Modal } from "obsidian";

export class SuggestionModal extends Modal {
	private originalText: string;
	private suggestedText: string;
	private onAccept: (text: string) => void;

	constructor(
		app: App,
		originalText: string,
		suggestedText: string,
		onAccept: (text: string) => void
	) {
		super(app);
		this.originalText = originalText;
		this.suggestedText = suggestedText;
		this.onAccept = onAccept;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("gemini-suggestion-modal");

		contentEl.createEl("h3", { text: "Gemini Suggestion" });

		const originalSection = contentEl.createEl("div", {
			cls: "gemini-modal-section",
		});
		originalSection.createEl("h5", { text: "Original" });
		const originalContent = originalSection.createEl("div", {
			cls: "gemini-modal-text",
		});
		originalContent.createEl("pre", {
			text: this.originalText,
		});

		const suggestedSection = contentEl.createEl("div", {
			cls: "gemini-modal-section",
		});
		suggestedSection.createEl("h5", { text: "Suggestion" });
		const suggestedContent = suggestedSection.createEl("div", {
			cls: "gemini-modal-text",
		});
		suggestedContent.createEl("pre", {
			text: this.suggestedText,
		});

		const buttonContainer = contentEl.createEl("div", {
			cls: "gemini-modal-buttons",
		});

		const rejectBtn = buttonContainer.createEl("button", {
			text: "Reject",
		});
		rejectBtn.addEventListener("click", () => {
			this.close();
		});

		const copyBtn = buttonContainer.createEl("button", {
			text: "Copy",
		});
		copyBtn.addEventListener("click", () => {
			navigator.clipboard.writeText(this.suggestedText);
			copyBtn.textContent = "Copied!";
			setTimeout(() => {
				copyBtn.textContent = "Copy";
			}, 1500);
		});

		const acceptBtn = buttonContainer.createEl("button", {
			text: "Accept & Replace",
			cls: "mod-cta",
		});
		acceptBtn.addEventListener("click", () => {
			this.onAccept(this.suggestedText);
			this.close();
		});

		const style = contentEl.createEl("style");
		style.textContent = `
			.gemini-suggestion-modal {
				padding: 16px;
			}
			.gemini-suggestion-modal h3 {
				margin-top: 0;
				margin-bottom: 16px;
			}
			.gemini-modal-section {
				margin-bottom: 16px;
			}
			.gemini-modal-section h5 {
				margin: 0 0 8px 0;
				color: var(--text-muted);
				text-transform: uppercase;
				font-size: 11px;
				letter-spacing: 0.05em;
			}
			.gemini-modal-text {
				background: var(--background-secondary);
				border-radius: 6px;
				padding: 12px;
				max-height: 200px;
				overflow-y: auto;
			}
			.gemini-modal-text pre {
				margin: 0;
				white-space: pre-wrap;
				word-wrap: break-word;
				font-size: 13px;
			}
			.gemini-modal-buttons {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
				margin-top: 16px;
			}
		`;
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
