'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Car,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  Briefcase,
  Tag,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  UtensilsCrossed,
  ShoppingCart,
  ShoppingBag,
  Shirt,
  Plane,
  Bus,
  Train,
  Fuel,
  Wifi,
  Smartphone,
  Laptop,
  Dumbbell,
  Music,
  Gamepad2,
  Book,
  Baby,
  PawPrint,
  Gift,
  Coffee,
  Beer,
  Cigarette,
  Pill,
  Scissors,
  Sparkles,
  Wrench,
  Zap,
  Droplets,
  Flame,
  TreePine,
  Church,
  Landmark,
  CreditCard,
  PiggyBank,
  Receipt,
  HandCoins,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import cn from 'classnames/bind';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import type { Category } from '@/types';
import { EditCategoryModal } from '../EditCategoryModal/EditCategoryModal';
import styles from './CategoryPicker.module.scss';

const cx = cn.bind(styles);

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  housing: Home,
  transport: Car,
  health: HeartPulse,
  entertainment: Clapperboard,
  education: GraduationCap,
  work: Briefcase,
};

const ICON_KEYWORDS: [string[], LucideIcon][] = [
  [['food', 'lunch', 'dinner', 'breakfast', 'meal', 'restaurant', 'dining', 'eat'], UtensilsCrossed],
  [['grocery', 'groceries', 'supermarket', 'market'], ShoppingCart],
  [['shop', 'shopping', 'store', 'purchase'], ShoppingBag],
  [['cloth', 'fashion', 'apparel', 'wear', 'dress', 'shirt'], Shirt],
  [['flight', 'fly', 'airplane', 'airline', 'travel', 'vacation', 'trip', 'holiday'], Plane],
  [['bus'], Bus],
  [['train', 'metro', 'subway', 'railway'], Train],
  [['fuel', 'gas', 'petrol', 'diesel'], Fuel],
  [['internet', 'wifi', 'broadband'], Wifi],
  [['phone', 'mobile', 'cellular'], Smartphone],
  [['computer', 'laptop', 'tech', 'software', 'hardware', 'electronics'], Laptop],
  [['gym', 'fitness', 'sport', 'exercise', 'workout'], Dumbbell],
  [['music', 'concert', 'spotify'], Music],
  [['game', 'gaming', 'playstation', 'xbox', 'nintendo'], Gamepad2],
  [['book', 'reading', 'library', 'magazine'], Book],
  [['baby', 'child', 'kid', 'toddler', 'daycare', 'nursery'], Baby],
  [['pet', 'dog', 'cat', 'vet', 'animal'], PawPrint],
  [['gift', 'present', 'donation', 'charity'], Gift],
  [['coffee', 'cafe', 'tea'], Coffee],
  [['bar', 'beer', 'wine', 'alcohol', 'drink', 'pub'], Beer],
  [['smoke', 'tobacco', 'cigarette'], Cigarette],
  [['medicine', 'pharmacy', 'drug', 'prescription'], Pill],
  [['haircut', 'salon', 'barber', 'beauty', 'grooming'], Scissors],
  [['cleaning', 'laundry', 'hygiene', 'cosmetic', 'skincare'], Sparkles],
  [['repair', 'maintenance', 'plumber', 'mechanic', 'fix'], Wrench],
  [['electric', 'electricity', 'power', 'energy'], Zap],
  [['water', 'plumbing'], Droplets],
  [['heating', 'heat', 'furnace'], Flame],
  [['garden', 'plant', 'nature', 'park', 'outdoor'], TreePine],
  [['church', 'religion', 'temple', 'mosque', 'tithe'], Church],
  [['tax', 'government', 'legal', 'lawyer', 'fine', 'fee'], Landmark],
  [['subscription', 'membership', 'renewal', 'streaming', 'netflix'], CreditCard],
  [['saving', 'investment', 'invest', 'deposit', 'retirement', 'pension'], PiggyBank],
  [['bill', 'invoice', 'utility', 'utilities', 'rent'], Receipt],
  [['loan', 'debt', 'mortgage', 'credit', 'installment', 'payment'], HandCoins],
  [['home', 'house', 'apartment', 'flat'], Home],
  [['car', 'auto', 'vehicle', 'parking', 'toll'], Car],
  [['doctor', 'hospital', 'medical', 'dental', 'dentist', 'therapy', 'clinic'], HeartPulse],
  [['movie', 'cinema', 'film', 'theatre', 'theater', 'show', 'netflix'], Clapperboard],
  [['school', 'university', 'college', 'course', 'tuition', 'training', 'class'], GraduationCap],
  [['office', 'job', 'career', 'business', 'freelance'], Briefcase],
];

const CUSTOM_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#7c3aed',
  '#4f46e5', '#2563eb', '#0ea5e9', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#78716c', '#6366f1', '#0891b2',
];

function pickColor(usedColors: string[]): string {
  const used = new Set(usedColors.map((color) => color.toLowerCase()));
  const available = CUSTOM_COLORS.filter((color) => !used.has(color.toLowerCase()));
  const pool = available.length > 0 ? available : CUSTOM_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getCategoryIcon(name: string): LucideIcon {
  const exact = CATEGORY_ICONS[name.toLowerCase()];
  if (exact) return exact;

  const lower = name.toLowerCase();
  for (const [keywords, icon] of ICON_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return icon;
  }
  return Tag;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

export function CategoryPicker({ value, onChange, error }: Props) {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((cat) => cat.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setNewName('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleSelect = (cat: Category) => {
    onChange(cat.id);
    setOpen(false);
    setAdding(false);
    setNewName('');
  };

  const handleAddSubmit = async () => {
    const name = newName.trim();
    if (!name) return;
    const usedColors = categories.map((cat) => cat.color);
    const color = pickColor(usedColors);
    const cat = await createCategory.mutateAsync({ name, color });
    onChange(cat.id);
    setOpen(false);
    setAdding(false);
    setNewName('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubmit();
    }
    if (e.key === 'Escape') {
      setAdding(false);
      setNewName('');
    }
  };

  const SelectedIcon = selected ? getCategoryIcon(selected.name) : null;
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <div className={cx('container', { hasError: !!error })} ref={containerRef}>
      <button
        type="button"
        className={cx('trigger', { open, placeholder: !selected })}
        onClick={() => setOpen((v) => !v)}
      >
        {selected && SelectedIcon ? (
          <>
            <SelectedIcon className={cx('triggerIcon')} size={16} />
            <span className={cx('name')}>{selected.name}</span>
          </>
        ) : (
          <span className={cx('placeholderText')}>Select a category</span>
        )}
        <Chevron className={cx('chevron')} size={14} />
      </button>

      {editTarget && (
        <EditCategoryModal
          category={editTarget}
          selectedCategoryId={value}
          onClose={() => setEditTarget(null)}
          onCategoryDeleted={() => onChange('')}
        />
      )}

      {open && (
        <div className={cx('dropdown')}>
          <div className={cx('grid')}>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const custom = !cat.isDefault;
              return (
                <div key={cat.id} className={cx('tileWrap')}>
                  {custom && (
                    <button
                      type="button"
                      className={cx('tileEdit')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(cat);
                      }}
                    >
                      <Pencil size={10} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={cx('tile', { selected: cat.id === value, customTile: custom })}
                    onClick={() => handleSelect(cat)}
                  >
                    <Icon className={cx('tileIcon')} size={22} />
                    <span className={cx('tileName')}>{cat.name}</span>
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className={cx('tile', 'addTile')}
              onClick={() => setAdding(true)}
            >
              <Plus className={cx('tileIcon')} size={22} />
              <span className={cx('tileName')}>Custom</span>
            </button>
          </div>

          {adding && (
            <div className={cx('addRow')}>
              <input
                ref={inputRef}
                className={cx('addInput')}
                placeholder="Category name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <button
                type="button"
                className={cx('addConfirm')}
                onClick={handleAddSubmit}
                disabled={createCategory.isPending || !newName.trim()}
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                className={cx('addCancel')}
                onClick={() => { setAdding(false); setNewName(''); }}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
