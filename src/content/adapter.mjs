import { assertHomeContent, assertProjects } from './contract.mjs';

export const PINNED_CONTRACT_VERSION = 1;
export const PINNED_SOURCE_REVISION = 'd90fe0dd3b1fa968d81a40bc22d3ebd7ad650e99';

/**
 * Adapt one reviewed senshac-content export without reaching across a network
 * or opening a write path. The result is deliberately discriminated so callers
 * cannot mistake stale or unavailable editorial data for ready content.
 *
 * @param {unknown} value
 * @returns {{ status: 'ready', content: import('./contract.mjs').HomeContent, projects: import('./contract.mjs').ProjectContent[] } | { status: 'stale', reason: string } | { status: 'missing', reason: string } | { status: 'error', error: Error }}
 */
export function adaptContentExport(value) {
  if (value === null || value === undefined) {
    return { status: 'missing', reason: 'Pinned content export is missing' };
  }

  if (!isRecord(value)) {
    return { status: 'error', error: new Error('Pinned content export must be an object') };
  }

  if (value.contractVersion !== PINNED_CONTRACT_VERSION) {
    return { status: 'stale', reason: 'Content export contract version is not supported' };
  }

  if (value.sourceRevision !== PINNED_SOURCE_REVISION) {
    return { status: 'stale', reason: 'Content export source revision is not the pinned revision' };
  }

  try {
    const content = assertHomeContent(value.content);
    const projects = assertProjects(value.projects ?? []);
    return { status: 'ready', content, projects };
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error : new Error(String(error)) };
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
