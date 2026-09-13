import { BASELINE_ALIASES, CompactAlias } from '@/lib/baseline_aliases';
import rules from '@/data/rules/interactions.json';
import {
  evaluateCrossInteractions,
  detectSynergies,
  type CrossInteraction,
  type SynergyAlert
} from '@/lib/cross_matrix';

export type { CrossInteraction, SynergyAlert };

export interface SuggestionItem {
  keyword: string;
  name: string;
  classId: string;
  category: 'Drug' | 'Food' | 'Supplement' | 'Nutrient';
}

export interface RedFlag {
  item: string;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sourceDrug: string;
}

export interface TimingRule {
  source: string;
  conflictingWith: string;
  rule: string;
}

export interface Depletion {
  drug: string;
  nutrient: string;
  advice: string;
}

export interface DailySchedule {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

export interface AuditResult {
  identifiedItems: string[];
  unrecognizedItems: string[];
  redFlags: RedFlag[];
  timingRules: TimingRule[];
  depletions: Depletion[];
  schedule: DailySchedule;
  crossInteractions: CrossInteraction[];
  synergyAlerts: SynergyAlert[];
}

// In-memory runtime index (starts with synchronous 2,121 baseline entries, expands dynamically on client)
let activeAliases: CompactAlias[] = [...BASELINE_ALIASES];
let fullIndexLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function loadFullIndex(): Promise<void> {
  if (fullIndexLoaded || typeof window === 'undefined') return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const response = await fetch('/data/drugs.compact.json', { cache: 'force-cache' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.c || !data.d) return;

      const expanded: CompactAlias[] = data.d.map((entry: [string, number, string]) => ({
        keyword: entry[0],
        classId: data.c[entry[1]],
        name: entry[2]
      }));

      // Merge avoiding duplicates
      const seen = new Set(activeAliases.map(a => a.keyword.toLowerCase()));
      expanded.forEach(item => {
        const key = item.keyword.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          activeAliases.push(item);
        }
      });

      fullIndexLoaded = true;
    } catch {
      // Graceful fallback to baseline aliases
    }
  })();

  return loadPromise;
}

export function detectCategory(classId: string, name: string): SuggestionItem['category'] {
  const c = classId.toLowerCase();
  const n = name.toLowerCase();

  if (
    c.startsWith('food_') ||
    c.includes('dietary_') ||
    [
      'grapefruit', 'pomelo', 'spinach', 'swiss chard', 'aged cheese', 'cheddar', 'parmesan',
      'green tea', 'black tea', 'tea', 'salt substitute', 'dairy milk', 'milk', 'yogurt',
      'licorice', 'citrus', 'orange juice', 'apple juice', 'alcohol', 'ethanol', 'wine', 'beer'
    ].some(k => c.includes(k) || n.includes(k))
  ) {
    return 'Food';
  }

  if (
    c.startsWith('mineral_') ||
    c.startsWith('vitamin_') ||
    [
      'zinc', 'copper', 'calcium', 'magnesium', 'iron', 'potassium', 'vitamin d', 'vitamin c',
      'vitamin k', 'vitamin b', 'folate', 'folic acid', 'selenium', 'electrolyte'
    ].some(k => c.includes(k) || n.includes(k))
  ) {
    return 'Nutrient';
  }

  if (
    c.startsWith('herb_') ||
    [
      'probiotic', 'curcumin', 'piperine', 'berberine', 'ashwagandha', 'st. john', 'st john',
      'cbd', 'cannabidiol', 'fish oil', 'omega-3', 'omega 3', 'melatonin', 'ginkgo', 'garlic extract',
      'ginseng', 'valerian', 'coq10', 'glucosamine', 'echinacea'
    ].some(k => c.includes(k) || n.includes(k))
  ) {
    return 'Supplement';
  }

  return 'Drug';
}

export function getItemMetadata(rawItem: string): {
  name: string;
  classId: string;
  category: SuggestionItem['category'] | 'Unrecognized';
} {
  const query = rawItem.trim().toLowerCase();
  if (!query) return { name: rawItem, classId: '', category: 'Unrecognized' };

  const match = activeAliases.find(
    a => a.keyword === query || query.includes(a.keyword) || a.keyword.includes(query)
  );

  if (!match) {
    return { name: rawItem, classId: '', category: 'Unrecognized' };
  }

  return {
    name: match.name,
    classId: match.classId,
    category: detectCategory(match.classId, match.name)
  };
}

export function searchSuggestions(query: string, limit = 8): SuggestionItem[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 1) return [];

  const results: SuggestionItem[] = [];
  const seen = new Set<string>();

  // 1. Exact match / startsWith prefix on keyword or name
  for (const item of activeAliases) {
    const kw = item.keyword.toLowerCase();
    const nm = item.name.toLowerCase();

    if (kw.startsWith(q) || nm.startsWith(q)) {
      const normalizedName = item.name;
      if (!seen.has(normalizedName)) {
        seen.add(normalizedName);
        results.push({
          keyword: item.keyword,
          name: item.name,
          classId: item.classId,
          category: detectCategory(item.classId, item.name)
        });
        if (results.length >= limit) return results;
      }
    }
  }

  // 2. Substring matches if limit not reached
  if (results.length < limit) {
    for (const item of activeAliases) {
      const kw = item.keyword.toLowerCase();
      const nm = item.name.toLowerCase();

      if (!kw.startsWith(q) && !nm.startsWith(q) && (kw.includes(q) || nm.includes(q))) {
        const normalizedName = item.name;
        if (!seen.has(normalizedName)) {
          seen.add(normalizedName);
          results.push({
            keyword: item.keyword,
            name: item.name,
            classId: item.classId,
            category: detectCategory(item.classId, item.name)
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }

  return results;
}

export function evaluateStack(userInputs: string[]): AuditResult {
  const identifiedObjects: { classId: string; name: string }[] = [];
  const identifiedNames: string[] = [];
  const unrecognizedItems: string[] = [];

  // 1. Multi-tier Matching & Tokenization
  userInputs.forEach(rawInput => {
    const query = rawInput.trim().toLowerCase();
    if (!query) return;

    // Exact match first, then substring match
    const match = activeAliases.find(
      a => a.keyword === query || query.includes(a.keyword) || a.keyword.includes(query)
    );

    if (match) {
      identifiedObjects.push({ classId: match.classId, name: match.name });
      if (!identifiedNames.includes(match.name)) {
        identifiedNames.push(match.name);
      }
    } else {
      unrecognizedItems.push(rawInput.trim());
    }
  });

  const redFlags: RedFlag[] = [];
  const timingRules: TimingRule[] = [];
  const depletions: Depletion[] = [];
  const schedule: DailySchedule = {
    morning: [],
    afternoon: [],
    evening: []
  };

  const seenClassIds = new Set<string>();

  // 2. Class-Level General Rules
  identifiedObjects.forEach(obj => {
    if (seenClassIds.has(obj.classId)) return;
    seenClassIds.add(obj.classId);

    const rule = (rules as any[]).find(r => r.classId === obj.classId);
    if (!rule) return;

    if (rule.redFlags) {
      rule.redFlags.forEach((rf: any) => {
        redFlags.push({ ...rf, sourceDrug: rule.displayName || obj.name });
      });
    }

    if (rule.timingRules) {
      rule.timingRules.forEach((tr: any) => {
        timingRules.push({ source: rule.displayName || obj.name, ...tr });
      });
    }

    if (rule.depletions) {
      rule.depletions.forEach((d: any) => {
        depletions.push({ drug: rule.displayName || obj.name, ...d });
      });
    }

    // Chronotherapy schedule window
    if (rule.recommendedSlot === 'morning') {
      schedule.morning.push(rule.displayName || obj.name);
    } else if (rule.recommendedSlot === 'evening') {
      schedule.evening.push(rule.displayName || obj.name);
    } else {
      schedule.afternoon.push(rule.displayName || obj.name);
    }
  });

  // 3. Pairwise Cross-Interactions (DDI, DNI, NNI, DFI)
  const crossInteractions = evaluateCrossInteractions(identifiedObjects);

  // 4. Multi-Agent Synergistic Cumulative Hazard Detection
  const synergyAlerts = detectSynergies(identifiedObjects);

  return {
    identifiedItems: identifiedNames,
    unrecognizedItems,
    redFlags,
    timingRules,
    depletions,
    schedule,
    crossInteractions,
    synergyAlerts
  };
}
