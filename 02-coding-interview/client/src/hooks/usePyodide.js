import { useState, useEffect, useCallback, useRef } from 'react';

function usePyodide() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const outputRef = useRef([]);

  useEffect(() => {
    let mounted = true;

    async function loadPyodide() {
      try {
        // Load Pyodide from CDN
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
        });

        if (mounted) {
          setPyodide(pyodideInstance);
          setLoading(false);
          console.log('✓ Pyodide loaded successfully');
        }
      } catch (err) {
        console.error('Failed to load Pyodide:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadPyodide();

    return () => {
      mounted = false;
    };
  }, []);

  const runCode = useCallback(async (code) => {
    if (!pyodide) {
      throw new Error('Pyodide is not loaded yet');
    }

    const startTime = performance.now();
    outputRef.current = [];
    let errorMessage = null;

    try {
      // Set up stdout capture
      pyodide.setStdout({
        batched: (text) => {
          outputRef.current.push(text);
        }
      });

      // Set up stderr capture
      pyodide.setStderr({
        batched: (text) => {
          outputRef.current.push(`[ERROR] ${text}`);
        }
      });

      // Run the Python code
      const result = await pyodide.runPythonAsync(code);

      // If the result is not None, print it
      if (result !== undefined && result !== null) {
        outputRef.current.push(String(result));
      }

    } catch (err) {
      errorMessage = err.message;
      console.error('Python execution error:', err);
    }

    const executionTime = (performance.now() - startTime).toFixed(2);
    const output = outputRef.current.join('\n').trim();

    return {
      output: errorMessage ? '' : output,
      error: errorMessage,
      executionTime: `${executionTime}ms`
    };
  }, [pyodide]);

  return {
    runCode,
    loading,
    error,
    ready: !loading && !error && pyodide !== null
  };
}

export default usePyodide;
