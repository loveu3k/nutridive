async function testSafetySection() {
  const res = await fetch('https://www.nccih.nih.gov/health/st-johns-wort');
  const html = await res.text();
  const match = html.match(/What Do We Know About Safety\?[\s\S]*?(?=Keep in Mind|For More Information|$)/i);
  if (match) {
    console.log('SAFETY SECTION:\n', match[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1500));
  }
}
testSafetySection();
