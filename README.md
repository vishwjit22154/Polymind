# Polymind 🧠

Polymind is a powerful "Council of LLMs" dashboard built with Next.js. It leverages the **GitHub Models API** to orchestrate a multi-stage reasoning pipeline where different AI models (OpenAI, Meta, Microsoft, AI21) collaborate, peer-review, and synthesize a single definitive answer.

## 🚀 The 3-Stage Pipeline

1.  **Stage 1: Multi-Perspective Generation**
    *   The user's query is sent simultaneously to a diverse council of models.
    *   Currently configured: **GPT-4o (OpenAI)**, **Llama 3.1 8B (Meta)**, **Phi-4 (Microsoft)**, and **Jamba 1.5 Large (AI21)**.

2.  **Stage 2: Peer Analysis & Ranking**
    *   Models analyze each other's responses (anonymized internally for fairness).
    *   They provide scores for **Accuracy, Insight, and Clarity** along with detailed critiques.
    *   Visually represented with animated metric bars in the dashboard.

3.  **Stage 3: Verified Synthesis**
    *   A high-intelligence "Chairman" model (e.g., **GPT-5** or **GPT-4o**) receives the original prompt, all candidate responses, and all peer reviews.
    *   It produces a final, high-quality markdown response resolving conflicts and highlighting the best ideas.
    *   **Fallback Engine:** If the primary chairman hits a limit, the system automatically appoints the strongest working model from Stage 1 to finalize the synthesis.

## 🛠 Tech Stack

-   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Zustand (State Management)
-   **Backend:** Next.js Server Actions & API Routes, Zod (Schema Validation)
-   **Infrastructure:** GitHub Models (Azure AI Inference), p-limit (Concurrency Control), p-retry (Resilience)

## 📦 Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### 2. Clone and Install
```bash
git clone https://github.com/vishwjit22154/Polymind.git
cd Polymind
pnpm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
# Your GitHub Personal Access Token
GITHUB_TOKEN=your_github_pat_here
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to start.

## 🔑 How to use GitHub Models

To use this app, you need a GitHub Personal Access Token (PAT) with access to the **GitHub Models** marketplace.

1.  Go to [GitHub Settings -> Personal Access Tokens (Fine-grained)](https://github.com/settings/personal-access-tokens/new).
2.  Give your token a name and set the expiration.
3.  Under **Permissions**, click **Account permissions**.
4.  Find **Copilot** and select **Access: Read and write** (specifically the "Copilot Requests" permission if available, or broad Copilot access).
5.  Alternatively, ensure your account has **Copilot Pro** or is part of a organization with **GitHub Models** enabled.
6.  Copy the generated token and paste it into your `.env.local`.

## ⚙️ Configuration

-   **Settings Modal:** Click the gear icon in the app to change model IDs, temperatures, and token limits.
-   **Persistence:** All chats and custom settings are saved in your browser's `localStorage`.
-   **Default Config:** Found in `src/config/council.config.ts`.

## ⚠️ Known Limits

-   **Rate Limits:** High-end models like `o3` or `gpt-5` often have a "1-2 requests per minute" limit on GitHub. The app includes built-in staggering and retries to handle this.
-   **Token Ceiling:** Some preview models have a 4,000 token limit. The app automatically compresses data sent to Stage 3 to ensure success.

---
Created by [vishwjit22154](https://github.com/vishwjit22154)
