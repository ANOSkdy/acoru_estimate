'use client';

import { useId, useMemo, useState } from 'react';
import { ESTIMATE_PRESETS, findEstimatePresetById } from '@/lib/estimate-presets';
import {
  applyScoreDelta,
  BASE_MONTHLY_FEE,
  calculateEstimate,
  coerceScoreInput,
  getScaleLabel,
  INITIAL_BASIC_INFO,
  INITIAL_SCORES,
  SAMPLE_BASIC_INFO,
  SAMPLE_SCORES,
  sanitizeScore,
  SCORE_HINTS,
  SCORE_UNIT_PRICE,
  type BasicInfo,
  type EstimateScores,
  type ScoreBucketKey,
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
  id,
  label,
  value,
  onStep,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onStep: (delta: number) => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="score-input">
      <label htmlFor={id}>{label}</label>
      <div className="score-input__controls">
        <button type="button" onClick={() => onStep(-1)} aria-label={`${label}を1減らす`}>
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.toString()}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={`${id}-hint`}
        />
        <button type="button" onClick={() => onStep(1)} aria-label={`${label}を1増やす`}>
          ＋
        </button>
      </div>
      <p id={`${id}-hint`} className="field-helper">
        0〜999点 / 空欄は0点
      </p>
    </div>
  );
}

export function EstimateShell() {
  const today = todayISODate();
  const idPrefix = useId();
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(INITIAL_BASIC_INFO(today));
  const [scores, setScores] = useState<EstimateScores>(INITIAL_SCORES);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const result = useMemo(() => calculateEstimate(scores), [scores]);
  const scaleLabel = useMemo(() => getScaleLabel(result.totalScore), [result.totalScore]);
  const selectedPreset = useMemo(
    () => findEstimatePresetById(selectedPresetId),
    [selectedPresetId],
  );

  const setScore = (key: ScoreBucketKey, nextValue: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: sanitizeScore(nextValue),
    }));
  };

  const stepScore = (key: ScoreBucketKey, delta: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: sanitizeScore(prev[key] + delta),
    }));
  };

  const applyHint = (effects: EstimateScores) => {
    setScores((prev) => applyScoreDelta(prev, effects));
  };

  const handleReset = () => {
    setBasicInfo(INITIAL_BASIC_INFO(today));
    setScores(INITIAL_SCORES);
    setSelectedPresetId(null);
  };

  const handleSample = () => {
    setBasicInfo(SAMPLE_BASIC_INFO(today));
    setScores(SAMPLE_SCORES);
    setSelectedPresetId(null);
  };

  const handleClearScores = () => {
    setScores(INITIAL_SCORES);
    setSelectedPresetId(null);
  };

  const handlePresetApply = (presetId: string) => {
    const preset = findEstimatePresetById(presetId);
    if (!preset) return;

    setScores(preset.scores);
    setBasicInfo((prev) => ({
      ...prev,
      customerName: prev.customerName || preset.suggestedCustomerName || '',
      projectName: preset.suggestedProjectName ?? prev.projectName,
      notes: prev.notes || preset.note || '',
    }));
    setSelectedPresetId(preset.id);
  };

  const handlePresetClear = () => {
    setSelectedPresetId(null);
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  return (
    <main className="estimate-page">
      <div className="estimate-bg" aria-hidden="true" />

      <section className="estimate-hero estimate-card">
        <p className="estimate-badge">管理者用</p>
        <h1>見積算出ツール</h1>
        <p>テンプレートから初期値を選び、その場で微調整しながら概算見積を提示できます。</p>
      </section>

      <div className="estimate-actions estimate-card" role="group" aria-label="見積アクション">
        <button type="button" className="btn btn--print" onClick={handlePrint}>
          PDF保存
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleReset}>
          全項目リセット
        </button>
      </div>

      <section className="estimate-card template-presets" aria-label="テンプレートプリセット">
        <header className="estimate-card__header">
          <h2>テンプレート</h2>
          <p>近いシステム種別を選ぶと、基本情報と点数の初期値をワンクリックで反映できます。</p>
        </header>

        <div className="preset-grid">
          {ESTIMATE_PRESETS.map((preset) => {
            const isActive = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-button ${isActive ? 'preset-button--active' : ''}`.trim()}
                onClick={() => handlePresetApply(preset.id)}
                aria-pressed={isActive}
              >
                <p className="preset-button__label">{preset.label}</p>
                <p className="preset-button__description">{preset.description}</p>
                <p className="preset-button__scores">
                  画面 {preset.scores.screen} / 機能 {preset.scores.feature} / 運用 {preset.scores.operation}
                </p>
              </button>
            );
          })}
        </div>

        <div className="preset-footer">
          <p className="field-helper">
            {selectedPreset
              ? `選択中: ${selectedPreset.label}（必要に応じて下の入力で微調整してください）`
              : '未選択（手動入力モード）'}
          </p>
          <button type="button" className="btn btn--ghost" onClick={handlePresetClear}>
            テンプレ選択を解除
          </button>
        </div>
      </section>

      <div className="estimate-grid" role="presentation">
        <div className="estimate-column estimate-column--left">
          <SectionCard title="基本情報" subtitle="">
            <fieldset className="form-fieldset">
              <legend>案件情報</legend>
              <div className="field-grid">
                <label className="form-field" htmlFor={`${idPrefix}-customer`}>
                  <span>顧客名</span>
                  <input
                    id={`${idPrefix}-customer`}
                    type="text"
                    placeholder="例）株式会社〇〇"
                    value={basicInfo.customerName}
                    onChange={(event) =>
                      setBasicInfo((prev) => ({ ...prev, customerName: event.target.value }))
                    }
                  />
                </label>

                <label className="form-field" htmlFor={`${idPrefix}-project`}>
                  <span>案件名</span>
                  <input
                    id={`${idPrefix}-project`}
                    type="text"
                    placeholder="例）営業支援ダッシュボード構築"
                    value={basicInfo.projectName}
                    onChange={(event) =>
                      setBasicInfo((prev) => ({ ...prev, projectName: event.target.value }))
                    }
                  />
                </label>

                <label className="form-field" htmlFor={`${idPrefix}-date`}>
                  <span>見積日</span>
                  <input
                    id={`${idPrefix}-date`}
                    type="date"
                    value={basicInfo.estimateDate}
                    onChange={(event) =>
                      setBasicInfo((prev) => ({ ...prev, estimateDate: event.target.value }))
                    }
                  />
                </label>

                <label className="form-field form-field--full" htmlFor={`${idPrefix}-notes`}>
                  <span>備考</span>
                  <textarea
                    id={`${idPrefix}-notes`}
                    rows={4}
                    placeholder="例）データ移行・外部連携は別途精査"
                    value={basicInfo.notes}
                    onChange={(event) =>
                      setBasicInfo((prev) => ({ ...prev, notes: event.target.value }))
                    }
                  />
                </label>
              </div>
            </fieldset>
          </SectionCard>

          <SectionCard title="点数入力" subtitle="画面点・機能点・運用負荷点を直接入力">
            <fieldset className="form-fieldset">
              <legend>見積点数</legend>
              <div className="score-grid">
                <ScoreControl
                  id={`${idPrefix}-screen`}
                  label="画面点"
                  value={scores.screen}
                  onStep={(delta) => stepScore('screen', delta)}
                  onChange={(value) => setScore('screen', coerceScoreInput(value))}
                />
                <ScoreControl
                  id={`${idPrefix}-feature`}
                  label="機能点"
                  value={scores.feature}
                  onStep={(delta) => stepScore('feature', delta)}
                  onChange={(value) => setScore('feature', coerceScoreInput(value))}
                />
                <ScoreControl
                  id={`${idPrefix}-operation`}
                  label="運用負荷点"
                  value={scores.operation}
                  onStep={(delta) => stepScore('operation', delta)}
                  onChange={(value) => setScore('operation', coerceScoreInput(value))}
                />
              </div>
            </fieldset>
          </SectionCard>
        </div>

        <div className="estimate-column estimate-column--right">
          <SectionCard title="概算サマリー" subtitle="">
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

          <SectionCard title="補助加点" subtitle="よくある要件をワンクリックで加点">
            <p className="field-helper">必要な要件のみ押してください。押すたびに加算されます。</p>
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
      </div>

      <SectionCard
        title="概算見積書プレビュー"
        subtitle=""
        className="print-preview-shell print-preview-shell--full"
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
    </main>
  );
}