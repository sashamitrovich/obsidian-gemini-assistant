import { ItemView, MarkdownRenderer, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_GEMINI = "gemini-assistant-view";

export class GeminiSidebarView extends ItemView {
	private contentArea: HTMLElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.contentArea = document.createElement("div");
	}

	getViewType(): string {
		return VIEW_TYPE_GEMINI;
	}

	getDisplayText(): string {
		return "Gemini Assistant";
	}

	getIcon(): string {
		return "sparkles";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("gemini-sidebar-container");

		const header = container.createEl("div", {
			cls: "gemini-sidebar-header",
		});
		header.createEl("h4", { text: "Gemini Assistant" });

		this.contentArea = container.createEl("div", {
			cls: "gemini-sidebar-content",
		});

		this.contentArea.createEl("p", {
			text: "Select text and run a Gemini command to see results here.",
			cls: "gemini-sidebar-placeholder",
		});

		const style = container.createEl("style");
		style.textContent = `
			.gemini-sidebar-container {
				padding: 12px;
				overflow-y: auto;
				height: 100%;
			}
			.gemini-sidebar-header {
				border-bottom: 1px solid var(--background-modifier-border);
				padding-bottom: 8px;
				margin-bottom: 12px;
			}
			.gemini-sidebar-header h4 {
				margin: 0;
			}
			.gemini-sidebar-content {
				line-height: 1.6;
			}
			.gemini-sidebar-placeholder {
				color: var(--text-muted);
				font-style: italic;
			}
			.gemini-sidebar-loading {
				display: flex;
				align-items: center;
				gap: 8px;
				color: var(--text-muted);
				padding: 12px 0;
			}
			.gemini-loading-spinner {
				width: 16px;
				height: 16px;
				border: 2px solid var(--text-muted);
				border-top-color: transparent;
				border-radius: 50%;
				animation: gemini-spin 0.8s linear infinite;
			}
			@keyframes gemini-spin {
				to { transform: rotate(360deg); }
			}
		`;
	}

	async onClose(): Promise<void> {
		// cleanup
	}

	async setContent(markdown: string): Promise<void> {
		this.contentArea.empty();
		await MarkdownRenderer.render(
			this.app,
			markdown,
			this.contentArea,
			"",
			this
		);
	}

	showLoading(): void {
		this.contentArea.empty();
		const loading = this.contentArea.createEl("div", {
			cls: "gemini-sidebar-loading",
		});
		loading.createEl("div", { cls: "gemini-loading-spinner" });
		loading.createEl("span", { text: "Gemini is thinking…" });
	}

	hideLoading(): void {
		const loading = this.contentArea.querySelector(
			".gemini-sidebar-loading"
		);
		if (loading) loading.remove();
	}
}
