(function() {
  function getMeta(property) {
    // 1. Try Standard Open Graph
    let tag = document.querySelector(`meta[property="${property}"]`);
    
    // 2. Fallback to "name" attribute (Common for Twitter cards)
    if (!tag) {
      tag = document.querySelector(`meta[name="${property}"]`);
    }
    
    return tag ? tag.getAttribute('content') : null;
  }

  // Get Favicon (tries multiple types)
  let favicon = document.querySelector('link[rel="shortcut icon"]') || 
                document.querySelector('link[rel="icon"]');
  let faviconUrl = favicon ? favicon.href : '';
  
  // Scrape Data
  const data = {
    title: getMeta('og:title') || document.title || 'No Title',
    description: getMeta('og:description') || getMeta('description') || '',
    image: getMeta('og:image') || getMeta('twitter:image'),
    url: getMeta('og:url') || window.location.href,
    favicon: faviconUrl,
    hostname: window.location.hostname
  };
  
  return data;
})();