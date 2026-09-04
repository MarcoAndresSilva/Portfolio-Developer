import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Reveal } from '../../core/motion/reveal.directive';
import { environment } from '../../../environments/environment';

type SubmitState = 'idle' | 'sending' | 'ok' | 'error';

/**
 * Sección "Contacto" — formulario reactivo que postea a `POST /contact` de la API
 * NestJS. Anti-spam: honeypot (`company`, oculto) + rate-limit del lado del server.
 * El texto real de la sección viaja en el HTML prerenderizado (SSG).
 */
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly state = signal<SubmitState>('idle');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    // Honeypot: una persona no lo ve; un bot lo rellena.
    company: [''],
  });

  protected readonly email = 'marco.silvaponce10@gmail.com';

  protected submit(): void {
    if (this.state() === 'sending') {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state.set('sending');
    this.http.post(`${environment.apiUrl}/contact`, this.form.getRawValue()).subscribe({
      next: () => {
        this.state.set('ok');
        this.form.reset();
      },
      error: () => this.state.set('error'),
    });
  }

  protected invalid(control: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
