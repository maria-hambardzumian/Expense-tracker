'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import cn from 'classnames/bind';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { CategoryPicker } from '../CategoryPicker';
import type { Expense } from '@/types';
import styles from './ExpenseModal.module.scss';

const cx = cn.bind(styles);

const schema = z.object({
  amount: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().uuid('Select a category'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  expense: Expense | null;
  onClose: () => void;
}

export function ExpenseModal({ expense, onClose }: Props) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (expense) {
      reset({
        amount: expense.amount,
        date: expense.date.split('T')[0],
        categoryId: expense.categoryId,
        note: expense.note || '',
      });
    } else {
      reset({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        note: '',
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data: FormData) => {
    if (expense) {
      await updateExpense.mutateAsync({ id: expense.id, payload: data });
    } else {
      await createExpense.mutateAsync(data);
    }
    onClose();
  };

  return (
    <div className={cx('overlay')}>
      <div className={cx('modal')}>
        <div className={cx('header')}>
          <h2 className={cx('title')}>
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} className={cx('closeBtn')}>×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={cx('form')}>
          <div className={cx('field')}>
            <label className={cx('label')}>Amount ($)</label>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={cx('input')}
            />
            {errors.amount && (
              <p className={cx('fieldError')}>{errors.amount.message}</p>
            )}
          </div>

          <div className={cx('field')}>
            <label className={cx('label')}>Date</label>
            <input
              {...register('date')}
              type="date"
              className={cx('input')}
            />
            {errors.date && (
              <p className={cx('fieldError')}>{errors.date.message}</p>
            )}
          </div>

          <div className={cx('field')}>
            <label className={cx('label')}>Category</label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategoryPicker
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                />
              )}
            />
            {errors.categoryId && (
              <p className={cx('fieldError')}>{errors.categoryId.message}</p>
            )}
          </div>

          <div className={cx('field')}>
            <label className={cx('label')}>Note (optional)</label>
            <input
              {...register('note')}
              type="text"
              placeholder="What was this for?"
              className={cx('input')}
            />
          </div>

          <div className={cx('actions')}>
            <button type="button" onClick={onClose} className={cx('cancelBtn')}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cx('submitBtn')}
            >
              {isSubmitting && <span className={cx('spinner')} />}
              {isSubmitting ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
