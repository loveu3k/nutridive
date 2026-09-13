async function testWarfarinDiet() {
  const res = await fetch('https://medlineplus.gov/druginfo/meds/a682277.html');
  const html = await res.text();
  const idx = html.lastIndexOf('What special dietary instructions should I follow?');
  const after = html.slice(idx, idx + 2500);
  console.log('REAL DIETARY SECTION:\n', after.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}
testWarfarinDiet();
