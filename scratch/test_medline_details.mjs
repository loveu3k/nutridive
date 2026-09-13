async function testDetails() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  console.log('--- Testing drug_Aa.html ---');
  try {
    const res = await fetch('https://medlineplus.gov/druginfo/drug_Aa.html', { headers });
    console.log('drug_Aa status:', res.status);
    const html = await res.text();
    console.log('drug_Aa length:', html.length);
    // Find all links to /druginfo/meds/a*.html
    const drugLinks = [...html.matchAll(/href=["'](\/?druginfo\/meds\/a[^"']+\.html)["']/gi)].map(m => m[1]);
    console.log('Total drug links in A:', drugLinks.length);
    console.log('Sample drug links in A:', drugLinks.slice(0, 10));
  } catch (e) {
    console.error('Error drug_Aa:', e.message);
  }

  console.log('\n--- Testing encyclopedia.html without www ---');
  try {
    const res = await fetch('https://medlineplus.gov/encyclopedia.html', { headers });
    console.log('encyclopedia status:', res.status);
    const html = await res.text();
    console.log('encyclopedia length:', html.length);
    const encLinks = [...html.matchAll(/href=["']([^"']*(?:ency_|_browse|encyclopedia|article)[^"']*)["']/gi)].map(m => m[1]);
    console.log('Encyclopedia links count:', encLinks.length);
    console.log('Sample enc links:', [...new Set(encLinks)].slice(0, 20));
  } catch (e) {
    console.error('Error encyclopedia:', e.message);
  }
}

testDetails();
