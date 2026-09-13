async function getNCCIHHerbs() {
  const res = await fetch('https://www.nccih.nih.gov/health/herbsataglance');
  const html = await res.text();
  // Links inside the main content listing herbs
  // e.g., <a href="/health/ashwagandha">Ashwagandha</a>
  const regex = /<a[^>]+href=["'](\/health\/[a-z0-9-]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const herbs = [];
  const seen = new Set();
  
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = 'https://www.nccih.nih.gov' + match[1];
    const name = match[2].replace(/<[^>]+>/g, '').trim();
    // Exclude general navigation links
    if (
      !match[1].includes('atoz') &&
      !match[1].includes('pain') &&
      !match[1].includes('tips') &&
      !match[1].includes('safety') &&
      !match[1].includes('providers') &&
      !match[1].includes('know-science') &&
      !match[1].includes('herbsataglance') &&
      !match[1].includes('espanol') &&
      !seen.has(url) &&
      name.length > 1
    ) {
      seen.add(url);
      herbs.push({ name, url, slug: match[1].replace('/health/', '') });
    }
  }
  
  console.log(`Extracted ${herbs.length} NCCIH Herbs!`);
  console.log('Sample 10 herbs:', herbs.slice(0, 10));
}

getNCCIHHerbs();
