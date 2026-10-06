import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

function parseNumber(value: unknown): unknown {
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
}

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @Transform(({ value }) => parseNumber(value))
  @IsInt()
  @Min(1)
  @Max(2147483647)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  customerEmail?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  deliveryAddress!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  deliveryCity!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  deliveryState!: string;

  @IsOptional()
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

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}