import { defineConfig } from 'astro/config';
import tina from '@tinacms/astro/integration';

// Deployment configuration is intentionally platform-owned and absent here.
export default defineConfig({
  site: 'https://preview.invalid',
  integrations: [tina()],
});
