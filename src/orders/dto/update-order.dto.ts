import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { OrderStatus } from '../order-status';

function parseNumber(value: unknown): unknown {
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
}

export class UpdateOrderDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(180)
  customerName?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(40)
  customerPhone?: string;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsEmail()
  @MaxLength(254)
  customerEmail?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(255)
  deliveryAddress?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(120)
  deliveryCity?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(120)
  deliveryState?: string;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString()
  deliveryInstructions?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => parseNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  discount?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => parseNumber(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  deliveryFee?: number;
}