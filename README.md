# RepoScope
RepoScope is an intelligent code exploration tool that scans GitHub repositories, indexes source code, and enables powerful search and AI-driven explanations of functions, classes, and logic. Built with Python, React, and LLM integration.

## 🧠 AI Model Configuration

**Current Model:** llama3.2:3b (basic analysis)

For better code understanding and more detailed analysis, we recommend upgrading to:
- **llama3.2:7b** (recommended) - Better context, detailed analysis
- **llama3.2:11b** (premium) - Maximum performance for large codebases

**Quick Upgrade:**
```bash
docker-compose exec ollama ollama pull llama3.2:7b
# Edit Server/src/services/llmService.js and change MODEL = 'llama3.2:7b'
docker-compose restart api
```

📖 See [AI-MODEL-GUIDE.md](./AI-MODEL-GUIDE.md) for detailed upgrade instructions and performance comparisons.
