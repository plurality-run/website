import { getCollection } from 'astro:content';
import { isPublished } from './publication';

export async function getPublishedUpdates() {
  const updates = await getCollection('updates', (entry) => isPublished(entry));
  return updates.sort((a, b) =>
    b.data.published.getTime() - a.data.published.getTime() || a.id.localeCompare(b.id),
  );
}
