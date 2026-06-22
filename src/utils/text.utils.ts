export const firstSentence = (s: string): string => {
  const m = s.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : s.trim();
};

export const titleFromName = (name: string, fallback = 'my-thing'): string => {
  return (name || fallback)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const joinOxford = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' or ' + items.slice(-1)[0];
};
