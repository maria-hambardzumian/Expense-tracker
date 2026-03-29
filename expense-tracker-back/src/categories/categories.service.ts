import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { RemoveCategoryDto } from './dto/remove-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId, deletedAt: null }, { isDefault: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.findUserOwned(userId, id);
    return this.prisma.category.update({
      where: { id: category.id },
      data: dto,
    });
  }

  async getExpenseCount(userId: string, id: string) {
    const category = await this.findUserOwned(userId, id);
    const count = await this.prisma.expense.count({
      where: { categoryId: category.id, userId },
    });
    return { count };
  }

  async remove(userId: string, id: string, dto: RemoveCategoryDto) {
    const category = await this.findUserOwned(userId, id);

    switch (dto.action) {
      case 'deleteExpenses': {
        await this.prisma.expense.deleteMany({
          where: { categoryId: category.id, userId },
        });
        await this.prisma.category.delete({ where: { id: category.id } });
        break;
      }

      case 'reassignToOther': {
        const otherCategory = await this.prisma.category.findFirst({
          where: { name: 'Other', isDefault: true },
        });
        if (!otherCategory) {
          throw new InternalServerErrorException(
            'Default "Other" category not found. Please re-run the database seed.',
          );
        }
        await this.prisma.expense.updateMany({
          where: { categoryId: category.id, userId },
          data: { categoryId: otherCategory.id },
        });
        await this.prisma.category.delete({ where: { id: category.id } });
        break;
      }

      case 'keepUnchanged': {
        await this.prisma.category.update({
          where: { id: category.id },
          data: { deletedAt: new Date() },
        });
        break;
      }
    }
  }

  private async findUserOwned(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new ForbiddenException('Access denied');
    return category;
  }
}
