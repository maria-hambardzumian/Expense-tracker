'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import cn from 'classnames/bind';
import { useExpensesByCategory, useExpensesByCustomCategory } from '@/hooks/useExpenses';
import styles from './AnalyticsPage.module.scss';

const cx = cn.bind(styles);

type Preset = 'all' | '1m' | '3m' | 'custom';

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateRange(preset: Preset, customFrom: string, customTo: string) {
  if (preset === 'all') return { from: undefined, to: undefined };
  if (preset === 'custom') return { from: customFrom, to: customTo };
  const now = new Date();
  const to = toLocalDateString(now);
  const months = preset === '1m' ? 1 : 3;
  const fromDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  return { from: toLocalDateString(fromDate), to };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatPct(value: number, total: number) {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

const RADIAN = Math.PI / 180;

function renderLabel({ cx: x, cy: y, midAngle, outerRadius, percent }: PieLabelRenderProps) {
  if (x == null || y == null || midAngle == null || outerRadius == null || percent == null) return null;
  if (percent < 0.05) return null;
  const radius = outerRadius + 20;
  const ex = x + radius * Math.cos(-midAngle * RADIAN);
  const ey = y + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={ex} y={ey} textAnchor={ex > x ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fill="#374151">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function AnalyticsPage() {
  const [preset, setPreset] = useState<Preset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [groupCustom, setGroupCustom] = useState(true);
  const [otherExpanded, setOtherExpanded] = useState(false);

  const { from, to } = useMemo(
    () => getDateRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );
  const { data: breakdown, isLoading } = useExpensesByCategory(from, to);

  const { data: customBreakdown } = useExpensesByCustomCategory(
    from, to,
    !groupCustom || otherExpanded,
  );

  const { chartData, grandTotal } = useMemo(() => {
    if (!breakdown) return { chartData: [], grandTotal: 0 };

    type Slice = { name: string; value: number; color: string };
    const toSlice = (entry: { categoryName: string; total: number; categoryColor: string }): Slice => ({
      name: entry.categoryName, value: entry.total, color: entry.categoryColor,
    });

    if (groupCustom) {
      return { chartData: breakdown.data.map(toSlice), grandTotal: breakdown.grandTotal };
    }

    const slices = breakdown.data.filter((cat) => cat.categoryId !== 'other').map(toSlice);
    if (customBreakdown) {
      slices.push(...customBreakdown.data.map(toSlice));
    }
    slices.sort((a, b) => b.value - a.value);
    return { chartData: slices, grandTotal: breakdown.grandTotal };
  }, [breakdown, customBreakdown, groupCustom]);

  return (
    <div className={cx('page')}>
      <main className={cx('main')}>
        <h1 className={cx('heading')}>Expense Analytics</h1>

        <div className={cx('filters')}>
          <div className={cx('filterGroup')}>
            <label className={cx('filterLabel')}>Period</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              className={cx('filterSelect')}
            >
              <option value="all">All time</option>
              <option value="1m">Last month</option>
              <option value="3m">Last 3 months</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {preset === 'custom' && (
            <>
              <div className={cx('filterGroup')}>
                <label className={cx('filterLabel')}>From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className={cx('filterInput')}
                />
              </div>
              <div className={cx('filterGroup')}>
                <label className={cx('filterLabel')}>To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className={cx('filterInput')}
                />
              </div>
            </>
          )}

          <label className={cx('checkbox')}>
            <input
              type="checkbox"
              checked={groupCustom}
              onChange={(e) => {
                setGroupCustom(e.target.checked);
                if (e.target.checked) setOtherExpanded(false);
              }}
            />
            <span>Group custom categories as &ldquo;Other&rdquo;</span>
          </label>
        </div>

        {isLoading ? (
          <div className={cx('loading')}>Loading...</div>
        ) : !chartData.length ? (
          <div className={cx('empty')}>No expenses in this period.</div>
        ) : (
          <>
            <div className={cx('chartCard')}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
                    label={renderLabel}
                    labelLine={false}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '6px', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className={cx('totalLabel')}>
                Total: <strong>{formatCurrency(grandTotal)}</strong>
              </p>
            </div>

            <div className={cx('breakdown')}>
              <h2 className={cx('breakdownTitle')}>Breakdown</h2>
              <ul className={cx('list')}>
                {chartData.map((item) => {
                  const isOther = item.name === 'Other' && groupCustom;
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        className={cx('row', { clickable: isOther })}
                        onClick={() => isOther && setOtherExpanded((v) => !v)}
                      >
                        <span className={cx('dot')} style={{ backgroundColor: item.color }} />
                        <span className={cx('catName')}>
                          {isOther && (otherExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                          {item.name}
                        </span>
                        <span className={cx('catAmount')}>{formatCurrency(item.value)}</span>
                        <span className={cx('catPct')}>{formatPct(item.value, grandTotal)}</span>
                      </button>

                      {isOther && otherExpanded && customBreakdown && (
                        <ul className={cx('subList')}>
                          {customBreakdown.data.map((custom) => (
                            <li key={custom.categoryId} className={cx('subRow')}>
                              <span className={cx('dot')} style={{ backgroundColor: custom.categoryColor }} />
                              <span className={cx('catName')}>{custom.categoryName}</span>
                              <span className={cx('catAmount')}>{formatCurrency(custom.total)}</span>
                              <span className={cx('catPct')}>{formatPct(custom.total, grandTotal)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
