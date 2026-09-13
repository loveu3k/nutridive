async function analyzeHerbAll() {
  const res = await fetch('https://medlineplus.gov/druginfo/herb_All.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const allLinks = [...html.matchAll(/<li[^>]*><a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)]
    .map(m => ({ href: m[1], name: m[2].replace(/<[^>]+>/g, '').trim() }));

  console.log('Total li-a links found on herb_All.html:', allLinks.length);
  const nccihLinks = allLinks.filter(l => l.href.includes('nccih.nih.gov'));
  const otherLinks = allLinks.filter(l => !l.href.includes('nccih.nih.gov'));
  console.log(`NCCIH links: ${nccihLinks.length}`);
  console.log(`Other links: ${otherLinks.length}`);
  console.log('Sample NCCIH links:', nccihLinks.slice(0, 5));
  if (otherLinks.length > 0) {
    console.log('Other links:', otherLinks);
  }
}

analyzeHerbAll();
