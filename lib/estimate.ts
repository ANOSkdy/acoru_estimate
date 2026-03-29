export const BASE_MONTHLY_FEE = 30_000;
export const SCORE_UNIT_PRICE = 1_000;
export const MAX_SCORE_PER_BUCKET = 999;
export const PERSON_MONTHS_PER_SCORE = 0.15;
export const WORKING_DAYS_PER_PERSON_MONTH = 20;

export type ScoreBucketKey = 'screen' | 'feature' | 'operation';

export type EstimateScores = {
  screen: number;
  feature: number;
  operation: number;
};

export type BasicInfo = {
  customerName: string;
  projectName: string;
  estimateDate: string;
  notes: string;
};

export type ScoreHint = {
  key: string;
  label: string;
  effects: EstimateScores;
};

export const SCORE_HINTS: ScoreHint[] = [
  { key: 'list', label: '一覧画面', effects: { screen: 2, feature: 1, operation: 0 } },
  { key: 'detail', label: '詳細画面', effects: { screen: 1, feature: 1, operation: 0 } },
  { key: 'form', label: '登録/編集画面', effects: { screen: 2, feature: 2, operation: 1 } },
  { key: 'admin', label: '管理画面', effects: { screen: 1, feature: 2, operation: 1 } },
  { key: 'search', label: '検索/絞込', effects: { screen: 1, feature: 2, operation: 0 } },
  { key: 'csv', label: 'CSV/Excel', effects: { screen: 0, feature: 2, operation: 1 } },
  { key: 'api', label: 'API連携', effects: { screen: 0, feature: 3, operation: 1 } },
  { key: 'upload', label: '画像アップロード', effects: { screen: 1, feature: 2, operation: 1 } },
  { key: 'users', label: 'ユーザー数多め', effects: { screen: 0, feature: 1, operation: 2 } },
  { key: 'data', label: 'データ量多め', effects: { screen: 0, feature: 1, operation: 3 } },
];

export const INITIAL_SCORES: EstimateScores = {
  screen: 0,
  feature: 0,
  operation: 0,
};

export const INITIAL_BASIC_INFO = (today: string): BasicInfo => ({
  customerName: '',
  projectName: '',
  estimateDate: today,
  notes: '',
});

export const SAMPLE_BASIC_INFO = (today: string): BasicInfo => ({
  customerName: '株式会社サンプル商事',
  projectName: '受発注管理システム刷新',
  estimateDate: today,
  notes: '既存Excel業務をWeb化。将来的に外部SaaSとの連携を想定。',
});

export const SAMPLE_SCORES: EstimateScores = {
  screen: 14,
  feature: 18,
  operation: 8,
};

export function sanitizeScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(MAX_SCORE_PER_BUCKET, Math.max(0, Math.floor(value)));
}

export function coerceScoreInput(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  const normalized = trimmed.replace(/[^\d-]/g, '');
  if (!normalized || normalized === '-') {
    return 0;
  }

  return sanitizeScore(Number(normalized));
}

export function sumScores(scores: EstimateScores): number {
  return sanitizeScore(scores.screen) + sanitizeScore(scores.feature) + sanitizeScore(scores.operation);
}

export function calculateEstimate(scores: EstimateScores) {
  const totalScore = sumScores(scores);
  const scoreAddOn = totalScore * SCORE_UNIT_PRICE;
  const monthlyFee = BASE_MONTHLY_FEE + scoreAddOn;
  const effortPersonMonths = Number((totalScore * PERSON_MONTHS_PER_SCORE).toFixed(1));
  const effortPersonDays = Math.round(effortPersonMonths * WORKING_DAYS_PER_PERSON_MONTH);

  return {
    totalScore,
    scoreAddOn,
    monthlyFee,
    effortPersonMonths,
    effortPersonDays,
  };
}

export function getScaleLabel(totalScore: number): '小規模' | '中規模' | '大規模' {
  if (totalScore >= 60) {
    return '大規模';
  }

  if (totalScore >= 30) {
    return '中規模';
  }

  return '小規模';
}

export function applyScoreDelta(current: EstimateScores, delta: EstimateScores): EstimateScores {
  return {
    screen: sanitizeScore(current.screen + delta.screen),
    feature: sanitizeScore(current.feature + delta.feature),
    operation: sanitizeScore(current.operation + delta.operation),
  };
}
