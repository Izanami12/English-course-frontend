import Keycloak from 'keycloak-js';

// Initialize Keycloak instance with Keycloak server settings
const keycloak = new Keycloak({
  url: 'http://localhost:8180/',        // Keycloak server URL
  realm: 'english-course',                     // The realm created in Keycloak
  clientId: 'english-course-frontend',          // The client ID for the frontend app
});

export default keycloak;