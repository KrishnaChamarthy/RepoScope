import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PageHeader from '../components/PageHeader';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import { buildProjectIndex, saveProjectIndex, loadProjectIndex } from '../utils/projectIndex';

const RepositoryFilesPage = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const { api } = useUser();
  
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['']));
  const [searchQuery, setSearchQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [projectIndex, setProjectIndex] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    if (owner && repo) {
      fetchRepositoryFiles();
    }
  }, [owner, repo]);

  useEffect(() => {
    if (files.length > 0 && !projectIndex) {
      loadOrBuildProjectIndex();
    }
  }, [files]);

  const fetchRepositoryFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/github/repo/${owner}/${repo}/files`);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error('Failed to fetch repository files:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrBuildProjectIndex = async () => {
    // Try to load existing index
    const existingIndex = loadProjectIndex(owner, repo);
    if (existingIndex) {
      setProjectIndex(existingIndex);
      return;
    }

    // Build new index
    setIsIndexing(true);
    try {
      const index = await buildProjectIndex(files, api, owner, repo);
      setProjectIndex(index);
      saveProjectIndex(owner, repo, index);
    } catch (error) {
      console.error('Failed to build project index:', error);
    } finally {
      setIsIndexing(false);
    }
  };

  const fetchFileContent = async (filePath) => {
    setLoading(true);
    try {
      const res = await api.get(`/github/repo/${owner}/${repo}/file`, {
        params: { path: filePath }
      });
      setFileContent(res.data.content || '');
      setSelectedFile(filePath);
      setShowExplanation(false);
      setExplanation('');
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      setFileContent('Error loading file content');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question) => {
    try {
      const res = await api.post('/explain/ask-repository', {
        owner,
        repo,
        question,
        projectIndex // Send the project index to the backend
      });
      
      if (res.data.success) {
        return res.data.answer || 'No answer available';
      } else {
        throw new Error(res.data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to get answer:', err);
      throw err;
    }
  };

  const explainCode = async () => {
    if (!fileContent || !selectedFile) return;
    
    setIsExplaining(true);
    setShowExplanation(true);
    setExplanation('Analyzing code with enhanced AI insights...'); // Show immediate feedback
    
    try {
      // Enhanced context for better explanations
      const contextData = {
        code: fileContent,
        filePath: selectedFile,
        repoName: `${owner}/${repo}`,
        projectIndex // Include project context
      };

      // Add language and project type from project index if available
      if (projectIndex) {
        contextData.language = projectIndex.summary?.languages?.[0] || 'Unknown';
        contextData.projectType = projectIndex.summary?.projectType || 'Unknown';
      }
      
      const res = await api.post('/explain', contextData);
      
      if (res.data.success) {
        setExplanation(res.data.explanation || 'No explanation available');
      } else {
        setExplanation('Error getting explanation: ' + (res.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to get code explanation:', err);
      setExplanation('Error getting explanation. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex flex-col">
      <PageHeader
        owner={owner}
        repo={repo}
        onNavigateHome={() => navigate('/')}
        onNavigateBack={() => navigate(-1)}
        onShowQuestions={() => setShowQuestionPanel(!showQuestionPanel)}
        isIndexing={isIndexing}
        projectIndex={projectIndex}
      />

      <div className="flex-1 flex overflow-hidden">
        <FileTree
          files={files}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedFolders={expandedFolders}
          selectedFile={selectedFile}
          onToggleFolder={toggleFolder}
          onSelectFile={fetchFileContent}
          loading={loading}
        />

        <CodeViewer
          selectedFile={selectedFile}
          fileContent={fileContent}
          isExplaining={isExplaining}
          showExplanation={showExplanation}
          explanation={explanation}
          onExplainCode={explainCode}
          onCopyToClipboard={copyToClipboard}
          onCloseExplanation={() => setShowExplanation(false)}
          // Q&A props
          owner={owner}
          repo={repo}
          showQuestionPanel={showQuestionPanel}
          onAskQuestion={askQuestion}
          onCloseQuestionPanel={() => setShowQuestionPanel(false)}
          projectIndex={projectIndex}
        />
      </div>
    </div>
  );
};

export default RepositoryFilesPage;