export function getBeatSalesUrl(slug: string) {
  if (typeof window === 'undefined') return `/b/${slug}`;
  return `${window.location.origin}/b/${slug}`;
}

export async function copyBeatSalesUrl(slug: string) {
  const url = getBeatSalesUrl(slug);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}
