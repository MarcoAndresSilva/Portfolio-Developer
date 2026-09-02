import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme.service';

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

  protected readonly nav: NavItem[] = [
    { label: 'Sobre mí', fragment: 'sobre-mi' },
    { label: 'Stack', fragment: 'stack' },
    { label: 'Proyectos', fragment: 'proyectos' },
    { label: 'Experiencia', fragment: 'experiencia' },
    { label: 'Contacto', fragment: 'contacto' },
  ];

  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
