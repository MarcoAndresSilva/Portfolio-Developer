import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

interface RequestLike {
  ip?: string;
  socket?: { remoteAddress?: string };
}

/**
 * Rate-limit simple en memoria: ventana deslizante por IP.
 *
 * `@nestjs/throttler` todavía no soporta NestJS 12, y para un solo endpoint de
 * contacto esto alcanza. Al reiniciar el proceso se pierde el estado (aceptable).
 * Si en el futuro hay varias instancias, migrar a un store compartido (Redis).
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs = 60_000;
  private readonly max = 5;
  private readonly hits = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestLike>();
    const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();

    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);

    if (recent.length >= this.max) {
      throw new HttpException(
        'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.sweep(now);
    return true;
  }

  /** Evita que el Map crezca sin límite con IPs que ya no vuelven. */
  private sweep(now: number): void {
    if (this.hits.size < 1000) {
      return;
    }
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= this.windowMs)) {
        this.hits.delete(key);
      }
    }
  }
}
