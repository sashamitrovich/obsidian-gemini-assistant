# Gemini Assistant for Obsidian

[![TypeScript](https://img.shields.io/badge/TypeScript-4.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7c3aed?logo=obsidian)](https://obsidian.md/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Improve your writing with **Google Gemini AI** — grammar, style, content, and more — directly inside Obsidian. No context switching, no copy-pasting into external tools.

## Features

- **Check Grammar & Spelling** — Fix grammar, punctuation, and spelling errors with explanations of each change
- **Improve Writing Style** — Rephrase for clarity, flow, and readability while keeping your voice
- **Expand Content** — Get suggestions for additional points, arguments, and details
- **Summarize** — Generate a concise 2–4 sentence summary of any text
- **Translate** — Translate text to any language (configurable default)
- **Generate Title & Headings** — Get a compelling title and section headings for your note
- **Custom Prompt** — Send any free-form instruction to Gemini with your text

### Additional Features

- **Sidebar Panel** — AI responses rendered in a dedicated right-side panel with full Markdown support
- **Suggestion Modal** — Side-by-side view of original vs. suggestion with Accept, Reject, and Copy buttons
- **Accept & Replace** — One click to replace your selected text with the AI suggestion
- **Context-Aware** — Commands use the full note as context while acting on your selection
- **Works on mobile** — Compatible with both desktop and mobile Obsidian

## Model Support

The plugin dynamically fetches all available Gemini models directly from the Google API:

- **Auto-discovery** — Click "Refresh Models" in settings to load the latest available Gemini models
- **Smart filtering** — Only text generation models are shown (embedding, TTS, and other non-text models are excluded)
- **Persistent cache** — The fetched model list is saved between sessions so you don't need to refresh every time
- **Offline fallback** — If the API is unavailable or no API key is set, the plugin falls back to a curated list of current stable models

The default model is `gemini-2.5-flash`, which provides a good balance of speed and quality.

## Installation

### Manual Installation

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/sashamitrovich/obsidian-gemini-assistant/releases/latest)
2. Create a folder `obsidian-gemini-assistant` inside your vault's `.obsidian/plugins/` directory
3. Copy `main.js` and `manifest.json` into that folder
4. Open Obsidian Settings → Community Plugins → Reload → Enable "Gemini Assistant"

### Install via BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins
2. Open BRAT settings → "Add Beta Plugin"
3. Enter: `sashamitrovich/obsidian-gemini-assistant`
4. Enable the plugin in Community Plugins

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into the plugin settings

The API key is stored securely using Obsidian's built-in plugin data storage and is never logged or transmitted anywhere other than Google's API.

## Usage

### Running Commands

1. **Select text** in any note (or leave nothing selected to process the entire note)
2. Open the **Command Palette** (`Ctrl/Cmd + P`)
3. Search for "Gemini Assistant" and pick a command
4. Results appear in the **sidebar panel** and a **suggestion modal**
5. In the modal, click **Accept & Replace** to insert the AI text, **Copy** to copy it, or **Reject** to dismiss

### Available Commands

| Command | Palette Name | Description |
|---------|-------------|-------------|
| Grammar | `Gemini Assistant: Check Grammar & Spelling` | Fix errors and list changes |
| Style | `Gemini Assistant: Improve Writing Style` | Improve clarity and flow |
| Expand | `Gemini Assistant: Expand Content` | Add depth and detail |
| Summarize | `Gemini Assistant: Summarize` | Condense to 2–4 sentences |
| Translate | `Gemini Assistant: Translate` | Translate to configured language |
| Headings | `Gemini Assistant: Generate Title & Headings` | Suggest title + section headings |
| Custom | `Gemini Assistant: Custom Prompt` | Free-form instruction |

### Ribbon Icon

Click the **sparkles** icon in the left ribbon to open the Gemini Assistant sidebar panel.

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Gemini API Key** | Your Google Gemini API key | — |
| **Model** | All available Gemini models (click Refresh to load from API) | `gemini-2.5-flash` |
| **Temperature** | Controls randomness (0.0 = deterministic, 1.0 = creative) | `0.7` |
| **Max Tokens** | Maximum length of AI responses | `2048` |
| **Default Translation Language** | Target language for the Translate command | `English` |
| **Custom System Prompt** | Instructions prepended to all AI requests | — |
| **Show Ribbon Icon** | Toggle the sidebar icon in the left ribbon | `On` |

## Screenshots

*Coming soon*

## Development

```bash
# Clone the repository
git clone https://github.com/sashamitrovich/obsidian-gemini-assistant.git
cd obsidian-gemini-assistant

# Install dependencies
npm install

# Build for production
npm run build

# Start development mode (auto-rebuild on changes)
npm run dev
```

To test locally, symlink or copy the built files into your vault's `.obsidian/plugins/obsidian-gemini-assistant/` directory.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
