'use client';

import { useState } from 'react';
import cn from 'classnames/bind';
import { useExpenses, useExpenseSummary, useExpenseDateRange, useDeleteExpense } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import type { Expense } from '@/types';
import styles from './ExpensesPage.module.scss';

const cx = cn.bind(styles);

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ExpensesPage() {
  const todayStr = toLocalDateString(new Date());

  const { data: dateRange } = useExpenseDateRange();
  const earliestStr = dateRange?.earliest ? dateRange.earliest.split('T')[0] : todayStr;

  const [fromOverride, setFromOverride] = useState<string | undefined>(undefined);
  const [to, setTo] = useState(todayStr);
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const from = fromOverride ?? earliestStr;

  const { data: categories } = useCategories();
  const { data: paginated, isLoading, isFetching } = useExpenses({
    from,
    to,
    categoryId: categoryId || undefined,
    page,
    limit: 20,
  });
  const { data: summary } = useExpenseSummary(from, to);
  const deleteExpense = useDeleteExpense();

  const expenses = paginated?.data ?? [];
  const totalPages = paginated ? Math.ceil(paginated.total / 20) : 1;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteExpense.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  return (
    <div className={cx('page')}>
      <main className={cx('main')}>
        <div className={cx('topRow')}>
          <div className={cx('summaryCard')}>
            <p className={cx('summaryLabel')}>Total ({from} → {to})</p>
            <p className={cx('summaryAmount')}>
              {summary ? formatCurrency(summary.total) : '—'}
            </p>
          </div>
          <button
            onClick={() => { setEditExpense(null); setShowModal(true); }}
            className={cx('addBtn')}
          >
            + Add Expense
          </button>
        </div>

        <div className={cx('filters')}>
          <div className={cx('filterGroup')}>
            <label className={cx('filterLabel')}>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFromOverride(e.target.value); setPage(1); }}
              className={cx('filterInput')}
            />
          </div>
          <div className={cx('filterGroup')}>
            <label className={cx('filterLabel')}>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className={cx('filterInput')}
            />
          </div>
          <div className={cx('filterGroup')}>
            <label className={cx('filterLabel')}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className={cx('filterSelect')}
            >
              <option value="">All categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={cx('tableWrapper')}>
          {isLoading ? (
            <div className={cx('loading')}>
              <span className={cx('spinner')} />
              <span>Loading expenses…</span>
            </div>
          ) : !expenses.length ? (
            <div className={cx('empty')}>
              No expenses found. Add your first expense!
            </div>
          ) : (
            <div className={cx('tableInner')}>
              {isFetching && (
                <div className={cx('fetchingOverlay')}>
                  <span className={cx('spinner')} />
                </div>
              )}
              <table className={cx('table')}>
                <thead className={cx('thead')}>
                  <tr>
                    <th className={cx('th')}>Date</th>
                    <th className={cx('th')}>Category</th>
                    <th className={cx('th')}>Note</th>
                    <th className={cx('th', 'right')}>Amount</th>
                    <th className={cx('th')} />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className={cx('tr')}>
                      <td className={cx('td')}>{expense.date.split('T')[0]}</td>
                      <td className={cx('td')}>
                        {!expense.category.isDefault ? (
                          <span
                            className={cx('categoryBadge', 'custom')}
                            style={{ borderColor: expense.category.color, color: expense.category.color }}
                          >
                            {expense.category.name}
                          </span>
                        ) : (
                          <span
                            className={cx('categoryBadge')}
                            style={{ backgroundColor: expense.category.color }}
                          >
                            {expense.category.name}
                          </span>
                        )}
                      </td>
                      <td className={cx('td', 'muted', 'truncate')}>
                        {expense.note || '—'}
                      </td>
                      <td className={cx('td', 'right', 'bold')}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className={cx('td', 'right')}>
                        <button
                          onClick={() => { setEditExpense(expense); setShowModal(true); }}
                          className={cx('editBtn')}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
                          className={cx('deleteBtn')}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className={cx('pagination')}>
            <span>Page {page} of {totalPages} — {paginated?.total} expense(s)</span>
            <div className={cx('paginationBtns')}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cx('pageBtn')}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cx('pageBtn')}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <div className={cx('overlay')} onClick={() => setDeleteTarget(null)}>
          <div className={cx('confirmModal')} onClick={(e) => e.stopPropagation()}>
            <p className={cx('confirmTitle')}>Delete expense?</p>
            <p className={cx('confirmText')}>
              {formatCurrency(deleteTarget.amount)} — {deleteTarget.category.name}
              {deleteTarget.note ? ` — ${deleteTarget.note}` : ''}
            </p>
            <div className={cx('confirmActions')}>
              <button
                className={cx('confirmCancel')}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className={cx('confirmDelete')}
                onClick={handleDeleteConfirm}
                disabled={deleteExpense.isPending}
              >
                {deleteExpense.isPending && <span className={cx('spinnerWhite')} />}
                {deleteExpense.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
