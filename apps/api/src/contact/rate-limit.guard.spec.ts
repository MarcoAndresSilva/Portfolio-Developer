import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard.js';

function contextForIp(ip: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ ip }) }),
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  it('deja pasar las primeras 5 solicitudes y bloquea la sexta', () => {
    const guard = new RateLimitGuard();
    const ctx = contextForIp('1.2.3.4');

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('cuenta cada IP por separado', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 5; i++) {
      guard.canActivate(contextForIp('1.1.1.1'));
    }
    expect(guard.canActivate(contextForIp('2.2.2.2'))).toBe(true);
  });
});
