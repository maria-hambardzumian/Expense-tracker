import {
  IsDecimal,
  IsDateString,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateExpenseDto {
  @IsDecimal({ decimal_digits: '0,2' })
  amount: string;

  @IsDateString()
  date: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
