import { defineConfig } from 'tinacms';

/**
 * This is the web-side schema for the small contract exported by
 * NacoSolutions/senshac-content. The export envelope is kept explicit so the
 * web app does not silently grow ownership of editorial content.
 */
export default defineConfig({
  branch: process.env.GITHUB_BRANCH || 'main',
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'home',
        label: 'Home',
        path: 'content',
        format: 'json',
        match: {
          include: 'senshac-content-export',
        },
        fields: [
          {
            name: 'contractVersion',
            label: 'Contract version',
            type: 'number',
          },
          {
            name: 'sourceRevision',
            label: 'Source revision',
            type: 'string',
          },
          {
            name: 'content',
            label: 'Content',
            type: 'object',
            fields: [
              {
                name: 'home',
                label: 'Home page',
                type: 'object',
                fields: [
                  { name: 'title', label: 'Title', type: 'string' },
                  { name: 'intro', label: 'Intro', type: 'string', ui: { component: 'textarea' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
