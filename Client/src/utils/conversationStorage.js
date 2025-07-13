const STORAGE_KEY = 'repo_conversations';

export const saveConversation = (owner, repo, conversations) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const repoKey = `${owner}/${repo}`;
    stored[repoKey] = {
      conversations,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};

export const loadConversation = (owner, repo) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const repoKey = `${owner}/${repo}`;
    return stored[repoKey]?.conversations || [];
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return [];
  }
};

export const clearConversation = (owner, repo) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const repoKey = `${owner}/${repo}`;
    delete stored[repoKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
};

export const getAllConversations = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (error) {
    console.error('Failed to load all conversations:', error);
    return {};
  }
};