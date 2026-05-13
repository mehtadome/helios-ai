export function formatRelative(createdAt: string): string {
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return createdAt; // legacy "Just now" / "X min ago" strings
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
