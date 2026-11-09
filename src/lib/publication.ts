export function isPublished(
  entry: { data: { draft: boolean; published: Date } },
  now = new Date(),
): boolean {
  return !entry.data.draft && entry.data.published.getTime() <= now.getTime();
}
