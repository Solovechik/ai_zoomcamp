import { customAlphabet } from 'nanoid';

// Exclude ambiguous characters: 0, O, I, l, 1
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

/**
 * Generate an 8-character session ID
 * @returns {string} Session ID like "aB3x9Kmn"
 */
export function generateSessionId() {
  return nanoid();
}

/**
 * Generate a unique session ID, checking for collisions
 * @param {Function} checkExists - Async function to check if ID exists
 * @returns {Promise<string>} Unique session ID
 */
export async function generateUniqueSessionId(checkExists) {
  let attempts = 0;
  let sessionId;

  do {
    sessionId = generateSessionId();
    attempts++;

    if (attempts > 5) {
      throw new Error('Failed to generate unique session ID after 5 attempts');
    }
  } while (await checkExists(sessionId));

  return sessionId;
}
