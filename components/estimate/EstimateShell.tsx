type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

function SectionCard({ title, subtitle, children, className }: SectionCardProps) {
  return (
    <section className={`estimate-card ${className ?? ''}`.trim()}>
      <header className="estimate-card__header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

function FieldPlaceholder({ label }: { label: string }) {
  return (
    <label className="placeholder-field">
      <span>{label}</span>
      <div className="placeholder-input" aria-hidden="true" />
    </label>
  );
}

export function EstimateShell() {
  return (
    <main className="estimate-page">
      <div className="estimate-bg" aria-hidden="true" />

      <section className="estimate-hero estimate-card">
        <p className="estimate-badge">フェーズ1: UI土台のみ</p>
        <h1>営業専用 概算見積ツール</h1>
        <p>
          この画面は概算見積の基盤UIです。現在は入力・計算・保存ロジックを持たない静的プレースホルダーで、
          次フェーズでスコアリングと算出ロジックを追加します。
        </p>
      </section>

      <div className="estimate-grid" role="presentation">
        <div className="estimate-column">
          <SectionCard title="基本情報" subtitle="案件の前提情報を入力する領域（プレースホルダー）">
            <div className="placeholder-stack">
              <FieldPlaceholder label="案件名" />
              <FieldPlaceholder label="担当営業" />
              <FieldPlaceholder label="想定納期" />
            </div>
          </SectionCard>

          <SectionCard title="点数入力" subtitle="フェーズ2で評価項目・重み付けロジックを実装予定">
            <div className="score-placeholder">
              {['要件整理', 'UI/UX', '外部連携', '非機能要件'].map((item) => (
                <div key={item} className="score-row">
                  <span>{item}</span>
                  <div className="score-bar" aria-hidden="true" />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="estimate-column">
          <SectionCard title="概算サマリー" subtitle="見積金額・期間・リスク係数などを表示予定">
            <div className="summary-placeholder" aria-label="概算サマリーのプレースホルダー">
              <article>
                <h3>概算金額</h3>
                <p>¥ ---,---</p>
              </article>
              <article>
                <h3>想定工数</h3>
                <p>-- 人日</p>
              </article>
              <article>
                <h3>前提メモ</h3>
                <p>ロジック実装後に根拠説明を表示</p>
              </article>
            </div>
          </SectionCard>

          <SectionCard
            title="PDFプレビュー"
            subtitle="印刷/PDF化を見据えたプレビュー領域（印刷ロジックは未実装）"
            className="print-preview-shell"
          >
            <div className="print-preview" role="region" aria-label="見積書プレビュー領域">
              <div className="print-preview__page">
                <p>Estimate Preview</p>
                <p>ここに見積書レイアウトを描画予定</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <footer className="estimate-footer estimate-card">
        <p>
          社内営業向けの初期版です。認証・DB保存・履歴管理・外部連携はフェーズ対象外。
          UI構造とデザイントークンを優先して実装しています。
        </p>
      </footer>
    </main>
  );
}
