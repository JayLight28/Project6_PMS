/**
 * Shared Configuration Manager — PROJECT6_PMS
 * Centralizes API endpoints, ports, and environment-specific settings.
 */

const isMother = typeof window !== 'undefined' ? window.location.port === '3001' : process.env.NODE_TYPE === 'MOTHER';
const isChild = typeof window !== 'undefined' ? window.location.port === '3002' : process.env.NODE_TYPE === 'CHILD';

const Config = {
    // Mother HQ API
    MOTHER_API_URL: 'http://localhost:3001/api',
    MOTHER_PORT: 3001,

    // Child Vessel API
    CHILD_API_URL: 'http://localhost:3002/api',
    CHILD_PORT: 3002,

    // Dynamic Base URL based on context
    get API_BASE_URL() {
        if (typeof window !== 'undefined') {
            return window.location.origin + '/api';
        }
        return `http://localhost:${this.MOTHER_PORT}/api`;
    },

    // Sync Settings
    SYNC_CHUNK_SIZE: 3.5 * 1024 * 1024, // 3.5MB limit for marine email attachments
    RETENTION_MONTHS: 36, // Default photo retention policy
};

export default Config;
