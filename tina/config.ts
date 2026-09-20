import { defineConfig } from 'tinacms';

/**
 * This is the web-side schema for the small contract exported by
 * NacoSolutions/senshac-content. The export envelope is kept explicit so the
 * web app does not silently grow ownership of editorial content.
 */
const nonEmpty = (value: unknown) => (typeof value === 'string' && value.trim() ? undefined : 'This field is required.');
const slug = (value: unknown) => (
  typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? undefined
    : 'Use lowercase letters, numbers, and single hyphens.'
);

export default defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  branch: process.env.GITHUB_BRANCH || 'main',
  // Editorial files stay in the sibling NacoSolutions/senshac-content repository.
  localContentPath: '../senshac-content',
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
        name: 'articles',
        label: 'Articles',
        path: 'articles',
        format: 'mdx',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'string',
            required: true,
            ui: { validate: nonEmpty },
          },
          {
            name: 'slug',
            label: 'Slug',
            type: 'string',
            required: true,
            ui: { validate: slug },
          },
          {
            name: 'draft',
            label: 'Draft',
            type: 'boolean',
          },
          {
            name: 'status',
            label: 'Status',
            type: 'string',
            required: true,
            options: ['draft', 'published', 'scheduled'],
          },
          {
            name: 'publishDate',
            label: 'Publish date',
            type: 'datetime',
            required: true,
          },
          {
            name: 'excerpt',
            label: 'Excerpt',
            type: 'string',
            required: true,
            ui: { component: 'textarea', validate: nonEmpty },
          },
          {
            name: 'author',
            label: 'Author',
            type: 'string',
            required: true,
            ui: { validate: nonEmpty },
          },
          {
            name: 'media',
            label: 'Media',
            type: 'image',
          },
          {
            name: 'tags',
            label: 'Tags',
            type: 'string',
            list: true,
          },
          {
            name: 'body',
            label: 'Body',
            type: 'rich-text',
            isBody: true,
            required: true,
          },
        ],
      },
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
