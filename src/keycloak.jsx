import Keycloak from 'keycloak-js';

// Initialize Keycloak instance with environment variables
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'english-course',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'english-course-frontend',
});

export default keycloak;