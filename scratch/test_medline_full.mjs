async function countAllHerbsInMedline() {
  const res = await fetch('https://medlineplus.gov/druginfo/herb_All.html');
  const html = await res.text();
  const matches = [...html.matchAll(/<a[^>]+href=["'](https:\/\/www\.nccih\.nih\.gov\/health\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  console.log('MedlinePlus links to NCCIH herbs count:', matches.length);
  const sample = matches.slice(0, 15).map(m => ({ name: m[2].replace(/<[^>]+>/g, '').trim(), url: m[1] }));
  console.log('Sample herbs from herb_All.html:\n', sample);
}
countAllHerbsInMedline();
