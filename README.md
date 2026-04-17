# Axiom | Epistemology Matrix

A high-performance, AI-driven exploration of human knowledge. Powered by Gemini 3.1 Flash Lite.

## Deployment to Vercel

1. **Export code** to GitHub using the AI Studio Export tool.
2. **Connect Repository** to Vercel.
3. **Set Environment Variables**:
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.
4. **Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

The included `vercel.json` ensures that deep-linking and page refreshes work correctly by routing all requests through the main application logic.

## Developing Locally

```bash
npm install
npm run dev
```
