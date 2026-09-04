import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../core/motion/reveal.directive';

interface Fact {
  /** Etiqueta del dato, traducible. */
  label: string;
  /** Valor del dato, traducible. */
  value: string;
}

/**
 * Sección "Sobre mí" — bio de Marco en prosa + una ficha de datos escaneables.
 *
 * El contenido son datos tipados, sin CMS (ver ARCHITECTURE.md §6). Los párrafos
 * van en la plantilla (marcados con `i18n`); la ficha va acá con `$localize`.
 */
@Component({
  selector: 'app-about',
  imports: [Reveal],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  protected readonly facts: Fact[] = [
    {
      label: $localize`:@@about.fact.education:Formación`,
      value: $localize`:@@about.fact.education.value:Ingeniería en Informática — Duoc UC`,
    },
    {
      label: $localize`:@@about.fact.experience:Experiencia`,
      value: $localize`:@@about.fact.experience.value:+3 años, fullstack`,
    },
    {
      label: $localize`:@@about.fact.focus:Enfoque`,
      value: $localize`:@@about.fact.focus.value:Fintech · OpenBanking · Microfrontends · BFF`,
    },
    {
      label: $localize`:@@about.fact.location:Ubicación`,
      value: $localize`:@@about.fact.location.value:Santiago, Chile`,
    },
    {
      label: $localize`:@@about.fact.availability:Disponibilidad`,
      value: $localize`:@@about.fact.availability.value:Abierto a nuevas oportunidades`,
    },
  ];
}
