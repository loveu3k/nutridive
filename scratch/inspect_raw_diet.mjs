async function inspectRawSpecialDietary() {
  const res = await fetch('https://medlineplus.gov/druginfo/meds/a682277.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const idx = html.indexOf('id="special-dietary"');
  if (idx !== -1) {
    console.log(html.slice(idx, idx + 1000));
  } else {
    console.log('Not found');
  }
}

inspectRawSpecialDietary();
