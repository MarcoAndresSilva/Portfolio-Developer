/** Categoría a la que pertenece una habilidad, para agrupar en la sección Stack. */
export type SkillCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'tooling';

export interface Skill {
  /** Nombre visible, ej. 'TypeScript', 'Angular'. */
  name: string;
  category: SkillCategory;
  /** Nivel subjetivo 1-5, opcional (para ordenar o mostrar una barra). */
  level?: number;
  /** Slug del icono (ej. Simple Icons: 'angular', 'nestjs'). */
  icon?: string;
}
