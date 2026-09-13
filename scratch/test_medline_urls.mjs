async function inspectPages() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  console.log('--- 1. Testing Drug Information Page ---');
  try {
    const res1 = await fetch('https://medlineplus.gov/druginformation.html', { headers });
    console.log('druginformation.html status:', res1.status);
    const html1 = await res1.text();
    // Look for Browse by generic or brand name links
    const drugBrowseLinks = [...html1.matchAll(/href=["']([^"']*(?:drug_|browse|drugs)[^"']*)["']/gi)].map(m => m[1]);
    console.log('Drug browse links found:', [...new Set(drugBrowseLinks)]);
  } catch (e) {
    console.error('Error 1:', e.message);
  }

  console.log('\n--- 2. Testing Encyclopedia A-Z Page ---');
  try {
    const res2 = await fetch('https://medlineplus.gov/encyclopedia.html', { headers });
    console.log('encyclopedia.html status:', res2.status);
    const html2 = await res2.text();
    // Look for A-Z links
    const encLinks = [...html2.matchAll(/href=["']([^"']*(?:ency_|_browse|encyclopedia)[^"']*)["']/gi)].map(m => m[1]);
    console.log('Encyclopedia browse links found:', [...new Set(encLinks)].slice(0, 30));
  } catch (e) {
    console.error('Error 2:', e.message);
  }

  console.log('\n--- 3. Testing herb_All.html ---');
  try {
    const res3 = await fetch('https://medlineplus.gov/druginfo/herb_All.html', { headers, redirect: 'follow' });
    console.log('herb_All.html status:', res3.status, 'url:', res3.url);
    const html3 = await res3.text();
    console.log('herb_All.html length:', html3.length);
    const herbLinks = [...html3.matchAll(/href=["']([^"']*(?:herb|natural|nccih|herbs)[^"']*)["']/gi)].map(m => m[1]);
    console.log('Herb links count:', herbLinks.length);
    console.log('Sample herb links:', [...new Set(herbLinks)].slice(0, 15));
  } catch (e) {
    console.error('Error 3:', e.message);
  }
}

inspectPages();
