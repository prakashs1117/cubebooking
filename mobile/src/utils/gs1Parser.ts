const GS1_SEPARATOR = '\x1D'; // ASCII 29

export function parseGS1(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;

  // Handle parenthesised AI format: (01)12345678901234
  const parenthesisMatch = raw.match(/\(01\)(\d{14})/);
  if (parenthesisMatch) {
    const gtin14 = parenthesisMatch[1];
    const result = gtin14.replace(/^0+/, '') || gtin14;
    console.log('[GS1Parser] Matched parenthesis AI-01, GTIN14:', gtin14, '-> result:', result);
    return result;
  }

  // Split on GS1 group separator (handles both leading and mid-string separators)
  const segments = raw.split(GS1_SEPARATOR).filter(Boolean);
  console.log('[GS1Parser] Segments after split:', segments);

  let materialNumber: string | null = null;
  let articleNumber: string | null = null; // AI 123
  let gtinFallback: string | null = null;  // AI 01, lowest priority

  for (const seg of segments) {
    // AI 240 = material number (highest priority)
    if (seg.startsWith('240')) {
      materialNumber = seg.substring(3, 33).trim();
      console.log('[GS1Parser] Matched AI-240, materialNumber:', materialNumber);
      break;
    }
    // AI 123 = article number (second priority)
    if (seg.startsWith('123') && !articleNumber) {
      articleNumber = seg.substring(3).trim();
      console.log('[GS1Parser] Matched AI-123, articleNumber:', articleNumber);
    }
    // AI 01 = GTIN-14 (last resort among GS1 AIs)
    if (seg.startsWith('01') && seg.length >= 16 && !gtinFallback) {
      const gtin14 = seg.substring(2, 16);
      gtinFallback = gtin14.replace(/^0+/, '') || gtin14;
      console.log('[GS1Parser] Matched AI-01, GTIN14:', gtin14, '-> gtinFallback:', gtinFallback);
    }
  }

  if (materialNumber) return materialNumber;
  if (articleNumber) return articleNumber;
  if (gtinFallback) return gtinFallback;

  // Fallback: if raw looks like a material number already (alphanumeric with optional dashes)
  const trimmed = raw.trim();
  if (/^[A-Z0-9\-]+$/i.test(trimmed)) {
    console.log('[GS1Parser] Alphanumeric fallback:', trimmed);
    return trimmed;
  }

  console.log('[GS1Parser] No match, returning null');
  return null;
}
