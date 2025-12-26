# CV-Tailor Chrome Extension

A Chrome extension for tailoring resumes and generating cover letters for job applications.

## Features

- Multi-provider LLM support: Ollama (local), Groq (free tier), Google Gemini
- Two-pass ATS-optimized resume rewriting
- Cover letter generation
- YAML master resume support
- Copy/download generated content

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Development mode (watch)
npm run dev
```

### Load Extension

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Configuration

1. Click extension icon → Settings (gear icon)
2. Select LLM provider:
   - **Groq**: Enter API key from [console.groq.com](https://console.groq.com)
   - **Ollama**: Ensure Ollama is running locally
   - **Gemini**: Enter API key from [aistudio.google.com](https://aistudio.google.com/apikey)
3. Upload your master resume as YAML file

## Usage

1. Click extension icon to open side panel
2. Enter job title and company name
3. Paste the job description
4. Click "Generate Resume & Cover Letter"
5. Copy or download the generated content

## Master Resume Format

See the sample template in Settings for YAML format.
