export function formatPermission(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}