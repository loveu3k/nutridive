async function printWarfarinDiet() {
  const res = await fetch('https://medlineplus.gov/druginfo/meds/a682277.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const dietMatch = html.match(/id=["']special-dietary["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  if (dietMatch) {
    console.log('Warfarin dietary section-body:');
    console.log(dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  }
}

printWarfarinDiet();
