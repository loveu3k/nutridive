import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 目标源目录
const FDA_DIR = process.env.FDA_LABEL_DIR || 'E:\\nutridive\\drug\\label';
const OUTPUT_ALIASES = path.join(process.cwd(), 'data/aliases/drugs.json');
const OUTPUT_RAW_INTERACTIONS = path.join(process.cwd(), 'data/rules/extracted_food_rules.json');

// 常见高频相互作用食物关键字过滤池
const FOOD_KEYWORDS = [
  'grapefruit', 'pomelo', 'alcohol', 'ethanol', 'dairy', 'milk', 'calcium',
  'iron', 'potassium', 'salt substitute', 'tyramine', 'spinach', 'vitamin k',
  'high fiber', 'soy', "st. john's wort", 'ginkgo', 'garlic', 'licorice'
];

// 临床已知相互作用类别映射增强
const CLINICAL_CLASS_MAP = [
  { test: /atorvastatin|simvastatin|lovastatin/, classId: 'statin_cyp3a4' },
  { test: /metformin/, classId: 'metformin' },
  { test: /levothyroxine/, classId: 'levothyroxine' },
  { test: /warfarin/, classId: 'warfarin' },
  { test: /lisinopril|enalapril|ramipril|captopril|benazepril/, classId: 'ace_inhibitor' },
  { test: /omeprazole|pantoprazole|esomeprazole/, classId: 'ppi_omeprazole' },
  { test: /amlodipine|nifedipine/, classId: 'ccb_antihypertensive' },
  { test: /calcium/, classId: 'mineral_calcium' },
  { test: /fish oil|omega-3/, classId: 'supp_omega3' }
];

function resolveClassId(canonicalGeneric, pharmClasses) {
  for (const item of CLINICAL_CLASS_MAP) {
    if (item.test.test(canonicalGeneric)) {
      return item.classId;
    }
  }
  if (pharmClasses && pharmClasses[0]) {
    return pharmClasses[0].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  return canonicalGeneric.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

async function processLabels() {
  if (!fs.existsSync(FDA_DIR)) {
    console.error(`Directory not found: ${FDA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FDA_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} openFDA JSON files to process...`);

  const aliasMap = new Map(); // keyword -> { keyword, classId, name }
  const foodRuleDetections = [];

  // 1. 预载入现有高质量基础别名（避免丢失膳食补充剂及已校准类目）
  if (fs.existsSync(OUTPUT_ALIASES)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_ALIASES, 'utf-8'));
      for (const a of existing) {
        if (a && a.keyword) {
          aliasMap.set(a.keyword.trim().toLowerCase(), a);
        }
      }
      console.log(`Pre-seeded ${aliasMap.size} existing clinical aliases and supplement mappings.`);
    } catch (err) {
      console.warn('Could not read existing aliases file:', err.message);
    }
  }

  // 2. 逐一流式扫描 FDA Label JSON 文件（彻底规避 512MB 字符串与堆栈溢出限制）
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(FDA_DIR, files[i]);
    const fileStats = fs.statSync(filePath);
    console.log(`[${i + 1}/${files.length}] Streaming: ${files[i]} (${(fileStats.size / (1024 * 1024)).toFixed(1)} MB)...`);

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    let inResults = false;
    let recordBuffer = [];
    let processedRecords = 0;

    for await (const line of rl) {
      if (!inResults) {
        if (line.includes('"results": [')) {
          inResults = true;
        }
        continue;
      }

      if (line === '    {') {
        recordBuffer = ['{'];
      } else if (recordBuffer.length > 0) {
        if (line === '    },' || line === '    }') {
          recordBuffer.push('}');
          const rawItemJson = recordBuffer.join('\n');
          recordBuffer = [];

          try {
            const item = JSON.parse(rawItemJson);
            processedRecords++;

            const openfda = item.openfda;
            if (!openfda) continue;

            const brandNames = openfda.brand_name || [];
            const genericNames = openfda.generic_name || [];
            const pharmClasses = openfda.pharm_class_epc || openfda.pharm_class_cs || [];

            if (genericNames.length === 0 && brandNames.length === 0) continue;

            // 生成规范主名与分类标识
            const canonicalGeneric = (genericNames[0] || brandNames[0]).toLowerCase();
            const displayName = brandNames[0]
              ? `${brandNames[0]} (${genericNames[0] || 'Generic'})`
              : genericNames[0];

            // 提取类别 ID (归一化到药理大类或首选通用名)
            const classId = resolveClassId(canonicalGeneric, pharmClasses);

            // 录入商品名与通用名索引
            const allKeywords = [...brandNames, ...genericNames];
            for (const kw of allKeywords) {
              const cleanKw = kw.trim().toLowerCase();
              if (cleanKw.length >= 3 && !aliasMap.has(cleanKw)) {
                aliasMap.set(cleanKw, {
                  keyword: cleanKw,
                  classId: classId,
                  name: displayName
                });
              }
            }

            // 检索说明书中的食物与饮食相互作用段落
            const interactionTexts = [
              ...(item.drug_interactions || []),
              ...(item.food_safety || []),
              ...(item.dosage_and_administration || [])
            ].join(' ');

            if (interactionTexts) {
              const lowerText = interactionTexts.toLowerCase();
              for (const kw of FOOD_KEYWORDS) {
                if (lowerText.includes(kw)) {
                  foodRuleDetections.push({
                    drugGeneric: canonicalGeneric,
                    drugClass: classId,
                    displayName: displayName,
                    triggerFood: kw,
                    excerpt: interactionTexts.slice(0, 300) // 截取前 300 字符留作临床机制核对
                  });
                  break;
                }
              }
            }
          } catch {
            // 容错处理单个记录解析异常
          }
        } else {
          recordBuffer.push(line);
        }
      }
    }

    console.log(`  -> Finished ${files[i]}: parsed ${processedRecords} records. Total aliases so far: ${aliasMap.size}`);
  }

  // 写入精简别名库
  const aliasesArray = Array.from(aliasMap.values());
  fs.writeFileSync(OUTPUT_ALIASES, JSON.stringify(aliasesArray, null, 2), 'utf-8');
  console.log(`Successfully compiled ${aliasesArray.length} aliases into: ${OUTPUT_ALIASES}`);

  // 写入提取出的食物规则候选池
  fs.writeFileSync(OUTPUT_RAW_INTERACTIONS, JSON.stringify(foodRuleDetections, null, 2), 'utf-8');
  console.log(`Saved ${foodRuleDetections.length} candidate food interaction mentions to: ${OUTPUT_RAW_INTERACTIONS}`);
}

processLabels();
