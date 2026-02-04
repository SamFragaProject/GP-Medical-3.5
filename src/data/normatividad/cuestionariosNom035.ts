export const GUIA_I_ATS = {
    titulo: 'Guía de Referencia I - Acontecimientos Traumáticos Severos',
    descripcion: 'Identificación de los trabajadores que fueron sujetos a acontecimientos traumáticos severos durante o con motivo del trabajo.',
    secciones: [
        {
            titulo: 'I. Acontecimiento traumático severo',
            preguntas: [
                { id: '1', texto: '¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo un acontecimiento como los siguientes: accidente que tenga como consecuencia la muerte, la pérdida de un miembro o una lesión grave; asalto; actos violentos que derivaron en lesiones graves; secuestro; amenazas; o cualquier otro que ponga en riesgo su vida o salud, y/o la de otras personas?', tipo: 'si_no' }
            ]
        },
        {
            titulo: 'II. Recuerdos persistentes sobre el acontecimiento',
            condicion: 'Si contestó SÍ a la pregunta anterior',
            preguntas: [
                { id: '2', texto: '¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provocan malestares?', tipo: 'si_no' },
                { id: '3', texto: '¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?', tipo: 'si_no' }
            ]
        },
        {
            titulo: 'III. Esfuerzo por evitar circunstancias parecidas',
            preguntas: [
                { id: '4', texto: '¿Se ha esforzado por evitar todo tipo de sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?', tipo: 'si_no' },
                { id: '5', texto: '¿Se ha esforzado por evitar todo tipo de actividades, lugares o personas que motivan recuerdos del acontecimiento?', tipo: 'si_no' },
                { id: '6', texto: '¿Ha tenido dificultad para recordar alguna parte importante del evento?', tipo: 'si_no' },
                { id: '7', texto: '¿Ha disminuido su interés en sus actividades cotidianas?', tipo: 'si_no' },
                { id: '8', texto: '¿Se ha sentido usted alejado o distante de los demás?', tipo: 'si_no' },
                { id: '9', texto: '¿Ha notado que tiene dificultad para expresar sus sentimientos?', tipo: 'si_no' },
                { id: '10', texto: '¿Ha tenido la impresión de que su vida se va a acortar, que va a morir antes que otras personas o que tiene un futuro limitado?', tipo: 'si_no' }
            ]
        },
        {
            titulo: 'IV. Afectación',
            preguntas: [
                { id: '11', texto: '¿Ha tenido usted dificultades para dormir?', tipo: 'si_no' },
                { id: '12', texto: '¿Ha estado particularmente irritable o le han dado arranques de coraje?', tipo: 'si_no' },
                { id: '13', texto: '¿Ha tenido dificultad para concentrarse?', tipo: 'si_no' },
                { id: '14', texto: '¿Ha estado nervioso o constantemente en alerta?', tipo: 'si_no' },
                { id: '15', texto: '¿Se ha sobresaltado fácilmente por cualquier cosa?', tipo: 'si_no' }
            ]
        }
    ]
}

export const GUIA_II_RP = {
    titulo: 'Guía de Referencia II - Factores de Riesgo Psicosocial',
    descripcion: 'Identificación y análisis de los factores de riesgo psicosocial (Centros de trabajo de 16 a 50 trabajadores).',
    opciones: [
        { valor: 0, etiqueta: 'Nunca' },
        { valor: 1, etiqueta: 'Casi nunca' },
        { valor: 2, etiqueta: 'Algunas veces' },
        { valor: 3, etiqueta: 'Casi siempre' },
        { valor: 4, etiqueta: 'Siempre' }
    ],
    // Nota: El valor de las opciones se invierte en ciertas preguntas negativas
    secciones: [
        {
            titulo: 'Condiciones del ambiente de trabajo',
            preguntas: [
                { id: '1', texto: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica', inverso: true },
                { id: '2', texto: 'Mi trabajo me exige hacer mucho esfuerzo físico', inverso: false },
                { id: '3', texto: 'Me preocupa sufrir un accidente en mi trabajo', inverso: false },
                { id: '4', texto: 'Considero que las actividades que realizo son peligrosas', inverso: false },
                { id: '5', texto: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', inverso: false }
            ]
        }
        // ... Faltan más preguntas para la implementación completa, se añaden las primeras como modelo
    ]
}
