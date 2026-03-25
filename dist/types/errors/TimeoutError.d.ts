/**
 * Custom error class for token verification timeouts.
 * Allows reliable timeout detection using instanceof instead of string matching.
 */
export class TimeoutError extends Error {
    /**
     * @param {string} [message] - Error message
     */
    constructor(message?: string);
}
