export const analyzeProjectStructure = (files) => {
  const structure = {
    directories: [],
    files: [],
    filesByExtension: {},
    functions: [],
    classes: [],
    imports: [],
    exports: []
  };

  const processFiles = (items, currentPath = '') => {
    items.forEach(item => {
      const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      
      if (item.type === 'dir') {
        structure.directories.push({
          name: item.name,
          path: fullPath,
          children: item.children?.length || 0
        });
        
        if (item.children) {
          processFiles(item.children, fullPath);
        }
      } else {
        const extension = item.name.split('.').pop()?.toLowerCase();
        structure.files.push({
          name: item.name,
          path: fullPath,
          extension
        });
        
        if (!structure.filesByExtension[extension]) {
          structure.filesByExtension[extension] = [];
        }
        structure.filesByExtension[extension].push(fullPath);
      }
    });
  };

  processFiles(files);
  return structure;
};

export const analyzeCodeContent = (content, filePath) => {
  const analysis = {
    functions: [],
    classes: [],
    imports: [],
    exports: [],
    variables: [],
    components: []
  };

  if (!content) return analysis;

  const lines = content.split('\n');
  const extension = filePath.split('.').pop()?.toLowerCase();

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // JavaScript/TypeScript patterns
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
      // Functions
      const functionMatch = trimmedLine.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|(\w+)\s*:\s*\([^)]*\)\s*=>)/);
      if (functionMatch) {
        const functionName = functionMatch[1] || functionMatch[2] || functionMatch[3];
        analysis.functions.push({
          name: functionName,
          line: index + 1,
          file: filePath
        });
      }

      // React components
      const componentMatch = trimmedLine.match(/(?:const\s+(\w+)\s*=.*?React\.Component|class\s+(\w+)\s+extends\s+(?:React\.)?Component|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
      if (componentMatch) {
        const componentName = componentMatch[1] || componentMatch[2] || componentMatch[3];
        if (componentName && componentName[0] === componentName[0].toUpperCase()) {
          analysis.components.push({
            name: componentName,
            line: index + 1,
            file: filePath
          });
        }
      }

      // Classes
      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      if (classMatch) {
        analysis.classes.push({
          name: classMatch[1],
          line: index + 1,
          file: filePath
        });
      }

      // Imports
      const importMatch = trimmedLine.match(/import\s+.*?from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        analysis.imports.push({
          module: importMatch[1],
          line: index + 1,
          file: filePath
        });
      }

      // Exports
      const exportMatch = trimmedLine.match(/export\s+(?:default\s+)?(?:const\s+|function\s+|class\s+)?(\w+)/);
      if (exportMatch) {
        analysis.exports.push({
          name: exportMatch[1],
          line: index + 1,
          file: filePath
        });
      }

      // Variables
      const variableMatch = trimmedLine.match(/(?:const|let|var)\s+(\w+)/);
      if (variableMatch) {
        analysis.variables.push({
          name: variableMatch[1],
          line: index + 1,
          file: filePath
        });
      }
    }

    // Python patterns
    if (extension === 'py') {
      const functionMatch = trimmedLine.match(/def\s+(\w+)/);
      if (functionMatch) {
        analysis.functions.push({
          name: functionMatch[1],
          line: index + 1,
          file: filePath
        });
      }

      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      if (classMatch) {
        analysis.classes.push({
          name: classMatch[1],
          line: index + 1,
          file: filePath
        });
      }
    }

    // Java patterns
    if (extension === 'java') {
      const methodMatch = trimmedLine.match(/(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/);
      if (methodMatch) {
        analysis.functions.push({
          name: methodMatch[1],
          line: index + 1,
          file: filePath
        });
      }

      const classMatch = trimmedLine.match(/(?:public|private)?\s*class\s+(\w+)/);
      if (classMatch) {
        analysis.classes.push({
          name: classMatch[1],
          line: index + 1,
          file: filePath
        });
      }
    }
  });

  return analysis;
};