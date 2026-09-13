async function inspectAaSnippet() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  try {
    const res = await fetch('https://medlineplus.gov/druginfo/drug_Aa.html', { headers });
    const html = await res.text();
    // find all hrefs in the main body / list
    const allHrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)];
    console.log('Total a tags in drug_Aa:', allHrefs.length);
    const drugItems = allHrefs
      .filter(m => m[1].includes('meds/') || m[1].includes('/druginfo/'))
      .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }));
    console.log('Drug items count:', drugItems.length);
    console.log('First 15 drug items:', drugItems.slice(0, 15));
  } catch (e) {
    console.error('Error Aa:', e);
  }

  try {
    const encRes = await fetch('https://medlineplus.gov/encyclopedia.html', {
      headers,
      signal: AbortSignal.timeout(10000)
    });
    console.log('Enc status:', encRes.status);
  } catch (e) {
    console.error('Enc error detail:', e.cause || e);
  }
}

inspectAaSnippet();
