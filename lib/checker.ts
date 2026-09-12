import aliases from '@/data/aliases/drugs.json';
import rules from '@/data/rules/interactions.json';

export interface AuditResult {
  identifiedItems: string[];
  redFlags: { item: string; reason: string; severity: string; sourceDrug: string }[];
  timingRules: { source: string; conflictingWith: string; rule: string }[];
  depletions: { drug: string; nutrient: string; advice: string }[];
  schedule: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
}

export function evaluateStack(userInputs: string[]): AuditResult {
  const matchedClassIds = new Set<string>();
  const identifiedNames: string[] = [];

  userInputs.forEach(input => {
    const query = input.trim().toLowerCase();
    const match = aliases.find(a => query.includes(a.keyword) || a.keyword.includes(query));
    if (match) {
      matchedClassIds.add(match.classId);
      identifiedNames.push(match.name);
    } else {
      identifiedNames.push(input.trim());
    }
  });

  const redFlags: AuditResult['redFlags'] = [];
  const timingRules: AuditResult['timingRules'] = [];
  const depletions: AuditResult['depletions'] = [];
  const schedule: AuditResult['schedule'] = {
    morning: [],
    afternoon: [],
    evening: []
  };

  matchedClassIds.forEach(id => {
    const rule = rules.find(r => r.classId === id);
    if (!rule) return;

    // Red flags
    rule.redFlags.forEach(rf => {
      redFlags.push({ ...rf, sourceDrug: rule.displayName });
    });

    // Timing rules
    rule.timingRules.forEach(tr => {
      timingRules.push({ source: rule.displayName, ...tr });
    });

    // Depletions
    rule.depletions.forEach(d => {
      depletions.push({ drug: rule.displayName, ...d });
    });

    // Daily slot
    if (rule.recommendedSlot === 'morning') {
      schedule.morning.push(rule.displayName);
    } else if (rule.recommendedSlot === 'evening') {
      schedule.evening.push(rule.displayName);
    } else {
      schedule.afternoon.push(rule.displayName);
    }
  });

  return {
    identifiedItems: identifiedNames,
    redFlags,
    timingRules,
    depletions,
    schedule
  };
}
