import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  private buildDateFilter(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    const filter: Prisma.DateTimeFilter = {};
    if (from) filter.gte = new Date(from);
    if (to) filter.lte = new Date(to);
    return filter;
  }

  private buildCategoryLookup(categories: { id: string; name: string; color: string; isDefault: boolean }[]) {
    return new Map(categories.map((category) => [category.id, category]));
  }

  async findAll(userId: string, query: ExpenseQueryDto) {
    const { from, to, categoryId, page = 1, limit = 20 } = query;

    const where: Prisma.ExpenseWhereInput = { userId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) where.date = dateFilter;
    if (categoryId) where.categoryId = categoryId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getSummary(userId: string, from?: string, to?: string) {
    const where: Prisma.ExpenseWhereInput = { userId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) where.date = dateFilter;

    const result = await this.prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    return { total: result._sum.amount ?? 0 };
  }

  async getByCategory(userId: string, from?: string, to?: string) {
    const where: Prisma.ExpenseWhereInput = { userId };
    const dateFilter = this.buildDateFilter(from, to);
    if (dateFilter) where.date = dateFilter;

    const grouped = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
    });

    const categoryIds = grouped.map((group) => group.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = this.buildCategoryLookup(categories);

    let otherTotal = 0;
    const data: Array<{
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      isDefault: boolean;
      total: number;
    }> = [];

    for (const group of grouped) {
      const category = categoryMap.get(group.categoryId);
      const total = Number(group._sum.amount ?? 0);
      if (category?.isDefault && category.name !== 'Other') {
        data.push({
          categoryId: group.categoryId,
          categoryName: category.name,
          categoryColor: category.color,
          isDefault: true,
          total,
        });
      } else {
        otherTotal += total;
      }
    }

    if (otherTotal > 0) {
      data.push({
        categoryId: 'other',
        categoryName: 'Other',
        categoryColor: '#9ca3af',
        isDefault: false,
        total: otherTotal,
      });
    }

    data.sort((left, right) => right.total - left.total);
    const grandTotal = data.reduce((sum, entry) => sum + entry.total, 0);
    return { data, grandTotal };
  }

  async getByCustomCategory(userId: string, from?: string, to?: string) {

    const otherDefault = await this.prisma.category.findFirst({
      where: { name: 'Other', isDefault: true },
    });

    const dateFilter = this.buildDateFilter(from, to);
    const where: Prisma.ExpenseWhereInput = {
      userId,
      OR: [
        { category: { isDefault: false } },
        ...(otherDefault ? [{ categoryId: otherDefault.id }] : []),
      ],
    };
    if (dateFilter) where.date = dateFilter;

    const grouped = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
    });

    const categoryIds = grouped.map((group) => group.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = this.buildCategoryLookup(categories);

    const data = grouped
      .map((group) => {
        const category = categoryMap.get(group.categoryId);
        const isDefaultOther = category?.isDefault && category.name === 'Other';
        return {
          categoryId: group.categoryId,
          categoryName: isDefaultOther ? 'Not specified' : (category?.name ?? 'Not specified'),
          categoryColor: category?.color ?? '#6b7280',
          total: Number(group._sum.amount ?? 0),
        };
      })
      .sort((left, right) => right.total - left.total);

    return { data };
  }

  async getDateRange(userId: string) {
    const oldest = await this.prisma.expense.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });
    return { earliest: oldest?.date ?? null };
  }

  create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        date: new Date(dto.date),
        note: dto.note,
        userId,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.userId !== userId) throw new ForbiddenException('Access denied');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(userId, id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
      include: { category: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.expense.delete({ where: { id } });
  }
}
