// API configuration
// In production, API calls will go to the same domain (relative URLs)
// In development, they'll go to localhost:5001
const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5001';

export default API_URL;
