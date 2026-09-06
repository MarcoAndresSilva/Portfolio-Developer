import { Logger } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import type { ContactDto } from './contact.dto.js';

const dto: ContactDto = {
  name: 'Marco Silva',
  email: 'visitante@example.com',
  message: 'Hola, me gustaría conversar sobre una oportunidad.',
};

describe('ContactService.deliver', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    vi.restoreAllMocks();
    // Silenciar el logger de Nest en la salida de los tests.
    for (const level of ['log', 'warn', 'error'] as const) {
      vi.spyOn(Logger.prototype, level).mockImplementation(() => undefined);
    }
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('sin RESEND_API_KEY no llama a la red y no tira error (modo log)', async () => {
    delete process.env.RESEND_API_KEY;
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(new ContactService().deliver(dto)).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('con API key postea a Resend con reply-to del visitante', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.CONTACT_TO = 'marco@example.com';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{"id":"1"}', { status: 200 }));

    await new ContactService().deliver(dto);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.to).toBe('marco@example.com');
    expect(body.reply_to).toBe('Marco Silva <visitante@example.com>');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer re_test',
    });
  });

  it('si Resend responde !ok, relanza (para que el controller devuelva 502)', async () => {
    process.env.RESEND_API_KEY = 're_test';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('rate limited', { status: 429 }),
    );

    await expect(new ContactService().deliver(dto)).rejects.toThrow(/contact-delivery-failed/);
  });

  it('si fetch falla (red), relanza', async () => {
    process.env.RESEND_API_KEY = 're_test';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNRESET'));

    await expect(new ContactService().deliver(dto)).rejects.toThrow(/contact-delivery-failed/);
  });
});
