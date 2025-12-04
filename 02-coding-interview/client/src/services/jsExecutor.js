/**
 * Execute JavaScript code safely in the browser
 * Captures console.log output
 */
export async function executeJavaScript(code) {
  const startTime = performance.now();
  const output = [];
  let error = null;

  // Save original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  try {
    // Override console methods to capture output
    console.log = (...args) => {
      output.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.error = (...args) => {
      output.push('[ERROR] ' + args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.warn = (...args) => {
      output.push('[WARN] ' + args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // Execute code in a function scope to avoid polluting global scope
    const executeInScope = new Function(code);
    const result = executeInScope();

    // If there's a return value, add it to output
    if (result !== undefined) {
      output.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
    }

  } catch (err) {
    error = err.message;
    console.error('Execution error:', err);
  } finally {
    // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }

  const executionTime = (performance.now() - startTime).toFixed(2);

  return {
    output: output.join('\n'),
    error,
    executionTime: `${executionTime}ms`
  };
}

// Helper to check if code is valid JavaScript
export function validateJavaScript(code) {
  try {
    new Function(code);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
