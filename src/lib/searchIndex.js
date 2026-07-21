function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function searchEntries(entries, lang, query, limit = 6) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored = entries
    .filter((e) => e.lang === lang)
    .map((e) => {
      const title = normalize(e.title);
      const text = normalize(e.text || '');
      let score = 0;
      if (title.includes(q)) score += 5;
      for (const w of words) {
        if (title.includes(w)) score += 3;
        if (text.includes(w)) score += 1;
      }
      return { entry: e, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);

  return scored;
}
