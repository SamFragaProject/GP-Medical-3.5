import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { PermisoModulo } from '@/services/permisosService';

/**
 * Acciones básicas que se pueden realizar en el sistema
 */
export type Action = 'ver' | 'crear' | 'editar' | 'borrar' | 'exportar' | 'aprobar' | 'firmar' | 'imprimir' | 'manage';

/**
 * Sujetos o Módulos del sistema sobre los que se aplican las acciones
 */
export type Subject = string | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>;

/**
 * Crea una instancia de Ability basada en los permisos dinámicos del usuario
 */
export function defineAbilityFor(permisos: PermisoModulo[], isSuperAdmin: boolean) {
    const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (isSuperAdmin) {
        can('manage', 'all');
    } else {
        permisos.forEach(p => {
            const subject = p.modulo_codigo;

            if (p.puede_ver) can('ver', subject);
            if (p.puede_crear) can('crear', subject);
            if (p.puede_editar) can('editar', subject);
            if (p.puede_borrar) can('borrar', subject);
            if (p.puede_exportar) can('exportar', subject);
            if (p.puede_aprobar) can('aprobar', subject);
            if (p.puede_firmar) can('firmar', subject);
            if (p.puede_imprimir) can('imprimir', subject);
        });
    }

    return createMongoAbility<AppAbility>(rules);
}

// Ability inicial vacía
export const defaultAbility = createMongoAbility<AppAbility>([]);
