async function checkEncyclopediaIndex() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  console.log('Testing Encyclopedia letters...');
  const sampleLetter = 'D'; // Look for Drug / Diet
  const res = await fetch(`https://medlineplus.gov/ency/encyclopedia_${sampleLetter}.htm`, { headers });
  console.log(`Letter ${sampleLetter} status:`, res.status);
  const html = await res.text();
  const articles = [...html.matchAll(/<li[^>]*><a\s+href=["']([^"']+\.htm)["'][^>]*>(.*?)<\/a>/gi)]
    .map(m => ({ href: m[1], title: m[2].replace(/<[^>]+>/g, '').trim() }));
  
  console.log(`Total articles under ${sampleLetter}:`, articles.length);
  const drugDietArticles = articles.filter(a => 
    /drug|diet|interaction|supplement|vitamin|mineral|food/i.test(a.title)
  );
  console.log('Matching articles under D:', drugDietArticles);
}

checkEncyclopediaIndex();
