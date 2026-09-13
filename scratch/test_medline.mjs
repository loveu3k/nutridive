async function testNCCIH() {
  const res = await fetch('https://www.nccih.nih.gov/health/herbsataglance');
  console.log('NCCIH Status:', res.status);
  const html = await res.text();
  console.log('NCCIH Length:', html.length);
  const matches = [...html.matchAll(/href=["'](\/health\/[^"']+)["']/g)];
  console.log('Found health links:', matches.length);
  console.log('Sample:', matches.slice(0, 10).map(m => m[1]));
}
testNCCIH();
