import fs from 'fs';
import path from 'path';

const ODS_DIR = path.join(process.cwd(), 'data/raw_sources/ods');
const OUTPUT_FILE = path.join(process.cwd(), 'data/rules/ods_extracted_rules.json');

/**
 * Parses downloaded NIH ODS HealthProfessional & Consumer HTML fact sheets
 * and extracts structured drug-nutrient interactions & timing rules.
 */
function parseOdsDirectory() {
  if (!fs.existsSync(ODS_DIR)) {
    console.error(`Error: Directory ${ODS_DIR} does not exist.`);
    return;
  }

  // Find all .html files recursively
  const htmlFiles = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scan(full);
      } else if (ent.isFile() && (ent.name.endsWith('.html') || ent.name.endsWith('.htm'))) {
        htmlFiles.push(full);
      }
    }
  }
  scan(ODS_DIR);

  if (htmlFiles.length === 0) {
    console.log(`\n⚠️  No HTML files found in data/raw_sources/ods/`);
    console.log(`👉 Please download the URLs in data/raw_sources/ods_urls.txt using Free Download Manager and save them to data/raw_sources/ods/`);
    return;
  }

  console.log(`\nFound ${htmlFiles.length} NIH ODS HTML files to parse.`);
  const extractedRules = [];

  for (const filePath of htmlFiles) {
    const rawHtml = fs.readFileSync(filePath, 'utf-8');

    // 1. Extract Nutrient / Botanical Name from <title> or <h1>
    let nutrientName = path.basename(filePath, path.extname(filePath)).replace(/-(HealthProfessional|Consumer)$/i, '');
    const h1Match = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      nutrientName = h1Match[1].replace(/<[^>]+>/g, '').replace(/Fact Sheet for (Health Professionals|Consumers)/i, '').trim();
    }

    // 2. Extract "Interactions with Medications" section
    const interactionMatch = rawHtml.match(/Interactions with Medications[\s\S]*?(?=<h2|<\/body|$)/i);
    if (!interactionMatch) {
      continue;
    }

    const sectionContent = interactionMatch[0];

    // 3. Extract subheadings (<h3> or <h4>) within interactions
    const subheadings = [];
    const subRegex = /<h[34][^>]*>([\s\S]*?)<\/h[34]>([\s\S]*?)(?=<h[34]|$)/gi;
    let match;
    while ((match = subRegex.exec(sectionContent)) !== null) {
      const drugHeading = match[1].replace(/<[^>]+>/g, '').trim();
      const body = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (drugHeading && body) {
        subheadings.push({ drugHeading, body });
      }
    }

    // 4. Extract Timing Rules & Clinical Guidance
    const rulesForNutrient = [];

    if (subheadings.length > 0) {
      for (const item of subheadings) {
        // Extract timing sentences
        const timingSentenceMatch = item.body.match(/([^.]*(?:take|separate|hours|spacing|before|after)[^.]*\.)/i);
        const timingRule = timingSentenceMatch ? timingSentenceMatch[0].trim() : null;

        rulesForNutrient.push({
          conflictingMedication: item.drugHeading,
          clinicalExplanation: item.body.slice(0, 350) + (item.body.length > 350 ? '...' : ''),
          timingRule: timingRule || 'Stagger intake or consult physician.'
        });
      }
    } else {
      // General paragraph parse
      const plainText = sectionContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      rulesForNutrient.push({
        conflictingMedication: 'Multiple prescription medications',
        clinicalExplanation: plainText.slice(0, 400) + '...',
        timingRule: 'Separate administration from prescription medications.'
      });
    }

    extractedRules.push({
      nutrient: nutrientName,
      file: path.basename(filePath),
      interactions: rulesForNutrient
    });
  }

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extractedRules, null, 2), 'utf-8');

  console.log(`✅ Successfully extracted ${extractedRules.length} nutrient interaction profiles!`);
  console.log(`📁 Output saved to: ${OUTPUT_FILE}`);
}

parseOdsDirectory();
