# Polymind

Polymind is a simple local web app that implements a "Council of LLMs" to provide high-quality, peer-reviewed, and synthesized answers to complex queries. It uses OpenRouter to communicate with multiple models in a 3-stage pipeline.

## The Council Pipeline

1.  **Stage 1: Generation** - Multiple models (e.g., Claude, Gemini, GPT) independently generate responses to your prompt.
2.  **Stage 2: Peer Review** - Each model reviews and ranks the anonymized responses from other models. They provide scores (accuracy, insight, clarity) and critiques.
3.  **Stage 3: Synthesis** - A "Chairman" model receives the original prompt, all Stage 1 responses, and all Stage 2 reviews to produce a final, definitive answer that cites the best ideas from the council.

## Tech Stack

-   **Frontend:** Next.js (App Router), React, Tailwind CSS, Zustand, Lucide React
-   **Backend:** Next.js API Routes, Zod (validation), p-limit (concurrency), p-retry (exponential backoff)
-   **API:** OpenRouter

## Setup

1.  **Clone the repository** (if you're using this from a repo) or ensure you are in the project directory.
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure environment variables:**
    Create a `.env.local` file in the root directory:
    ```bash
    OPENROUTER_API_KEY=your_api_key_here
    ```
4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

You can edit the council members and the chairman model directly in the app via the **Settings** icon. 
- Default models are configured in `src/config/council.config.ts`.
- Conversations and configurations are stored in your browser's `localStorage`.

## Limitations

-   **Local Store:** Run statuses are kept in server memory and will reset if the server restarts.
-   **Browser Storage:** Conversations are stored in `localStorage`, so they are specific to your browser/device.
-   **Costs:** Running multiple models for every query can consume OpenRouter credits quickly.

## Safety & Robustness

-   **Timeouts & Retries:** Automatic retries with exponential backoff for OpenRouter API calls.
-   **Concurrency:** Limits the number of simultaneous API calls to stay within reasonable limits.
-   **JSON Validation:** Stage 2 reviews are validated with Zod, with a one-time "fix" attempt if a model produces invalid JSON.
