async function inspectEncyclopediaArticle() {
  const url = 'https://medlineplus.gov/ency/article/002407.htm'; // Vitamin K in diet
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('Status:', res.status, 'Length:', html.length);
  // Look for sections
  const headings = [...html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Headings in Vitamin K article:', headings);

  // Check if interactions or side effects mentioned
  const matchText = html.match(/(?:warfarin|interaction|blood thinner|antibiotic)[\s\S]{0,300}/gi);
  console.log('Mentions found:', matchText ? matchText.slice(0, 3) : 'None');
}

inspectEncyclopediaArticle();
