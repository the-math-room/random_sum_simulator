export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4
  });
}

export function roundNice(value) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}