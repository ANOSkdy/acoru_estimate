'use client';

import { useMemo, useState } from 'react';
import {
  applyScoreDelta,
  calculateEstimate,
  getScaleLabel,
  INITIAL_BASIC_INFO,
  INITIAL_SCORES,
  SAMPLE_BASIC_INFO,
  SAMPLE_SCORES,
  SCORE_HINTS,
  type BasicInfo,
  type EstimateScores,
  type ScoreBucketKey,
  BASE_MONTHLY_FEE,
  SCORE_UNIT_PRICE,
} from '@/lib/estimate';

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

function formatYen(value: number) {
  return value.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  });
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function ScoreControl({
  label,
  value,
  onStep,
  onChange,
}: {
  label: string;
  value: number;
  onStep: (delta: number) => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className="score-input">
      <label>{label}</label>
      <div className="score-input__controls">
        <button type="button" onClick={() => onStep(-1)} aria-label={`${label}を1減らす`}>
          −
        </button>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <button type="button" onClick={() => onStep(1)} aria-label={`${label}を1増やす`}>
          ＋
        </button>
      </div>
    </div>
  );
}

export function EstimateShell() {
  const today = todayISODate();
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(INITIAL_BASIC_INFO(today));
  const [scores, setScores] = useState<EstimateScores>(INITIAL_SCORES);

  const result = useMemo(() => calculateEstimate(scores), [scores]);
  const scaleLabel = useMemo(() => getScaleLabel(result.totalScore), [result.totalScore]);

  const setScore = (key: ScoreBucketKey, nextValue: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: Math.max(0, Number.isFinite(nextValue) ? Math.floor(nextValue) : 0),
    }));
  };

  const stepScore = (key: ScoreBucketKey, delta: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const applyHint = (effects: EstimateScores) => {
    setScores((prev) => applyScoreDelta(prev, effects));
  };

  const handleReset = () => {
    setBasicInfo(INITIAL_BASIC_INFO(today));
    setScores(INITIAL_SCORES);
  };

  const handleSample = () => {
    setBasicInfo(SAMPLE_BASIC_INFO(today));
    setScores(SAMPLE_SCORES);
  };

  const handleClearScores = () => {
    setScores(INITIAL_SCORES);
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.print();
  };

  return (
    <main className="estimate-page">
      <div className="estimate-bg" aria-hidden="true" />

      <section className="estimate-hero estimate-card">
        <p className="estimate-badge">フェーズ2: 見積入力 + 自動計算</p>
        <h1>営業専用 概算見積ツール</h1>
        <p>
          その場で入力しながら概算を提示できます。DB保存なしの軽量版として、基本情報・点数・見積金額を1ページで確認可能です。
        </p>
      </section>

      <div className="estimate-actions estimate-card" role="group" aria-label="見積アクション">
        <button type="button" className="btn btn--ghost" onClick={handleReset}>
          リセット
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSample}>
          サンプル入力
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleClearScores}>
          点数のみクリア
        </button>
        <button type="button" className="btn btn--print" onClick={handlePrint}>
          印刷 / PDF保存
        </button>
      </div>

      <div className="estimate-grid" role="presentation">
        <div className="estimate-column">
          <SectionCard title="基本情報" subtitle="商談中に必要な最小情報を入力">
            <div className="field-grid">
              <label className="form-field">
                <span>顧客名</span>
                <input
                  type="text"
                  value={basicInfo.customerName}
                  onChange={(event) =>
                    setBasicInfo((prev) => ({ ...prev, customerName: event.target.value }))
                  }
                />
              </label>
              <label className="form-field">
                <span>案件名</span>
                <input
                  type="text"
                  value={basicInfo.projectName}
                  onChange={(event) =>
                    setBasicInfo((prev) => ({ ...prev, projectName: event.target.value }))
                  }
                />
              </label>
              <label className="form-field">
                <span>見積日</span>
                <input
                  type="date"
                  value={basicInfo.estimateDate}
                  onChange={(event) =>
                    setBasicInfo((prev) => ({ ...prev, estimateDate: event.target.value }))
                  }
                />
              </label>
              <label className="form-field form-field--full">
                <span>備考</span>
                <textarea
                  rows={3}
                  value={basicInfo.notes}
                  onChange={(event) => setBasicInfo((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard title="点数入力" subtitle="画面点・機能点・運用負荷点を直接入力">
            <div className="score-grid">
              <ScoreControl
                label="画面点"
                value={scores.screen}
                onStep={(delta) => stepScore('screen', delta)}
                onChange={(value) => setScore('screen', value)}
              />
              <ScoreControl
                label="機能点"
                value={scores.feature}
                onStep={(delta) => stepScore('feature', delta)}
                onChange={(value) => setScore('feature', value)}
              />
              <ScoreControl
                label="運用負荷点"
                value={scores.operation}
                onStep={(delta) => stepScore('operation', delta)}
                onChange={(value) => setScore('operation', value)}
              />
            </div>
          </SectionCard>

          <SectionCard title="補助加点" subtitle="よくある要件をワンクリックで加点">
            <div className="hint-buttons">
              {SCORE_HINTS.map((hint) => (
                <button
                  key={hint.key}
                  type="button"
                  className="hint-button"
                  onClick={() => applyHint(hint.effects)}
                >
                  {hint.label}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="estimate-column">
          <SectionCard title="概算サマリー" subtitle="入力内容と計算結果をリアルタイム表示">
            <div className="summary-list" aria-live="polite">
              <article>
                <h3>合計点</h3>
                <p>{result.totalScore} 点</p>
              </article>
              <article>
                <h3>基本料金</h3>
                <p>{formatYen(BASE_MONTHLY_FEE)}</p>
              </article>
              <article>
                <h3>点数加算</h3>
                <p>
                  {result.totalScore} × {formatYen(SCORE_UNIT_PRICE)} = {formatYen(result.scoreAddOn)}
                </p>
              </article>
              <article>
                <h3>概算月額</h3>
                <p className="summary-total">{formatYen(result.monthlyFee)}</p>
              </article>
              <article>
                <h3>規模ラベル</h3>
                <p>{scaleLabel}</p>
              </article>
            </div>
          </SectionCard>

          <SectionCard
            title="概算見積書プレビュー"
            subtitle="印刷 / PDF保存時に出力されるレイアウト"
            className="print-preview-shell"
          >
            <div className="print-preview" role="region" aria-label="見積書プレビュー領域">
              <div className="print-preview__page">
                <header className="print-doc__header">
                  <h3>概算見積書</h3>
                </header>

                <dl className="print-doc__meta">
                  <div>
                    <dt>顧客名</dt>
                    <dd>{basicInfo.customerName || '未入力'}</dd>
                  </div>
                  <div>
                    <dt>案件名</dt>
                    <dd>{basicInfo.projectName || '未入力'}</dd>
                  </div>
                  <div>
                    <dt>見積日</dt>
                    <dd>{basicInfo.estimateDate || '未入力'}</dd>
                  </div>
                </dl>

                <section className="print-doc__section" aria-label="点数内訳">
                  <h4>点数内訳</h4>
                  <table className="print-doc__table">
                    <tbody>
                      <tr>
                        <th scope="row">画面点</th>
                        <td>{scores.screen} 点</td>
                      </tr>
                      <tr>
                        <th scope="row">機能点</th>
                        <td>{scores.feature} 点</td>
                      </tr>
                      <tr>
                        <th scope="row">運用負荷点</th>
                        <td>{scores.operation} 点</td>
                      </tr>
                      <tr>
                        <th scope="row">合計点</th>
                        <td>{result.totalScore} 点</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="print-doc__section" aria-label="概算月額">
                  <h4>月額算出</h4>
                  <p className="print-doc__formula">
                    月額 = {formatYen(BASE_MONTHLY_FEE)} +（{result.totalScore} 点 ×{' '}
                    {formatYen(SCORE_UNIT_PRICE)}）
                  </p>
                  <p className="print-doc__monthly-fee">概算月額: {formatYen(result.monthlyFee)}</p>
                </section>

                <section className="print-doc__section" aria-label="備考">
                  <h4>備考</h4>
                  <p className="print-doc__note">{basicInfo.notes || 'なし'}</p>
                </section>

                <section className="print-doc__section print-doc__section--caution" aria-label="注意事項">
                  <h4>注意事項</h4>
                  <ul>
                    <li>本書は概算見積です。</li>
                    <li>詳細要件確定前の参考金額です。</li>
                    <li>外部連携、データ移行、特殊要件等は別途調整となる場合があります。</li>
                  </ul>
                </section>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <footer className="estimate-footer estimate-card">
        <p>社内営業向けの簡易見積版です。認証・DB保存・履歴管理・外部連携はフェーズ対象外。</p>
      </footer>
    </main>
  );
}
