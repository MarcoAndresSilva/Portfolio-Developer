import { looksLikeSpam, toContactDto, validateContact } from './contact.dto.js';

const valid = {
  name: 'Marco Silva',
  email: 'test@example.com',
  message: 'Hola, me gustaría conversar sobre una oportunidad.',
};

describe('validateContact', () => {
  it('acepta un cuerpo válido', () => {
    expect(validateContact(valid)).toBeNull();
  });

  it('rechaza nombre demasiado corto', () => {
    expect(validateContact({ ...valid, name: 'M' })?.name).toBeDefined();
  });

  it('rechaza email inválido', () => {
    expect(validateContact({ ...valid, email: 'no-es-email' })?.email).toBeDefined();
  });

  it('rechaza mensaje demasiado corto', () => {
    expect(validateContact({ ...valid, message: 'corto' })?.message).toBeDefined();
  });

  it('rechaza campos ausentes o de tipo incorrecto', () => {
    const errors = validateContact({ name: 123, email: null });
    expect(errors?.name).toBeDefined();
    expect(errors?.email).toBeDefined();
    expect(errors?.message).toBeDefined();
  });
});

describe('looksLikeSpam', () => {
  it('es spam si el honeypot trae contenido', () => {
    expect(looksLikeSpam({ ...valid, company: 'Acme Bots' })).toBe(true);
  });

  it('no es spam si el honeypot está vacío o ausente', () => {
    expect(looksLikeSpam({ ...valid, company: '' })).toBe(false);
    expect(looksLikeSpam(valid)).toBe(false);
  });
});

describe('toContactDto', () => {
  it('recorta los espacios de los campos', () => {
    const dto = toContactDto({ name: '  Marco  ', email: ' a@b.co ', message: '  hola mundo  ' });
    expect(dto).toEqual({ name: 'Marco', email: 'a@b.co', message: 'hola mundo' });
  });
});
