import { IsIn } from 'class-validator';

export class RemoveCategoryDto {
  @IsIn(['deleteExpenses', 'reassignToOther', 'keepUnchanged'])
  action: 'deleteExpenses' | 'reassignToOther' | 'keepUnchanged';
}
