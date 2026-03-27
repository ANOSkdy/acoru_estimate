import type { EstimateScores } from '@/lib/estimate';

export type EstimatePreset = {
  id: string;
  label: string;
  description: string;
  suggestedCustomerName?: string;
  suggestedProjectName?: string;
  scores: EstimateScores;
  note?: string;
};

export const ESTIMATE_PRESETS: EstimatePreset[] = [
  {
    id: 'corporate-site',
    label: 'コーポレートサイト',
    description: '会社情報・事業紹介・お問い合わせを中心とした標準的な構成。',
    suggestedProjectName: 'コーポレートサイト制作',
    scores: { screen: 8, feature: 7, operation: 4 },
    note: '公開後の更新運用（ニュース投稿など）の範囲確認で上下しやすいです。',
  },
  {
    id: 'lp-campaign',
    label: 'LP / キャンペーンサイト',
    description: '短期施策向けの単一〜少数ページ中心の構成。',
    suggestedProjectName: 'LP / キャンペーンサイト制作',
    scores: { screen: 5, feature: 4, operation: 2 },
    note: 'ABテストや計測タグ要件がある場合は機能点を追加してください。',
  },
  {
    id: 'inquiry-management',
    label: 'お問い合わせ管理システム',
    description: '問い合わせ受付・ステータス管理・担当アサインを想定。',
    suggestedProjectName: 'お問い合わせ管理システム構築',
    scores: { screen: 9, feature: 11, operation: 6 },
    note: '通知ルールとエスカレーション運用の有無で運用負荷が増減します。',
  },
  {
    id: 'crm',
    label: '顧客管理システム（CRM）',
    description: '顧客台帳・履歴管理・セグメント活用を想定した標準CRM。',
    suggestedProjectName: '顧客管理システム（CRM）導入',
    scores: { screen: 14, feature: 17, operation: 9 },
    note: '既存データ移行と重複統合ルールの確認で点数調整しやすいです。',
  },
  {
    id: 'sfa',
    label: '営業支援システム（SFA）',
    description: '商談・活動・予実管理を含む営業向け運用基盤。',
    suggestedProjectName: '営業支援システム（SFA）構築',
    scores: { screen: 15, feature: 18, operation: 10 },
    note: 'モバイル利用や入力ルール厳格化がある場合は画面点・運用負荷点を追加。',
  },
  {
    id: 'deal-management',
    label: '案件管理システム',
    description: '案件進捗・担当・見込金額を管理するパイプライン型。',
    suggestedProjectName: '案件管理システム導入',
    scores: { screen: 13, feature: 15, operation: 8 },
    note: '承認フローが増える場合は機能点と運用負荷点を加点してください。',
  },
  {
    id: 'attendance',
    label: '勤怠管理システム',
    description: '打刻・申請・承認・締め処理までの勤怠運用を想定。',
    suggestedProjectName: '勤怠管理システム導入',
    scores: { screen: 14, feature: 16, operation: 11 },
    note: '就業規則の複雑さやシフト管理要件で運用負荷が上がります。',
  },
  {
    id: 'reservation',
    label: '予約管理システム',
    description: '空き枠管理・予約受付・リマインド通知を中心とした構成。',
    suggestedProjectName: '予約管理システム構築',
    scores: { screen: 12, feature: 14, operation: 8 },
    note: '外部カレンダー連携や複数拠点管理の有無を初回に確認してください。',
  },
  {
    id: 'inventory',
    label: '在庫管理システム',
    description: '入出庫・棚卸・在庫照会を行う業務アプリ想定。',
    suggestedProjectName: '在庫管理システム刷新',
    scores: { screen: 15, feature: 19, operation: 11 },
    note: 'バーコード運用やロット管理要件がある場合は機能点を追加。',
  },
  {
    id: 'order-management',
    label: '受発注管理システム',
    description: '受注〜発注〜納品管理を一元化する基幹寄り構成。',
    suggestedProjectName: '受発注管理システム構築',
    scores: { screen: 16, feature: 20, operation: 12 },
    note: '取引先別の業務ルール差分が多いほど調整コストが増えやすいです。',
  },
  {
    id: 'member-mypage',
    label: '会員サイト / マイページ',
    description: '会員向け情報閲覧・登録情報編集・通知確認を想定。',
    suggestedProjectName: '会員サイト / マイページ構築',
    scores: { screen: 13, feature: 18, operation: 9 },
    note: '権限ロールや公開範囲条件が複雑な場合は機能点を加点してください。',
  },
  {
    id: 'report-dashboard',
    label: 'レポート / 集計ダッシュボード',
    description: '集計可視化・期間比較・CSV出力を中心とした分析画面。',
    suggestedProjectName: 'レポート / 集計ダッシュボード開発',
    scores: { screen: 11, feature: 15, operation: 7 },
    note: 'データ連携元が増えると機能点と運用負荷点が上がりやすいです。',
  },
  {
    id: 'workflow-approval',
    label: '社内ワークフロー / 申請承認システム',
    description: '申請フォーム・承認経路・差戻し対応を含む社内基盤。',
    suggestedProjectName: '社内ワークフロー / 申請承認システム導入',
    scores: { screen: 16, feature: 19, operation: 12 },
    note: '申請種別の追加見込みがある場合は初期段階で余裕を持って見積ください。',
  },
];

export function findEstimatePresetById(id: string | null): EstimatePreset | null {
  if (!id) {
    return null;
  }

  return ESTIMATE_PRESETS.find((preset) => preset.id === id) ?? null;
}
