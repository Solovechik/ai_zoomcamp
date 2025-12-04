// In production, use relative URLs (same origin as frontend)
// In development, use explicit localhost URLs
export const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

export const DEFAULT_CODE = `# Write your Python code here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
`;
