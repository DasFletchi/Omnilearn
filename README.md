# 🧠 Omnilearn - AI-Powered Learning Assistant

> Your personal AI tutor that adapts to your learning style. Study smarter, not harder.

![Mistral Theme](https://img.shields.io/badge/theme-mistral-FF6A2A?style=flat-square)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square)
![Next.js](https://img.shields.io/badge/framework-Next.js-000000?style=flat-square)
![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Features

### 🎓 Intelligent Learning
- **Real-time AI Chat** - Ask questions about your study material
- **Quick Actions** - Explain, Simplify, Quiz, Summarize, Examples
- **Smart Context** - AI understands your worksheet content
- **Multiple AI Providers** - Support for Mistral, OpenAI, and NVIDIA NIM

### 🎨 Beautiful UI
- **4 Stunning Themes** - Mistral (default), Perplexity, Dark, ChatGPT
- **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- **Smooth Animations** - Animated backgrounds and morphing liquid buttons
- **Dark Mode Support** - Comfortable learning at any time

### 📝 Advanced Markdown Rendering
- **Full Markdown Support** - Headers, lists, blockquotes, code blocks
- **Code Highlighting** - Copy-paste ready code blocks with language labels
- **Rich Formatting** - Bold, italic, inline code, and more
- **Mobile Optimized** - Perfect text wrapping and scaling

### 🚀 Performance
- **Streaming Responses** - Real-time AI output
- **Auto-scroll** - Messages automatically scroll into view
- **Responsive Design** - sm, md, lg breakpoints for all devices

## 🎯 Quick Start

### Prerequisites
- Node.js 16+
- API keys for at least one AI provider:
  - [Mistral API](https://console.mistral.ai/)

### Installation

```bash
# Clone the repository
git clone https://github.com/DasFletchi/Omnilearn.git
cd Omnilearn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your API keys to .env.local
# MISTRAL_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# NVIDIA_API_KEY=your_key_here

# Run development server
npm run dev
