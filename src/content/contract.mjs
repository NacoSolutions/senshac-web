/**
 * The serializable editorial payload exchanged with senshac-content.
 * @typedef {{ title: string, intro: string }} HomeContent
 * @typedef {{ title: string, slug: string, description: string, featured: boolean, tags: string[] }} ProjectContent
 */

/**
 * Validate the small payload used by the preview route at runtime. Keeping this
 * check at the application boundary makes a malformed sibling-repository
 * export fail during the build instead of rendering partial content.
 *
 * @param {unknown} value
 * @returns {HomeContent}
 */
export function assertHomeContent(value) {
  if (!isRecord(value) || !isRecord(value.home)) {
    throw new Error('Home content must contain a home object');
  }

  const { home } = value;
  if (!isNonEmptyString(home.title) || !isNonEmptyString(home.intro)) {
    throw new Error('Home content requires non-empty title and intro strings');
  }

  if (Object.keys(home).some((key) => !['title', 'intro'].includes(key))) {
    throw new Error('Home content contains an unsupported home field');
  }

  if (Object.keys(value).some((key) => key !== 'home')) {
    throw new Error('Home content contains an unsupported top-level field');
  }

  return { title: home.title, intro: home.intro };
}

/**
 * Validate the project index exported alongside the home page. Project bodies
 * remain owned by senshac-content; the web boundary only normalizes fields
 * needed by the listing and detail routes.
 *
 * @param {unknown} value
 * @returns {ProjectContent[]}
 */
export function assertProjects(value) {
  if (!Array.isArray(value)) throw new Error('Editorial projects must be an array');

  return value.map((project, index) => {
    if (!isRecord(project)) throw new Error(`Editorial project ${index + 1} must be an object`);
    const { title, slug, description, featured = false, tags = [] } = project;
    if (![title, slug, description].every(isNonEmptyString)) {
      throw new Error(`Editorial project ${index + 1} requires title, slug, and description`);
    }
    if (!isSlug(slug) || !Array.isArray(tags) || !tags.every(isNonEmptyString) || typeof featured !== 'boolean') {
      throw new Error(`Editorial project ${index + 1} has invalid metadata`);
    }
    return { title, slug, description, featured, tags };
  });
}

function isSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
