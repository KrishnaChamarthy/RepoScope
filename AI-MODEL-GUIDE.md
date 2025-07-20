# 🧠 AI Model Configuration for Better Code Analysis

## Current Model: llama3.2:3b

The application is currently configured to use **llama3.2:3b**, which is a smaller 3 billion parameter model. While this model works well for basic analysis, it has limitations when processing large codebases.

### Current Capabilities ✅
- ✅ Basic repository analysis
- ✅ Simple code explanations  
- ✅ General programming questions
- ✅ Architecture overviews

### Limitations with 3B Model ⚠️
- ⚠️ Limited context window (8K tokens)
- ⚠️ May struggle with very large codebases
- ⚠️ Less detailed code understanding
- ⚠️ Shorter, less comprehensive responses

## Recommended Upgrades 🚀

### Option 1: llama3.2:7b (Recommended)
**Best balance of performance and resource usage**

```bash
# Pull the 7B model
docker-compose exec ollama ollama pull llama3.2:7b

# Update the model in Server/src/services/llmService.js
const MODEL = 'llama3.2:7b';

# Restart the API container
docker-compose restart api
```

**Benefits:**
- 🎯 2x better context understanding
- 🎯 More detailed code analysis
- 🎯 Better handling of large repositories
- 🎯 More accurate architectural insights

### Option 2: llama3.2:11b (Maximum Performance)
**For the most comprehensive analysis**

```bash
# Pull the 11B model (requires more RAM)
docker-compose exec ollama ollama pull llama3.2:11b

# Update the model in Server/src/services/llmService.js
const MODEL = 'llama3.2:11b';

# Restart the API container
docker-compose restart api
```

**Benefits:**
- 🏆 Best code understanding
- 🏆 Handles massive codebases
- 🏆 Highly detailed analysis
- 🏆 Superior architectural insights

**Requirements:**
- At least 16GB RAM recommended
- More processing time per query

## System Requirements

| Model | RAM Required | Context Window | Best For |
|-------|-------------|----------------|----------|
| 3b    | 4GB         | 8K tokens      | Small projects, quick answers |
| 7b    | 8GB         | 16K tokens     | Medium projects, detailed analysis |
| 11b   | 16GB        | 32K tokens     | Large codebases, comprehensive analysis |

## How to Upgrade

1. **Pull the new model:**
   ```bash
   docker-compose exec ollama ollama pull llama3.2:7b
   ```

2. **Update the configuration:**
   Edit `Server/src/services/llmService.js`:
   ```javascript
   const MODEL = 'llama3.2:7b';  // Change this line
   ```

3. **Restart the API:**
   ```bash
   docker-compose restart api
   ```

4. **Verify the upgrade:**
   The QuestionPanel will show the updated model information when you use the AI feature.

## Performance Comparison

### With 3B Model:
```
Question: "How does this React project work?"
Response: "This appears to be a React application with components and routing..."
Context: ~2,000 characters
```

### With 7B Model:
```
Question: "How does this React project work?"  
Response: "This is a comprehensive React application built with Vite and Tailwind CSS. 
Looking at the App.jsx file, I can see it implements a multi-page application with:

1. **Main Components:**
   - Header component with navigation
   - RepositoryCard for displaying GitHub repos
   - CodeViewer with syntax highlighting using Prism.js
   
2. **State Management:**
   The application uses React Context (UserContext, ConversationContext) for:
   - User authentication state
   - Repository data management
   - Conversation history

3. **Key Features:**
   - GitHub integration for cloning repositories
   - Real-time code analysis and AI explanations
   - Project indexing with comprehensive file analysis
   
[... much more detailed analysis]"
Context: ~15,000 characters
```

## Troubleshooting

### If the upgrade fails:
```bash
# Check available models
docker-compose exec ollama ollama list

# Check system resources
docker stats

# View API logs
docker-compose logs api
```

### Memory issues:
If you experience memory issues with larger models, you can:
1. Reduce other running applications
2. Increase Docker's memory limit
3. Use the 7B model instead of 11B

## Advanced Configuration

You can also experiment with other models:
- `codellama:7b` - Specialized for code
- `llama3.1:8b` - Alternative architecture
- `mixtral:8x7b` - Mixture of experts (requires 32GB RAM)

Remember to update the `MODEL` constant in `llmService.js` after pulling any new model.

---

**Current Status:** The application will automatically detect your model size and optimize context accordingly. Larger models will provide significantly better code understanding and more detailed analysis.
