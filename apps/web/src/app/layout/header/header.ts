import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { LocaleService } from '../../core/locale.service';

interface NavItem {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly theme = inject(ThemeService);
  protected readonly locale = inject(LocaleService);

  protected readonly nav: NavItem[] = [
    { label: $localize`:@@nav.about:Sobre mí`, fragment: 'sobre-mi' },
    { label: $localize`:@@nav.stack:Stack`, fragment: 'stack' },
    { label: $localize`:@@nav.projects:Proyectos`, fragment: 'proyectos' },
    { label: $localize`:@@nav.experience:Experiencia`, fragment: 'experiencia' },
    { label: $localize`:@@nav.contact:Contacto`, fragment: 'contacto' },
  ];

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected themeToggleLabel(): string {
    return this.theme.theme() === 'dark'
      ? $localize`:@@theme.toLight:Cambiar a tema claro`
      : $localize`:@@theme.toDark:Cambiar a tema oscuro`;
  }

  protected get langSwitchLabel(): string {
    return this.locale.other === 'en'
      ? $localize`:@@lang.toEn:Ver el sitio en inglés`
      : $localize`:@@lang.toEs:Ver el sitio en español`;
  }
}
