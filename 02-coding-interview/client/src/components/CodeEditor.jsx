import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({
  code,
  onChange,
  onRemoteChange,
  language = 'python',
  readOnly = false
}) {
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const monacoRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Python language
    monaco.languages.setLanguageConfiguration('python', {
      comments: {
        lineComment: '#',
        blockComment: ["'''", "'''"]
      },
      brackets: [
        ['(', ')'],
        ['[', ']'],
        ['{', '}']
      ],
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // Focus editor
    editor.focus();
  }

  function handleEditorChange(value, event) {
    // Ignore if this was triggered by remote update
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Emit local change
    if (onChange && value !== undefined) {
      const position = editorRef.current?.getPosition();
      onChange(value, position);
    }
  }

  // Apply remote changes without disrupting cursor
  useEffect(() => {
    if (!onRemoteChange || !editorRef.current) return;

    const handleRemoteUpdate = (newCode) => {
      const editor = editorRef.current;
      if (!editor) return;

      // Save current state
      const currentPosition = editor.getPosition();
      const currentSelection = editor.getSelection();
      const currentScrollTop = editor.getScrollTop();
      const currentScrollLeft = editor.getScrollLeft();

      // Mark as remote change to prevent echo
      isRemoteChange.current = true;

      // Update editor value
      editor.setValue(newCode);

      // Restore cursor and scroll position
      if (currentPosition) {
        editor.setPosition(currentPosition);
      }
      if (currentSelection) {
        editor.setSelection(currentSelection);
      }
      editor.setScrollTop(currentScrollTop);
      editor.setScrollLeft(currentScrollLeft);
    };

    onRemoteChange(handleRemoteUpdate);
  }, [onRemoteChange]);

  // Update editor when code prop changes (initial load)
  useEffect(() => {
    if (editorRef.current && code !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code && !isRemoteChange.current) {
        isRemoteChange.current = true;
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        readOnly,
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: language === 'javascript' ? 2 : 4,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        matchBrackets: 'always',
        autoIndent: 'full',
        cursorStyle: 'line',
        cursorBlinking: 'smooth',
      }}
    />
  );
}

export default CodeEditor;
