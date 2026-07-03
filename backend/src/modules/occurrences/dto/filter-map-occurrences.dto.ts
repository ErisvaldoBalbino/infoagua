import {
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'isLessThanOrEqual', async: false })
export class IsLessThanOrEqualConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: unknown, args: ValidationArguments) {
    const constraints = args.constraints as string[] | undefined;
    if (!constraints || constraints.length === 0) {
      return true;
    }
    const relatedPropertyName = constraints[0];
    const obj = args.object as Record<string, unknown>;
    const relatedValue = obj[relatedPropertyName];
    if (propertyValue === undefined || relatedValue === undefined) {
      return true;
    }
    return (
      typeof propertyValue === 'number' &&
      typeof relatedValue === 'number' &&
      propertyValue <= relatedValue
    );
  }

  defaultMessage(args: ValidationArguments) {
    const constraints = args.constraints as string[] | undefined;
    const relatedPropertyName = constraints?.[0] ?? 'max';
    return `${args.property} deve ser menor ou igual a ${relatedPropertyName}`;
  }
}

export function IsLessThanOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsLessThanOrEqualConstraint,
    });
  };
}

export class FilterMapOccurrencesDto {
  @ApiPropertyOptional({ example: -8.1, description: 'Latitude mínima' })
  @IsOptional()
  @IsNumber()
  @IsLessThanOrEqual('maxLat')
  @Type(() => Number)
  minLat?: number;

  @ApiPropertyOptional({ example: -8.0, description: 'Latitude máxima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLat?: number;

  @ApiPropertyOptional({ example: -34.9, description: 'Longitude mínima' })
  @IsOptional()
  @IsNumber()
  @IsLessThanOrEqual('maxLng')
  @Type(() => Number)
  minLng?: number;

  @ApiPropertyOptional({ example: -34.8, description: 'Longitude máxima' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLng?: number;

  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  limit?: number = 100;
}
