export function decodeSafeLinksURL(safeLinksUrl: string) {
  if (!safeLinksUrl.match(/\.safelinks\.protection\.outlook\.com/)) {
    throw new Error('SAFE_LINK_INVALID');
  }

  return new URL(safeLinksUrl).searchParams.get('url') ?? '';
}
