export interface Notificacion {
    id: string
    empresa_id: string
    usuario_id?: string
    titulo: string
    mensaje: string
    tipo: 'info' | 'warning' | 'error' | 'success'
    leida: boolean
    link?: string
    created_at: string
}
