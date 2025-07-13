import axios from 'axios';

// Use the Docker service name when running in Docker, localhost when running locally
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL = 'llama3.2:3b';

export const checkOllamaHealth = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Checking Ollama health (attempt ${i + 1}/${retries})`);
      console.log(`📡 Connecting to: ${OLLAMA_BASE_URL}`);
      
      const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
        timeout: 15000 // 15 seconds timeout
      });
      
      console.log('✅ Ollama is accessible');
      return true;
    } catch (error) {
      console.error(`❌ Ollama health check failed (attempt ${i + 1}):`, {
        message: error.message,
        code: error.code,
        url: `${OLLAMA_BASE_URL}/api/tags`
      });
      
      if (i < retries - 1) {
        console.log('⏳ Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  return false;
};

export const explainCode = async (code, context = {}) => {
  try {
    const { filename, language, repoName, projectType } = context;
    
    let prompt = `You are an expert code analyst. Analyze the following code and provide a clear, comprehensive explanation.

Context:
- File: ${filename || 'Unknown'}
- Language: ${language || 'Unknown'}
- Repository: ${repoName || 'Unknown'}
- Project Type: ${projectType || 'Unknown'}

Code to analyze:
\`\`\`${language || ''}
${code}
\`\`\`

Please provide:
1. **Purpose**: What this code does in 1-2 sentences
2. **Key Components**: Main functions, classes, or logic blocks
3. **Technical Details**: Important patterns, algorithms, or techniques used
4. **Complexity**: Rate as Low/Medium/High and explain why
5. **Context**: How this fits into the larger project (if apparent)

Keep the explanation clear, concise, and focused on the most important aspects.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 800,
        repeat_penalty: 1.1,
        num_ctx: 6144
      }
    }, {
      timeout: 90000
    });

    return response.data.response;
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    throw new Error('Failed to explain code');
  }
};

export const answerRepositoryQuestion = async (prompt) => {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_predict: 800,
        repeat_penalty: 1.1,
        num_ctx: 8192
      }
    }, {
      timeout: 120000
    });

    return response.data.response;
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    throw new Error('Failed to answer question');
  }
};

export const waitForOllama = async (maxWaitTime = 180000) => {
  const startTime = Date.now();
  console.log('⏳ Waiting for Ollama to be ready...');
  
  while (Date.now() - startTime < maxWaitTime) {
    const isHealthy = await checkOllamaHealth(1);
    if (isHealthy) {
      console.log('✅ Ollama is ready!');
      return true;
    }
    
    console.log('⏳ Ollama not ready yet, waiting 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.error('❌ Timeout waiting for Ollama to be ready');
  return false;
};

export const preloadModels = async () => {
  try {
    console.log('🔄 Preloading model...');
    await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: MODEL,
      prompt: 'Hello',
      stream: false,
      options: { num_predict: 1 }
    }, { timeout: 60000 });
    console.log('✅ Model preloaded successfully');
  } catch (error) {
    console.warn('⚠️ Failed to preload model:', error.message);
  }
};

export const analyzeRepository = async (repoData) => {
  try {
    const { 
      name, 
      description, 
      language, 
      languageStats, 
      projectType, 
      frameworks, 
      buildTools,
      fileStructure,
      totalFiles,
      totalLines 
    } = repoData;

    let prompt = `You are an expert software architect and code analyst. Analyze this repository and provide comprehensive insights.

Repository Information:
- Name: ${name}
- Description: ${description || 'No description provided'}
- Primary Language: ${language || 'Unknown'}
- Project Type: ${projectType || 'General'}
- Total Files: ${totalFiles || 0}
- Total Lines: ${totalLines || 0}

Language Distribution:
${languageStats ? Object.entries(languageStats)
  .map(([lang, stats]) => `- ${lang}: ${stats.files} files, ${stats.lines} lines`)
  .join('\n') : 'No language stats available'}

Frameworks/Technologies:
${frameworks && frameworks.length > 0 ? frameworks.join(', ') : 'None detected'}

Build Tools:
${buildTools && buildTools.length > 0 ? buildTools.join(', ') : 'None detected'}

File Structure (sample):
${fileStructure ? fileStructure.slice(0, 10)
  .map(file => `- ${file.path} (${file.language}, ${file.lines} lines)`)
  .join('\n') : 'No file structure available'}

Please provide a comprehensive analysis including:

1. **Project Overview**: What this repository appears to be (application type, purpose)
2. **Architecture Assessment**: How well-structured the codebase appears to be
3. **Technology Stack**: Analysis of languages, frameworks, and tools used
4. **Complexity Analysis**: Overall complexity level and reasoning
5. **Code Quality Indicators**: Based on structure, naming, organization
6. **Potential Use Cases**: What this project might be used for
7. **Development Insights**: Any notable patterns or architectural decisions

Be specific and provide actionable insights. Focus on what makes this repository unique or interesting.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_predict: 1200,
        repeat_penalty: 1.1,
        num_ctx: 8192
      }
    }, {
      timeout: 120000
    });

    return response.data.response;
  } catch (error) {
    console.error('Repository Analysis Error:', error.message);
    throw new Error('Failed to analyze repository');
  }
};

export const generateCodeInsights = async (codeSnippets, repoContext) => {
  try {
    const { name, language, projectType } = repoContext;
    
    const prompt = `You are a senior software engineer reviewing code. Analyze these code snippets from the ${name} repository and provide insights.

Repository Context:
- Project: ${name}
- Type: ${projectType || 'Unknown'}
- Primary Language: ${language || 'Unknown'}

Code Snippets:
${codeSnippets.map((snippet, index) => 
  `\n--- Snippet ${index + 1}: ${snippet.file} ---\n${snippet.code}`
).join('\n')}

Provide insights on:
1. **Code Quality**: Overall quality assessment
2. **Patterns Used**: Design patterns, architectural patterns identified
3. **Best Practices**: What's done well
4. **Potential Issues**: Areas that could be improved
5. **Recommendations**: Specific suggestions for enhancement

Keep insights practical and actionable.`;

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_predict: 800,
        repeat_penalty: 1.1,
        num_ctx: 6144
      }
    }, {
      timeout: 100000
    });

    return response.data.response;
  } catch (error) {
    console.error('Code Insights Error:', error.message);
    throw new Error('Failed to generate code insights');
  }
};