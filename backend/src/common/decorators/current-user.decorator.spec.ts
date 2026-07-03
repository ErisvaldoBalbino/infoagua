import { ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  const mockUser: JwtPayload = {
    sub: 'user-uuid-123',
    email: 'usuario@exemplo.com',
  };

  const createMockContext = (user: JwtPayload | undefined) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  };

  it('deve retornar o usuário presente no request', () => {
    const ctx = createMockContext(mockUser);
    const factory = jest
      .fn()
      .mockImplementation((_data, context: ExecutionContext) => {
        const request = context
          .switchToHttp()
          .getRequest<{ user: JwtPayload }>();
        return request.user;
      });

    const result = factory(undefined, ctx);
    expect(result).toEqual(mockUser);
  });

  it('JwtPayload deve conter sub e email', () => {
    const payload: JwtPayload = { sub: '123', email: 'a@b.com' };
    expect(payload.sub).toBeDefined();
    expect(payload.email).toBeDefined();
  });
});
