/**
 * The serializable home payload exchanged with senshac-content.
 * @typedef {{ title: string, intro: string }} HomeContent
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

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
