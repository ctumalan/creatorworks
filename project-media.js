// Shared by browser and server. Never render submitted HTML.
(function (root) {
  function videoUrl(value) {
    if (typeof value !== 'string' || value.length > 5000) return '';
    let raw = value.trim();
    if (!raw) return '';
    if (raw.startsWith('<')) {
      const match = raw.match(/^<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>\s*<\/iframe>$/i);
      if (!match) return '';
      raw = match[2].replace(/&amp;/g, '&');
    }
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' || u.username || u.password || u.port) return '';
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      let id = '';
      if (host === 'youtu.be') id = u.pathname.slice(1);
      if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) id = u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
      if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (['vimeo.com', 'player.vimeo.com'].includes(host)) {
        const parts = u.pathname.match(/^\/(?:video\/)?(\d{1,15})(?:\/([a-f0-9]+))?\/?$/);
        if (parts) { const hash = parts[2] || u.searchParams.get('h'); return `https://player.vimeo.com/video/${parts[1]}${hash && /^[a-f0-9]+$/.test(hash) ? '?h=' + hash : ''}`; }
      }
      if (host === 'loom.com') { id = u.pathname.match(/^\/(?:share|embed)\/([a-f0-9]{32})\/?$/)?.[1]; if (id) return `https://www.loom.com/embed/${id}`; }
    } catch {}
    return '';
  }
  function similarProjects(current, projects, saved = new Set(), interests = new Set()) {
    const stop = new Set('your their they them with from into that this what when than have make people useful project projects tool tools help helps without more about already everyday'.split(' '));
    const words = p => new Set(`${p.category} ${p.summary || ''} ${p.purpose || ''}`.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu)?.filter(w => !stop.has(w)) || []);
    const terms = words(current);
    return projects.filter(p => p.slug !== current.slug).map(p => {
      const overlap = [...words(p)].filter(w => terms.has(w)).length;
      const related = p.category === current.category ? 20 : overlap;
      return { p, related, score: related + (saved.has(p.slug) ? 2 : 0) + (interests.has(p.category) ? 3 : 0) };
    }).filter(x => x.related > 0).sort((a, b) => b.score - a.score || b.p.recentOrder - a.p.recentOrder).slice(0, 3).map(x => x.p);
  }
  root.CWMedia = { videoUrl, similarProjects };
})(globalThis);
