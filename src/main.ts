/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import specific icons you want to use (e.g., solid and brand icons)
import { faPhone, faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

// Add the imported icons to the library
library.add(faPhone, faUserSecret, faGithub);

const app = createApp(App)

registerPlugins(app)

// Register the FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app')
