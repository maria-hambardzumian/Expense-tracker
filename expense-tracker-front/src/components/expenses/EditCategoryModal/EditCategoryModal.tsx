'use client';

import { useState, useEffect } from 'react';
import cn from 'classnames/bind';
import type { Category } from '@/types';
import type { RemoveAction } from '@/lib/api/categories.api';
import {
  useUpdateCategory,
  useDeleteCategory,
  useCategoryExpenseCount,
  useCategories,
} from '@/hooks/useCategories';
import styles from './EditCategoryModal.module.scss';

const cx = cn.bind(styles);

interface Props {
  category: Category;
  selectedCategoryId: string;
  onClose: () => void;
  onCategoryDeleted: (id: string) => void;
}

export function EditCategoryModal({
  category,
  selectedCategoryId,
  onClose,
  onCategoryDeleted,
}: Props) {
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const expenseCount = useCategoryExpenseCount();

  const [rename, setRename] = useState(false);
  const [newName, setNewName] = useState(category.name);
  const [doDelete, setDoDelete] = useState(false);
  const [deleteAction, setDeleteAction] = useState<RemoveAction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [nameError, setNameError] = useState('');

  const fetchCount = expenseCount.mutateAsync;
  useEffect(() => {
    fetchCount(category.id).then(setCount);
  }, [category.id, fetchCount]);

  const isPending = updateCategory.isPending || deleteCategory.isPending;

  const validateName = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'Name cannot be empty';
    const duplicate = categories.find(
      (c) => c.id !== category.id && c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) return 'A category with this name already exists';
    return '';
  };

  const handleNameChange = (val: string) => {
    setNewName(val);
    if (nameError) setNameError(validateName(val));
  };

  const canSubmit = () => {
    if (!rename && !doDelete) return false;
    if (rename) {
      const trimmed = newName.trim();
      if (!trimmed || trimmed === category.name) return false;
      if (validateName(newName)) return false;
    }
    if (doDelete && !deleteAction) return false;
    if (doDelete && deleteAction === 'deleteExpenses' && !confirmDelete) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit() || isPending) return;

    if (rename) {
      const error = validateName(newName);
      if (error) {
        setNameError(error);
        return;
      }
    }

    if (rename && newName.trim() !== category.name) {
      await updateCategory.mutateAsync({
        id: category.id,
        payload: { name: newName.trim() },
      });
    }

    if (doDelete && deleteAction) {
      if (category.id === selectedCategoryId) {
        onCategoryDeleted(category.id);
      }
      await deleteCategory.mutateAsync({ id: category.id, action: deleteAction });
    }

    onClose();
  };

  const handleDeleteToggle = (checked: boolean) => {
    setDoDelete(checked);
    if (!checked) {
      setDeleteAction(null);
      setConfirmDelete(false);
    }
    if (checked) {
      setRename(false);
      setNewName(category.name);
      setNameError('');
    }
  };

  const handleDeleteActionChange = (action: RemoveAction | null) => {
    setDeleteAction(action);
    setConfirmDelete(false);
  };

  return (
    <div className={cx('overlay')} onClick={onClose}>
      <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
        <h3 className={cx('title')}>Edit &ldquo;{category.name}&rdquo;</h3>

        {count !== null && count > 0 && (
          <p className={cx('info')}>
            This category has <strong>{count}</strong> expense{count !== 1 ? 's' : ''}.
          </p>
        )}

        <div className={cx('section')}>
          <label className={cx('checkRow')}>
            <input
              type="checkbox"
              checked={rename}
              disabled={doDelete}
              onChange={(e) => {
                setRename(e.target.checked);
                if (!e.target.checked) {
                  setNewName(category.name);
                  setNameError('');
                }
              }}
            />
            <span className={cx('checkLabel')}>Rename this custom type</span>
          </label>

          {rename && (
            <div className={cx('renameInput')}>
              <input
                className={cx('input', { inputError: !!nameError })}
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => setNameError(validateName(newName))}
                placeholder="New name..."
              />
              {nameError && <span className={cx('error')}>{nameError}</span>}
            </div>
          )}
        </div>

        <div className={cx('section')}>
          <label className={cx('checkRow')}>
            <input
              type="checkbox"
              checked={doDelete}
              onChange={(e) => handleDeleteToggle(e.target.checked)}
            />
            <span className={cx('checkLabel', 'destructive')}>Delete this custom type</span>
          </label>

          {doDelete && (
            <div className={cx('subOptions')}>
              <label className={cx('checkRow', 'sub')}>
                <input
                  type="checkbox"
                  checked={deleteAction === 'deleteExpenses'}
                  onChange={(e) =>
                    handleDeleteActionChange(e.target.checked ? 'deleteExpenses' : null)
                  }
                />
                <span className={cx('checkLabel', 'destructive')}>
                  Also delete all expenses with this type
                </span>
              </label>

              {deleteAction === 'deleteExpenses' && (
                <label className={cx('checkRow', 'confirm')}>
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  <span className={cx('checkLabel', 'warning')}>
                    I understand this will permanently delete {count ?? '?'} expense{count !== 1 ? 's' : ''}
                  </span>
                </label>
              )}

              <label className={cx('checkRow', 'sub')}>
                <input
                  type="checkbox"
                  checked={deleteAction === 'reassignToOther'}
                  disabled={deleteAction === 'deleteExpenses'}
                  onChange={(e) =>
                    handleDeleteActionChange(e.target.checked ? 'reassignToOther' : null)
                  }
                />
                <span className={cx('checkLabel')}>
                  Reassign existing expenses to &ldquo;Other&rdquo;
                </span>
              </label>

              <label className={cx('checkRow', 'sub')}>
                <input
                  type="checkbox"
                  checked={deleteAction === 'keepUnchanged'}
                  disabled={deleteAction === 'deleteExpenses'}
                  onChange={(e) =>
                    handleDeleteActionChange(e.target.checked ? 'keepUnchanged' : null)
                  }
                />
                <span className={cx('checkLabel')}>
                  Keep existing expenses unchanged
                </span>
              </label>
            </div>
          )}
        </div>

        <div className={cx('actions')}>
          <button type="button" className={cx('cancelBtn')} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={cx('submitBtn', { danger: doDelete })}
            disabled={!canSubmit() || isPending}
            onClick={handleSubmit}
          >
            {isPending
              ? 'Saving...'
              : doDelete
                ? 'Delete'
                : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
