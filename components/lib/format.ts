// for showing "last seen" in conversation list(e.g. "last seen 5m ago")
export function formatLastSeen(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Last seen just now";
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (hours < 24) return `Last seen ${hours}h ago`;
  if (days === 1) return "Last seen yesterday";
  if (days < 7) return `Last seen ${days}d ago`;

  return new Date(timestamp).toLocaleString();
}  