async function inspectWarfarinStructure() {
  const res = await fetch('https://medlineplus.gov/druginfo/meds/a682277.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  // Find all <section> or <div> with id
  const sections = [...html.matchAll(/<(?:section|div)\s+[^>]*id=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log('Section IDs found in Warfarin page:', sections);

  // Check dietary section snippet
  const matchDiet = html.match(/id=["'](?:dietary|special-dietary)["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i) ||
                    html.match(/<div\s+class=["'][^"']*dietary[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (matchDiet) {
    console.log('Diet match by ID/Class:', matchDiet[0].slice(0, 300));
  } else {
    // Find heading
    const h2Idx = html.indexOf('What special dietary instructions should I follow?');
    console.log('h2Idx:', h2Idx);
    if (h2Idx !== -1) {
      console.log('Surrounding HTML:', html.slice(h2Idx - 100, h2Idx + 500));
    }
  }
}

inspectWarfarinStructure();
