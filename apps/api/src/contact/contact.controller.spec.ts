import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';

const valid = {
  name: 'Marco Silva',
  email: 'test@example.com',
  message: 'Hola, me gustaría conversar sobre una oportunidad.',
};

describe('ContactController', () => {
  let controller: ContactController;
  let deliver: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    deliver = vi.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: { deliver } }],
    }).compile();
    controller = moduleRef.get(ContactController);
  });

  it('entrega un mensaje válido', async () => {
    await expect(controller.submit(valid)).resolves.toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledWith(valid);
  });

  it('rechaza datos inválidos con 400', async () => {
    await expect(controller.submit({ ...valid, email: 'x' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(deliver).not.toHaveBeenCalled();
  });

  it('ignora en silencio un envío con honeypot (responde ok, no entrega)', async () => {
    await expect(controller.submit({ ...valid, company: 'bot' })).resolves.toEqual({ ok: true });
    expect(deliver).not.toHaveBeenCalled();
  });
});
