import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterMapOccurrencesDto } from './filter-map-occurrences.dto';

describe('FilterMapOccurrencesDto', () => {
  it('should pass validation when coordinates are valid (min <= max)', async () => {
    const dto = plainToInstance(FilterMapOccurrencesDto, {
      minLat: -8.1,
      maxLat: -8.0,
      minLng: -34.9,
      maxLng: -34.8,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when only min or only max coordinates are provided', async () => {
    const dto = plainToInstance(FilterMapOccurrencesDto, {
      minLat: -8.1,
      maxLng: -34.8,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when minLat > maxLat', async () => {
    const dto = plainToInstance(FilterMapOccurrencesDto, {
      minLat: -8.0,
      maxLat: -8.1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const latError = errors.find((e) => e.property === 'minLat');
    expect(latError).toBeDefined();
    expect(latError?.constraints?.isLessThanOrEqual).toContain(
      'minLat deve ser menor ou igual a maxLat',
    );
  });

  it('should fail validation when minLng > maxLng', async () => {
    const dto = plainToInstance(FilterMapOccurrencesDto, {
      minLng: -34.8,
      maxLng: -34.9,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const lngError = errors.find((e) => e.property === 'minLng');
    expect(lngError).toBeDefined();
    expect(lngError?.constraints?.isLessThanOrEqual).toContain(
      'minLng deve ser menor ou igual a maxLng',
    );
  });
});
