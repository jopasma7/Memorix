/* ── Memorix i18n ─────────────────────────────────────────────── */
const TRANSLATIONS = {
  es: {
    // Sidebar
    'nav.dashboard':      'Dashboard',
    'nav.deceased':       'Difuntos',
    'nav.plots':          'Parcelas',
    'nav.events':         'Eventos',
    'nav.inventory':      'Inventario',
    'nav.orders':         'Pedidos',
    'nav.reports':        'Reportes',
    'nav.config':         'Configuración',

    // Dashboard
    'dash.title':         'Dashboard',
    'dash.subtitle':      'Resumen general del sistema',
    'dash.total_deceased':'Total Difuntos',
    'dash.total_plots':   'Total Parcelas',
    'dash.occupied':      'Ocupadas',
    'dash.available':     'Disponibles',
    'dash.income_month':  'Ingresos del Mes',
    'dash.occupancy':     'Ocupación',
    'dash.recent':        'Actividad Reciente',

    // Difuntos
    'dec.title':          'Difuntos',
    'dec.subtitle':       'Gestión de registros de difuntos',
    'dec.new':            'Nuevo Difunto',
    'dec.search':         'Buscar difunto...',
    'dec.name':           'Nombre',
    'dec.surnames':       'Apellidos',
    'dec.doc':            'Documento / Cédula',
    'dec.sex':            'Sexo',
    'dec.male':           'Masculino',
    'dec.female':         'Femenino',
    'dec.birthdate':      'Fecha de Nacimiento',
    'dec.deathdate':      'Fecha de Defunción',
    'dec.birthplace':     'Lugar de Nacimiento',
    'dec.cause':          'Causa de Muerte',
    'dec.plot':           'Parcela',
    'dec.status':         'Estado',
    'dec.observations':   'Observaciones',
    'dec.no_plot':        'Sin parcela asignada',
    'dec.available_plot': 'Parcela Disponible',
    'dec.section_personal': 'Datos Personales',
    'dec.section_dates':  'Fechas',
    'dec.section_plot':   'Asignación de Parcela',
    'dec.section_extra':  'Información Adicional',

    // Parcelas
    'plot.title':         'Parcelas',
    'plot.subtitle':      'Gestión de parcelas y nichos',
    'plot.new':           'Nueva Parcela',
    'plot.search':        'Buscar parcela...',
    'plot.code':          'Código',
    'plot.type':          'Tipo',
    'plot.zone':          'Zona',
    'plot.section':       'Sección',
    'plot.row':           'Fila',
    'plot.number':        'Número',
    'plot.location':      'Ubicación',
    'plot.price':         'Precio (€)',
    'plot.status':        'Estado',

    // Reportes
    'rep.title':          'Reportes',
    'rep.subtitle':       'Generación de informes y exportaciones',
    'rep.deceased_list':  'Listado de Difuntos',
    'rep.plots_list':     'Listado de Parcelas',
    'rep.avail_plots':    'Parcelas Disponibles',
    'rep.payments':       'Reporte de Pagos',
    'rep.gen_pdf':        'Generar PDF',
    'rep.issued':         'Emitido',
    'rep.export_csv':     'CSV',
    'rep.export_excel':   'Excel',

    // Configuración
    'cfg.title':          'Configuración',
    'cfg.subtitle':       'Ajustes del sistema y base de datos',
    'cfg.db_title':       'Base de Datos',
    'cfg.db_sub':         'Administración y mantenimiento',
    'cfg.backup':         'Respaldar',
    'cfg.optimize':       'Optimizar',
    'cfg.restore':        'Restaurar',
    'cfg.display_title':  'Visualización',
    'cfg.display_sub':    'Apariencia y preferencias',
    'cfg.theme':          'Tema visual',
    'cfg.theme_light':    'Claro',
    'cfg.theme_dark':     'Oscuro',
    'cfg.theme_auto':     'Automático',
    'cfg.records_page':   'Registros por página',
    'cfg.language':       'Idioma',
    'cfg.org_title':      'Organización',
    'cfg.org_sub':        'Datos para reportes y documentos',
    'cfg.org_name':       'Nombre del Cementerio',
    'cfg.org_address':    'Dirección',
    'cfg.org_phone':      'Teléfono',
    'cfg.save':           'Guardar',
    'cfg.sys_title':      'Información del Sistema',
    'cfg.sys_sub':        'Detalles técnicos',
    'cfg.version':        'Versión',
    'cfg.platform':       'Plataforma',
    'cfg.electron':       'Electron',
    'cfg.about':          'Acerca de',
    'cfg.delete_demo':    'Borrar todos los datos',
    'cfg.db_size':        'Tamaño',
    'cfg.db_status':      'Estado',
    'cfg.db_connected':   'Conectada',

    // Botones comunes
    'btn.save':           'Guardar',
    'btn.cancel':         'Cancelar',
    'btn.edit':           'Editar',
    'btn.delete':         'Eliminar',
    'btn.close':          'Cerrar',
    'btn.new':            'Nuevo',
    'btn.add':            'Agregar',
    'btn.search':         'Buscar',
    'btn.print':          'Imprimir / PDF',
    'btn.back':           'Atrás',

    // Estados
    'status.active':      'Activo',
    'status.transferred': 'Trasladado',
    'status.exhumed':     'Exhumado',
    'status.deleted':     'Eliminado',
    'status.available':   'Disponible',
    'status.occupied':    'Ocupada',
    'status.reserved':    'Reservada',
    'status.maintenance': 'Mantenimiento',

    // Table headers
    'th.full_name':       'Nombre Completo',
    'th.birthdate':       'Fecha Nacimiento',
    'th.deathdate':       'Fecha Defunción',
    'th.actions':         'Acciones',

    // Search
    'nav.search':         'Búsqueda',
    'search.subtitle':    'Búsqueda avanzada de registros',
    'search.filters':     'Filtros de búsqueda',
    'search.city':        'Ciudad',
    'search.death_from':  'Defunción desde',
    'search.death_to':    'Defunción hasta',
    'search.placeholder': 'Escribe para buscar...',

    // Parcela filters
    'pf.all_types':       'Todos los tipos',
    'pf.all_zones':       'Todas las zonas',
    'pf.all_states':      'Todos los estados',

    // Reportes extra
    'rep.pdf_reports':    'Informes PDF',
    'rep.deceased_desc':  'Todos los difuntos registrados con sus datos y parcelas asignadas.',
    'rep.plots_desc':     'Estado actual de todas las parcelas del cementerio.',
    'rep.avail_desc':     'Parcelas libres disponibles para nuevas asignaciones.',
    'rep.payments_desc':  'Historial completo de pagos registrados en el sistema.',

    // Config extra
    'cfg.security_title': 'Seguridad',
    'cfg.security_sub':   'Acceso y contraseña',
    'cfg.display_title':  'Interfaz y Preferencias',
    'cfg.display_sub':    'Personalización general',
    'btn.clear':          'Limpiar',
    'btn.restore':        'Restaurar',

    // Multi-DB
    'db.title':           'Bases de Datos',
    'db.subtitle':        'Gestión de múltiples cementerios',
    'db.current':         'Activa',
    'db.new':             'Nueva Base de Datos',
    'db.open':            'Abrir Existente',
    'db.switch':          'Cambiar',
    'db.create_name':     'Nombre del cementerio',
    'db.switch_confirm':  'La aplicación se reiniciará para cargar la nueva base de datos.',
    'db.switch_title':    'Cambiar base de datos',

    // Edit modals
    'dec.edit':           'Editar Difunto',
    'plot.edit':          'Editar Parcela',

    // Messages
    'msg.no_activity':    'No hay actividad reciente.',
    'msg.sin_asignar':    'Sin asignar',
    'msg.sin_parcela':    'Sin parcela',
    'msg.loading':        'Cargando...',
    'msg.no_familiares':  'No hay familiares registrados.',
    'msg.no_pagos':       'No hay pagos registrados.',
    'msg.searching':      'Buscando...',
    'msg.no_results':     'No se encontraron resultados.',

    // Badges
    'badge.difunto':      'Difunto',
    'badge.parcela':      'Parcela',
    'badge.sistema':      'Sistema',
    'badge.respaldo':     'Respaldo',
    'badge.optimizado':   'Optimizado',
    'badge.accion':       'Acción',

    // Dialog buttons / titles
    'dlg.confirm_delete': 'Confirmar eliminación',
    'dlg.delete_record_q':'¿Eliminar este registro?',
    'dlg.delete_plot_q':  '¿Eliminar esta parcela?',
    'dlg.cannot_undo':    'Esta acción no se puede deshacer.',
    'btn.delete_record':  'Eliminar registro',
    'btn.delete_plot':    'Eliminar parcela',
    'btn.release_delete': 'Liberar y eliminar',
    'btn.refresh':        'Actualizar',
    'btn.add_label':      'Añadir',

    // Table headers (short)
    'th.name':            'Nombre',
    'th.death_date_short':'F. Defunción',
    'th.city':            'Ciudad',
    'th.plot_short':      'Parcela',
    'th.status_short':    'Estado',

    // Pagination
    'pag.showing':        'Mostrando',
    'pag.of':             'de',
    'pag.records':        'registros',
    'pag.prev':           '← Anterior',
    'pag.next':           'Siguiente →',
    'pag.page':           'Página',

    // Familiares
    'fam.new':            'Nuevo Familiar',
    'fam.edit':           'Editar Familiar',

    // Reports titles (used in JS)
    'rep.deceased_list_title': 'Listado de Difuntos',
    'rep.plots_list_title':    'Listado de Parcelas',
    'rep.avail_plots_title':   'Parcelas Disponibles',
    'rep.payments_title':      'Reporte de Pagos',

    // Pagos table
    'pag.method':   'Método',
    'pag.concept':  'Concepto',
    'pag.amount':   'Importe',
    'pag.total_collected': 'Total cobrado',

    // Config card: Base de Datos
    'cfg.db_estado':      'Estado',
    'cfg.db_connected2':  'Conectada',
    'cfg.db_size_label':  'Tamaño',
    'cfg.db_calculating': 'Calculando...',

    // Config card: Seguridad
    'cfg.protection':     'Protección',
    'cfg.protection_on':  'Activa',
    'cfg.change_pwd':     'Cambiar Contraseña',

    // Config card: Organización
    'cfg.org_company':    'Nombre de la Empresa',
    'cfg.org_ph_company': 'Cementerio Municipal...',
    'cfg.org_ph_address': 'Calle, Ciudad...',
    'cfg.org_ph_phone':   '+34 000 000 000',
    'cfg.org_phone_label':'Teléfono / Contacto',
    'cfg.org_data_sub':   'Datos para reportes y PDF',

    // Config card: Sistema
    'cfg.version_label':  'Versión',
    'cfg.platform_label': 'Plataforma',
    'cfg.loading':        'Cargando...',

    // Etiquetas section
    'etq.title':          'Etiquetas y Categorías',
    'etq.subtitle':       'Gestiona los valores disponibles para los campos de parcelas',
    'etq.plot_type':      'Tipo de Parcela',
    'etq.zones':          'Zonas',
    'etq.location':       'Ubicación',
    'etq.add':            'Añadir',
    'etq.empty':          'Sin etiquetas. Añade la primera.',
    'etq.new_label':      'Nueva etiqueta',
    'etq.edit_label':     'Editar etiqueta',
    'etq.del_label':      'Eliminar etiqueta',
    'etq.name':           'Nombre',
    'etq.new_ph':         'Ej: Capilla...',
    'etq.empty_name':     'Escribe un nombre para la etiqueta',
    'etq.added':          'Etiqueta añadida',
    'etq.updated':        'Etiqueta actualizada',
    'etq.deleted':        'Etiqueta eliminada',
    'etq.no_changes':     'No hay cambios',
    'etq.in_use':         'Etiqueta en uso',
    'etq.in_use_edit_msg':'parcela usa el valor "{v}". Ese registro conservará el valor antiguo.<br><br>¿Continuar igualmente?',
    'etq.in_use_edit_msg_pl':'parcelas usan el valor "{v}". Esos registros conservarán el valor antiguo.<br><br>¿Continuar igualmente?',
    'etq.in_use_del_msg': 'parcela usa esta etiqueta. Ese registro conservará el valor aunque la elimines.<br><br>¿Eliminar de todas formas?',
    'etq.in_use_del_msg_pl':'parcelas usan esta etiqueta. Esos registros conservarán el valor aunque la elimines.<br><br>¿Eliminar de todas formas?',
    'etq.del_safe':       '¿Seguro que quieres eliminar esta etiqueta? Los registros existentes no se verán afectados.',
    'etq.dup_error':      'ya existe en esta categoría',

    // Plot delete warning
    'msg.dec_unassigned': 'Los difuntos quedarán sin parcela asignada',

    // Dashboard card tooltips
    'dash.tip_deceased':  'Haz clic para ver todos los difuntos',
    'dash.tip_plots':     'Haz clic para ver todas las parcelas',
    'dash.tip_occupied':  'Haz clic para ver las parcelas ocupadas',
    'dash.tip_available': 'Haz clic para ver las parcelas disponibles',

    // Parcela selected info
    'dec.plot_selected':  'Parcela seleccionada',

    // CRUD success notifications
    'msg.dec_updated':    'Difunto actualizado correctamente',
    'msg.dec_saved':      'Difunto registrado correctamente',
    'msg.dec_deleted':    'Registro eliminado correctamente',
    'msg.plot_updated':   'Parcela actualizada correctamente',
    'msg.plot_saved':     'Parcela creada correctamente',
    'msg.plot_deleted':   'Parcela eliminada correctamente',
    'msg.plot_del_freed': 'Parcela eliminada y difuntos liberados correctamente',
    'msg.fam_updated':    'Familiar actualizado',
    'msg.org_saved':      'Información de organización guardada',
    'msg.pdf_ok':         'PDF generado y abierto correctamente',
    'msg.search_empty':   'Por favor, ingrese al menos un criterio de búsqueda',

    // Form validation
    'val.required':       'Este campo es obligatorio',
    'val.min_length':     'Mínimo {n} caracteres',
    'val.min_value':      'Valor mínimo: {n}',
    'val.gt_value':       'Debe ser mayor que {n}',
    'val.before_death':   'Debe ser anterior a la fecha de defunción',

    // Familiar / pago delete confirmations
    'fam.del_title':      'Confirmar eliminación',
    'fam.del_msg':        '¿Seguro que quieres eliminar este familiar? Esta acción no se puede deshacer.',
    'fam.del_done':       'Familiar eliminado',
    'fam.added':          'Familiar añadido',
    'pay.del_title':      'Confirmar eliminación',
    'pay.del_msg':        '¿Seguro que quieres eliminar este pago? Esta acción no se puede deshacer.',
    'pay.del_done':       'Pago eliminado',
    'pay.saved':          'Pago registrado correctamente',
    'pay.invalid_amount': 'Introduce un monto válido',

    // Login
    'login.welcome':      'Bienvenido',
    'login.subtitle':     'Introduce tu contraseña para acceder al sistema',
    'login.pwd_label':    'Contraseña',
    'login.wrong_pwd':    'Contraseña incorrecta',
    'login.enter':        'Entrar',
    'login.footer_sub':   'Software profesional de gestión empresarial.',

    // Sidebar nav
    'nav.navigation':     'Navegación',

    // Dashboard module labels
    'dash.deceased_label':'Difuntos',
    'dash.plots_label':   'Parcelas',

    // Modal subtitles
    'modal.dec_subtitle': 'Complete los datos del registro',
    'modal.plot_subtitle':'Complete la información de la parcela',

    // Parcela form section label
    'plot.section_info':  'Información de la Parcela',

    // Form generic
    'form.select_ph':     'Seleccionar...',
    'form.notes_ph':      'Notas adicionales...',

    // Form save buttons
    'btn.save_record':    'Guardar Registro',
    'btn.save_plot':      'Guardar Parcela',
    'btn.save_payment':   'Guardar Pago',
    'btn.register_payment':'Registrar Pago',

    // Familiares modal
    'fam.title':          'Familiares / Responsables',
    'fam.relation':       'Relación',
    'fam.is_responsible': 'Es responsable principal',

    // Pagos modal
    'pay.title':          'Pagos y Cobros',
    'pay.new':            'Nuevo Pago',
    'pay.amount':         'Monto',
    'pay.date':           'Fecha',
    'pay.method_label':   'Método de Pago',
    'pay.reference':      'Referencia',
    'pay.concept':        'Concepto',
    'pay.method_cash':    'Efectivo',
    'pay.method_transfer':'Transferencia',
    'pay.method_card':    'Tarjeta',
    'pay.method_check':   'Cheque',

    // Parcelas filters
    'pf.search_ph':       'Buscar código o sección...',
    'status.all_option':  'Todos',
    'status.disponible_opt': 'Disponible',
    'status.ocupada_opt': 'Ocupada',

    // Reports cards
    'rep.card1_title':    'Listado de Difuntos',
    'rep.card1_desc':     'Todos los difuntos registrados con sus datos y parcelas asignadas.',
    'rep.card2_title':    'Listado de Parcelas',
    'rep.card2_desc':     'Estado actual de todas las parcelas del cementerio.',
    'rep.card3_title':    'Parcelas Disponibles',
    'rep.card3_desc':     'Parcelas libres disponibles para nuevas asignaciones.',
    'rep.card4_title':    'Reporte de Pagos',
    'rep.card4_desc':     'Historial completo de pagos registrados en el sistema.',

    // Difunto modal form
    'dec.personal_data':  'Datos Personales',
    'dec.name_req':       'Nombre',
    'dec.surnames_req':   'Apellidos',
    'dec.name_ph':        'Ej: Juan',
    'dec.surnames_ph':    'Ej: García López',
    'dec.document':       'Documento / Cédula',
    'dec.document_ph':    'Ej: 001-123456-0001A',
    'dec.sex_req':        'Sexo',
    'dec.sex_m':          'Masculino',
    'dec.sex_f':          'Femenino',
    'dec.dates':          'Fechas',
    'dec.deathdate_req':  'Fecha de Defunción',
    'dec.plot_assign':    'Asignación de Parcela',
    'dec.plot_avail':     'Parcela Disponible',
    'dec.extra_info':     'Información Adicional',
    'dec.birthplace_ph':  'Escribe para buscar ciudades...',
    'dec.cause_of_death': 'Causa de Muerte',
    'dec.cause_ph':       'Ej: Paro cardíaco',

    // Parcela modal form
    'plot.code_req':      'Código',
    'plot.code_ph':       'Ej: A-1-001',
    'plot.type_req':      'Tipo',
    'plot.zone_req':      'Zona',
    'plot.location_req':  'Ubicación',
    'plot.section_req':   'Sección',
    'plot.section_ph':    'Ej: A',
    'plot.row_ph':        'Ej: 3',
    'plot.number_req':    'Número',
    'plot.number_ph':     'Ej: 12',

    // Familiares modal form
    'fam.relation_req':   'Relación',
    'fam.rel_spouse':     'Cónyuge',
    'fam.rel_child':      'Hijo/a',
    'fam.rel_parent':     'Padre/Madre',
    'fam.rel_sibling':    'Hermano/a',
    'fam.rel_grandchild': 'Nieto/a',
    'fam.rel_nephew':     'Sobrino/a',
    'fam.rel_other':      'Otro',
    'fam.phone':          'Teléfono',
    'fam.email':          'Email',
    'fam.cedula':         'Cédula / DNI',
    'fam.cedula_ph':      'Documento de identidad',
    'fam.address':        'Dirección',
    'fam.address_ph':     'Dirección completa',

    // Pagos modal form
    'pay.amount_req':     'Monto',
    'pay.date_req':       'Fecha',
    'pay.reference_ph':   'Nº de comprobante...',
    'pay.concept_ph':     'Ej: Mantenimiento anual...',

    // Config org address label
    'cfg.org_address':    'Dirección',

    // App tagline
    'app.tagline':        'Gestión Empresarial',

    // Backup / optimize dialogs
    'cfg.backup_title':   'Respaldar base de datos',
    'cfg.backup_where':   '¿Dónde deseas guardar el respaldo?',
    'cfg.backup_cancelled': 'Operación de respaldo cancelada',
    'cfg.folder_cancelled': 'Selección de carpeta cancelada',
    'cfg.backup_starting': 'Iniciando respaldo de base de datos...',
    'cfg.backup_done':    'Respaldo completado exitosamente',
    'cfg.backup_custom_loc': 'Ubicación personalizada',
    'cfg.backup_default_loc': 'Carpeta por defecto (backups/)',
    'cfg.file':           'Archivo',
    'cfg.size':           'Tamaño',
    'cfg.location':       'Ubicación',
    'cfg.date':           'Fecha',
    'cfg.optimizing':     'Optimizando base de datos...',
    'cfg.optimize_done':  'Base de datos optimizada',
    'cfg.exec_time':      'Tiempo',
    'cfg.restore_title':  'Restaurar configuración',
    'cfg.restore_msg':    'Se restaurarán todas las preferencias a sus valores originales (tema claro, 50 registros por página).<br><br>Esta acción no se puede deshacer.',
    'cfg.restore_done':   'Configuración restaurada correctamente',
    'cfg.prefs_saved':    'Preferencias guardadas correctamente',

    // Activity actions
    'act.deleted_m':      'Eliminado',
    'act.deleted_f':      'Eliminada',
    'act.modified_m':     'Modificado',
    'act.modified_f':     'Modificada',
    'act.new_record':     'Nuevo registro',
    'act.new_plot':       'Nueva parcela',
    'act.backup':         'Respaldo',
    'act.optimized':      'Optimizado',

    // Delete all data dialog
    'del.all_title':      '¿Eliminar TODOS los datos?',
    'del.all_desc':       'Esta acción eliminará difuntos, parcelas, pagos y familiares. <strong>No se puede deshacer.</strong>',
    'del.all_warning':    'Se eliminarán todos los registros de la base de datos permanentemente.',
    'del.all_done':       'Todos los datos han sido eliminados',

    // Parcela assigned message
    'dec.plot_assigned':  'Parcela asignada',

    // About dialog
    'about.developer':    'Desarrollador',
    'about.dev_role':     'Desarrollador de Software · España',
    'about.features':     'Funcionalidades',
    'about.feat_deceased':'Gestión de Difuntos',
    'about.feat_plots':   'Administración de Parcelas',
    'about.feat_search':  'Búsqueda Avanzada',
    'about.feat_backup':  'Respaldo de Datos',
    'about.feat_reports': 'Reportes y Estadísticas',
    'about.feat_family':  'Gestión de Familiares',
    'about.rights':       'Todos los derechos reservados',

    // Change password dialog
    'pwd.desc':           'Introduce tu contraseña actual y la nueva contraseña para continuar.',
    'pwd.current':        'Contraseña actual',
    'pwd.new':            'Nueva contraseña',
    'pwd.new_ph':         'Mínimo 4 caracteres',
    'pwd.confirm':        'Confirmar nueva contraseña',
    'pwd.confirm_ph':     'Repite la nueva contraseña',
    'pwd.wrong_current':  'Contraseña actual incorrecta',
    'pwd.too_short':      'La nueva contraseña debe tener al menos 4 caracteres',
    'pwd.no_match':       'Las contraseñas no coinciden',
    'pwd.changed_ok':     'Contraseña cambiada correctamente',

    // Onboarding
    'ob.welcome':         'Bienvenido a Memorix',
    'ob.welcome_sub':     'Sistema de gestión de cementerio · Configuración inicial',
    'ob.step1_title':     'Datos de tu organización',
    'ob.step1_desc':      'Estos datos aparecerán en los reportes PDF y documentos generados.',
    'ob.org_name_label':  'Nombre del Cementerio / Organización *',
    'ob.org_name_ph':     'Ej: Cementerio Municipal San José',
    'ob.step2_title':     'Preferencias del sistema',
    'ob.step2_desc':      'Ajusta el aspecto y comportamiento de Memorix.',
    'ob.records_25':      '25 registros',
    'ob.records_50':      '50 registros (recomendado)',
    'ob.records_100':     '100 registros',
    'ob.lang_label':      'Idioma / Language',
    'ob.step3_title':     '¡Todo listo!',
    'ob.step3_desc':      'Memorix está configurado y listo para usar. Aquí un resumen de lo que puedes hacer:',
    'ob.feat1':           'Registrar difuntos y asignarlos a parcelas',
    'ob.feat2':           'Gestionar parcelas y su estado de ocupación',
    'ob.feat3':           'Registrar pagos y generar reportes PDF',
    'ob.feat4':           'Exportar datos a CSV y Excel',
    'ob.next':            'Siguiente →',
    'ob.start':           'Comenzar →',

    // CSV / Excel export column headers
    'exp.num':            '#',
    'exp.name':           'Nombre',
    'exp.surnames':       'Apellidos',
    'exp.id_doc':         'Cédula',
    'exp.sex':            'Sexo',
    'exp.birthdate':      'Fecha Nacimiento',
    'exp.deathdate':      'Fecha Defunción',
    'exp.birthplace':     'Lugar Nacimiento',
    'exp.cause':          'Causa Muerte',
    'exp.plot':           'Parcela',
    'exp.status':         'Estado',
    'exp.observations':   'Observaciones',
    'exp.code':           'Código',
    'exp.type':           'Tipo',
    'exp.zone':           'Zona',
    'exp.section':        'Sección',
    'exp.row':            'Fila',
    'exp.number':         'Número',
    'exp.location':       'Ubicación',
    'exp.price_eur':      'Precio (€)',
    'exp.date':           'Fecha',
    'exp.concept':        'Concepto',
    'exp.method':         'Método de Pago',
    'exp.amount_eur':     'Monto (€)',
    'exp.male':           'Masculino',
    'exp.female':         'Femenino',
    'exp.generated':      'Generado',
    'exp.total_records':  'Total de registros',
    'exp.address_label':  'Dirección',
    'exp.contact':        'Contacto',
    'exp.dec_list':       'Listado de Difuntos',
    'exp.plot_list':      'Listado de Parcelas',
    'exp.avail_list':     'Parcelas Disponibles',
    'exp.pay_report':     'Reporte de Pagos',
    'exp.csv_success':    'CSV exportado: {n} registros',
    'exp.dec_sheet':      'Difuntos',
    'exp.plot_sheet':     'Parcelas',
    'exp.avail_sheet':    'Disponibles',

    // Dashboard activity refresh
    'dash.refreshing':      '⟳ Actualizando...',
    'msg.activity_updated': 'Actividad reciente actualizada',
    'dash.activity_updated':'✨ Actividad Actualizada',

    // Search result count
    'search.count_one':    'resultado',
    'search.count_many':   'resultados',

    // Plot delete dialog
    'plot.del_safe':       'Sin difuntos asignados — eliminación segura',
    'plot.del_with_one':   'Parcela con {n} difunto asignado',
    'plot.del_with_many':  'Parcela con {n} difuntos asignados',

    // Language change notification
    'msg.lang_changed':    'Idioma cambiado a Español',

    // Multi-DB messages
    'db.empty':            'No hay bases de datos registradas.',
    'db.load_error':       'Error cargando bases de datos.',
    'db.folder_label':     'Carpeta de destino *',
    'db.folder_ph':        'Selecciona carpeta...',
    'db.browse':           'Explorar',
    'db.create':           'Crear',
    'db.fill_all':         'Completa todos los campos.',
    'db.created':          'Base de datos creada: {n}',
    'db.opened':           'Base de datos añadida.',

    // Onboarding finish
    'ob.saved':            '¡Configuración guardada! Bienvenido a Memorix.',

    // Excel export success
    'exp.excel_saved':     'Excel guardado en Descargas: {n}',

    // Error messages
    'err.load_data':       'Error al cargar los datos: {n}',
    'err.load_stats':      'Error al cargar las estadísticas',
    'err.refresh_activity':'Error al actualizar actividad reciente',
    'err.load_dec':        'Error al cargar los difuntos',
    'err.load_plots':      'Error al cargar las parcelas',
    'err.save_dec':        'Error al procesar el difunto: {n}',
    'err.save_plot':       'Error al procesar la parcela: {n}',
    'err.search':          'Error al actualizar los resultados de búsqueda: {n}',
    'err.load_dec_data':   'Error al cargar los datos del difunto',
    'err.del_record':      'Error al eliminar el registro',
    'err.load_dec_info':   'Error al cargar la información del difunto',
    'err.load_plot_data':  'Error al cargar los datos de la parcela',
    'err.verify_plot':     'Error al verificar la parcela: {n}',
    'err.del_plot':        'Error al procesar la eliminación de la parcela',
    'err.del_plot_msg':    'Error al eliminar la parcela: {n}',
    'err.backup':          'Error al crear el respaldo: {n}',
    'err.optimize':        'Error al optimizar: {n}',
    'err.save_prefs':      'Error al guardar preferencias: {n}',
    'err.restore_cfg':     'Error al restaurar configuraciones: {n}',
    'err.gen_pdf':         'Error al generar PDF: {n}',
    'err.export_csv':      'Error al exportar CSV: {n}',
    'err.export_excel':    'Error al exportar Excel: {n}',
    'err.del_data':        'Error al eliminar datos: {n}',
  },

  en: {
    // Sidebar
    'nav.dashboard':      'Dashboard',
    'nav.deceased':       'Deceased',
    'nav.plots':          'Plots',
    'nav.events':         'Events',
    'nav.inventory':      'Inventory',
    'nav.orders':         'Orders',
    'nav.reports':        'Reports',
    'nav.config':         'Settings',

    // Dashboard
    'dash.title':         'Dashboard',
    'dash.subtitle':      'General system overview',
    'dash.total_deceased':'Total Deceased',
    'dash.total_plots':   'Total Plots',
    'dash.occupied':      'Occupied',
    'dash.available':     'Available',
    'dash.income_month':  'Monthly Income',
    'dash.occupancy':     'Occupancy',
    'dash.recent':        'Recent Activity',

    // Difuntos
    'dec.title':          'Deceased',
    'dec.subtitle':       'Deceased records management',
    'dec.new':            'New Record',
    'dec.search':         'Search deceased...',
    'dec.name':           'Name',
    'dec.surnames':       'Surnames',
    'dec.doc':            'Document / ID',
    'dec.sex':            'Sex',
    'dec.male':           'Male',
    'dec.female':         'Female',
    'dec.birthdate':      'Date of Birth',
    'dec.deathdate':      'Date of Death',
    'dec.birthplace':     'Place of Birth',
    'dec.cause':          'Cause of Death',
    'dec.plot':           'Plot',
    'dec.status':         'Status',
    'dec.observations':   'Observations',
    'dec.no_plot':        'No plot assigned',
    'dec.available_plot': 'Available Plot',
    'dec.section_personal': 'Personal Data',
    'dec.section_dates':  'Dates',
    'dec.section_plot':   'Plot Assignment',
    'dec.section_extra':  'Additional Info',

    // Parcelas
    'plot.title':         'Plots',
    'plot.subtitle':      'Plots and niches management',
    'plot.new':           'New Plot',
    'plot.search':        'Search plot...',
    'plot.code':          'Code',
    'plot.type':          'Type',
    'plot.zone':          'Zone',
    'plot.section':       'Section',
    'plot.row':           'Row',
    'plot.number':        'Number',
    'plot.location':      'Location',
    'plot.price':         'Price (€)',
    'plot.status':        'Status',

    // Reportes
    'rep.title':          'Reports',
    'rep.subtitle':       'Reports and data exports',
    'rep.deceased_list':  'Deceased List',
    'rep.plots_list':     'Plots List',
    'rep.avail_plots':    'Available Plots',
    'rep.payments':       'Payments Report',
    'rep.gen_pdf':        'Generate PDF',
    'rep.issued':         'Issued',
    'rep.export_csv':     'CSV',
    'rep.export_excel':   'Excel',

    // Configuración
    'cfg.title':          'Settings',
    'cfg.subtitle':       'System and database settings',
    'cfg.db_title':       'Database',
    'cfg.db_sub':         'Administration and maintenance',
    'cfg.backup':         'Backup',
    'cfg.optimize':       'Optimize',
    'cfg.restore':        'Restore',
    'cfg.display_title':  'Display',
    'cfg.display_sub':    'Appearance and preferences',
    'cfg.theme':          'Theme',
    'cfg.theme_light':    'Light',
    'cfg.theme_dark':     'Dark',
    'cfg.theme_auto':     'Auto',
    'cfg.records_page':   'Records per page',
    'cfg.language':       'Language',
    'cfg.org_title':      'Organization',
    'cfg.org_sub':        'Data for reports and documents',
    'cfg.org_name':       'Cemetery Name',
    'cfg.org_address':    'Address',
    'cfg.org_phone':      'Phone',
    'cfg.save':           'Save',
    'cfg.sys_title':      'System Info',
    'cfg.sys_sub':        'Technical details',
    'cfg.version':        'Version',
    'cfg.platform':       'Platform',
    'cfg.electron':       'Electron',
    'cfg.about':          'About',
    'cfg.delete_demo':    'Delete all data',
    'cfg.db_size':        'Size',
    'cfg.db_status':      'Status',
    'cfg.db_connected':   'Connected',

    // Botones comunes
    'btn.save':           'Save',
    'btn.cancel':         'Cancel',
    'btn.edit':           'Edit',
    'btn.delete':         'Delete',
    'btn.close':          'Close',
    'btn.new':            'New',
    'btn.add':            'Add',
    'btn.search':         'Search',
    'btn.print':          'Print / PDF',
    'btn.back':           'Back',

    // Estados
    'status.active':      'Active',
    'status.transferred': 'Transferred',
    'status.exhumed':     'Exhumed',
    'status.deleted':     'Deleted',
    'status.available':   'Available',
    'status.occupied':    'Occupied',
    'status.reserved':    'Reserved',
    'status.maintenance': 'Maintenance',

    // Table headers
    'th.full_name':       'Full Name',
    'th.birthdate':       'Date of Birth',
    'th.deathdate':       'Date of Death',
    'th.actions':         'Actions',

    // Search
    'nav.search':         'Search',
    'search.subtitle':    'Advanced record search',
    'search.filters':     'Search filters',
    'search.city':        'City',
    'search.death_from':  'Death from',
    'search.death_to':    'Death to',
    'search.placeholder': 'Type to search...',

    // Parcela filters
    'pf.all_types':       'All types',
    'pf.all_zones':       'All zones',
    'pf.all_states':      'All statuses',

    // Reportes extra
    'rep.pdf_reports':    'PDF Reports',
    'rep.deceased_desc':  'All registered deceased with their data and assigned plots.',
    'rep.plots_desc':     'Current status of all cemetery plots.',
    'rep.avail_desc':     'Free plots available for new assignments.',
    'rep.payments_desc':  'Complete history of payments registered in the system.',

    // Config extra
    'cfg.security_title': 'Security',
    'cfg.security_sub':   'Access and password',
    'cfg.display_title':  'Interface & Preferences',
    'cfg.display_sub':    'General customization',
    'btn.clear':          'Clear',
    'btn.restore':        'Restore',

    // Multi-DB
    'db.title':           'Databases',
    'db.subtitle':        'Multi-cemetery management',
    'db.current':         'Active',
    'db.new':             'New Database',
    'db.open':            'Open Existing',
    'db.switch':          'Switch',
    'db.create_name':     'Cemetery name',
    'db.switch_confirm':  'The application will restart to load the new database.',
    'db.switch_title':    'Switch database',

    // Edit modals
    'dec.edit':           'Edit Deceased',
    'plot.edit':          'Edit Plot',

    // Messages
    'msg.no_activity':    'No recent activity.',
    'msg.sin_asignar':    'Unassigned',
    'msg.sin_parcela':    'No plot',
    'msg.loading':        'Loading...',
    'msg.no_familiares':  'No relatives registered.',
    'msg.no_pagos':       'No payments registered.',
    'msg.searching':      'Searching...',
    'msg.no_results':     'No results found.',

    // Badges
    'badge.difunto':      'Deceased',
    'badge.parcela':      'Plot',
    'badge.sistema':      'System',
    'badge.respaldo':     'Backup',
    'badge.optimizado':   'Optimized',
    'badge.accion':       'Action',

    // Dialog buttons / titles
    'dlg.confirm_delete': 'Confirm deletion',
    'dlg.delete_record_q':'Delete this record?',
    'dlg.delete_plot_q':  'Delete this plot?',
    'dlg.cannot_undo':    'This action cannot be undone.',
    'btn.delete_record':  'Delete record',
    'btn.delete_plot':    'Delete plot',
    'btn.release_delete': 'Release and delete',
    'btn.refresh':        'Refresh',
    'btn.add_label':      'Add',

    // Table headers (short)
    'th.name':            'Name',
    'th.death_date_short':'Death date',
    'th.city':            'City',
    'th.plot_short':      'Plot',
    'th.status_short':    'Status',

    // Pagination
    'pag.showing':        'Showing',
    'pag.of':             'of',
    'pag.records':        'records',
    'pag.prev':           '← Previous',
    'pag.next':           'Next →',
    'pag.page':           'Page',

    // Familiares
    'fam.new':            'New Relative',
    'fam.edit':           'Edit Relative',

    // Reports titles (used in JS)
    'rep.deceased_list_title': 'Deceased List',
    'rep.plots_list_title':    'Plots List',
    'rep.avail_plots_title':   'Available Plots',
    'rep.payments_title':      'Payments Report',

    // Pagos table
    'pag.method':   'Method',
    'pag.concept':  'Concept',
    'pag.amount':   'Amount',
    'pag.total_collected': 'Total collected',

    // Config card: Base de Datos
    'cfg.db_estado':      'Status',
    'cfg.db_connected2':  'Connected',
    'cfg.db_size_label':  'Size',
    'cfg.db_calculating': 'Calculating...',

    // Config card: Seguridad
    'cfg.protection':     'Protection',
    'cfg.protection_on':  'Active',
    'cfg.change_pwd':     'Change Password',

    // Config card: Organización
    'cfg.org_company':    'Company Name',
    'cfg.org_ph_company': 'Municipal Cemetery...',
    'cfg.org_ph_address': 'Street, City...',
    'cfg.org_ph_phone':   '+34 000 000 000',
    'cfg.org_phone_label':'Phone / Contact',
    'cfg.org_data_sub':   'Data for reports and PDFs',

    // Config card: Sistema
    'cfg.version_label':  'Version',
    'cfg.platform_label': 'Platform',
    'cfg.loading':        'Loading...',

    // Etiquetas section
    'etq.title':          'Labels & Categories',
    'etq.subtitle':       'Manage available values for plot fields',
    'etq.plot_type':      'Plot Type',
    'etq.zones':          'Zones',
    'etq.location':       'Location',
    'etq.add':            'Add',
    'etq.empty':          'No labels. Add the first one.',
    'etq.new_label':      'New label',
    'etq.edit_label':     'Edit label',
    'etq.del_label':      'Delete label',
    'etq.name':           'Name',
    'etq.new_ph':         'E.g.: Chapel...',
    'etq.empty_name':     'Please enter a name for the label',
    'etq.added':          'Label added',
    'etq.updated':        'Label updated',
    'etq.deleted':        'Label deleted',
    'etq.no_changes':     'No changes',
    'etq.in_use':         'Label in use',
    'etq.in_use_edit_msg':'plot uses the value "{v}". That record will keep the old value.<br><br>Continue anyway?',
    'etq.in_use_edit_msg_pl':'{n} plots use the value "{v}". Those records will keep the old value.<br><br>Continue anyway?',
    'etq.in_use_del_msg': 'plot uses this label. That record will keep the value even after deletion.<br><br>Delete anyway?',
    'etq.in_use_del_msg_pl':'{n} plots use this label. Those records will keep the value even after deletion.<br><br>Delete anyway?',
    'etq.del_safe':       'Are you sure you want to delete this label? Existing records will not be affected.',
    'etq.dup_error':      'already exists in this category',

    // Plot delete warning
    'msg.dec_unassigned': 'Deceased records will be left without a plot assignment',

    // Dashboard card tooltips
    'dash.tip_deceased':  'Click to view all deceased',
    'dash.tip_plots':     'Click to view all plots',
    'dash.tip_occupied':  'Click to view occupied plots',
    'dash.tip_available': 'Click to view available plots',

    // Parcela selected info
    'dec.plot_selected':  'Selected plot',

    // CRUD success notifications
    'msg.dec_updated':    'Deceased record updated successfully',
    'msg.dec_saved':      'Deceased record registered successfully',
    'msg.dec_deleted':    'Record deleted successfully',
    'msg.plot_updated':   'Plot updated successfully',
    'msg.plot_saved':     'Plot created successfully',
    'msg.plot_deleted':   'Plot deleted successfully',
    'msg.plot_del_freed': 'Plot deleted and deceased records released successfully',
    'msg.fam_updated':    'Relative updated',
    'msg.org_saved':      'Organization information saved',
    'msg.pdf_ok':         'PDF generated and opened successfully',
    'msg.search_empty':   'Please enter at least one search criterion',

    // Form validation
    'val.required':       'This field is required',
    'val.min_length':     'Minimum {n} characters',
    'val.min_value':      'Minimum value: {n}',
    'val.gt_value':       'Must be greater than {n}',
    'val.before_death':   'Must be before the date of death',

    // Familiar / pago delete confirmations
    'fam.del_title':      'Confirm deletion',
    'fam.del_msg':        'Are you sure you want to remove this relative? This action cannot be undone.',
    'fam.del_done':       'Relative removed',
    'fam.added':          'Relative added',
    'pay.del_title':      'Confirm deletion',
    'pay.del_msg':        'Are you sure you want to delete this payment? This action cannot be undone.',
    'pay.del_done':       'Payment deleted',
    'pay.saved':          'Payment registered successfully',
    'pay.invalid_amount': 'Please enter a valid amount',

    // Login
    'login.welcome':      'Welcome',
    'login.subtitle':     'Enter your password to access the system',
    'login.pwd_label':    'Password',
    'login.wrong_pwd':    'Incorrect password',
    'login.enter':        'Sign In',
    'login.footer_sub':   'Professional business management software.',

    // Sidebar nav
    'nav.navigation':     'Navigation',

    // Dashboard module labels
    'dash.deceased_label':'Deceased',
    'dash.plots_label':   'Plots',

    // Modal subtitles
    'modal.dec_subtitle': 'Complete the record details',
    'modal.plot_subtitle':'Complete the plot information',

    // Parcela form section label
    'plot.section_info':  'Plot Information',

    // Form generic
    'form.select_ph':     'Select...',
    'form.notes_ph':      'Additional notes...',

    // Form save buttons
    'btn.save_record':    'Save Record',
    'btn.save_plot':      'Save Plot',
    'btn.save_payment':   'Save Payment',
    'btn.register_payment':'Register Payment',

    // Familiares modal
    'fam.title':          'Family / Contacts',
    'fam.relation':       'Relationship',
    'fam.is_responsible': 'Is main contact',

    // Pagos modal
    'pay.title':          'Payments',
    'pay.new':            'New Payment',
    'pay.amount':         'Amount',
    'pay.date':           'Date',
    'pay.method_label':   'Payment Method',
    'pay.reference':      'Reference',
    'pay.concept':        'Concept',
    'pay.method_cash':    'Cash',
    'pay.method_transfer':'Transfer',
    'pay.method_card':    'Card',
    'pay.method_check':   'Check',

    // Parcelas filters
    'pf.search_ph':       'Search code or section...',
    'status.all_option':  'All',
    'status.disponible_opt': 'Available',
    'status.ocupada_opt': 'Occupied',

    // Reports cards
    'rep.card1_title':    'Deceased List',
    'rep.card1_desc':     'All registered deceased with their data and assigned plots.',
    'rep.card2_title':    'Plots List',
    'rep.card2_desc':     'Current status of all cemetery plots.',
    'rep.card3_title':    'Available Plots',
    'rep.card3_desc':     'Free plots available for new assignments.',
    'rep.card4_title':    'Payments Report',
    'rep.card4_desc':     'Complete history of payments registered in the system.',

    // Difunto modal form
    'dec.personal_data':  'Personal Data',
    'dec.name_req':       'Name',
    'dec.surnames_req':   'Surnames',
    'dec.name_ph':        'E.g.: John',
    'dec.surnames_ph':    'E.g.: Smith Jones',
    'dec.document':       'Document / ID',
    'dec.document_ph':    'E.g.: 001-123456-0001A',
    'dec.sex_req':        'Sex',
    'dec.sex_m':          'Male',
    'dec.sex_f':          'Female',
    'dec.dates':          'Dates',
    'dec.deathdate_req':  'Date of Death',
    'dec.plot_assign':    'Plot Assignment',
    'dec.plot_avail':     'Available Plot',
    'dec.extra_info':     'Additional Information',
    'dec.birthplace_ph':  'Type to search cities...',
    'dec.cause_of_death': 'Cause of Death',
    'dec.cause_ph':       'E.g.: Cardiac arrest',

    // Parcela modal form
    'plot.code_req':      'Code',
    'plot.code_ph':       'E.g.: A-1-001',
    'plot.type_req':      'Type',
    'plot.zone_req':      'Zone',
    'plot.location_req':  'Location',
    'plot.section_req':   'Section',
    'plot.section_ph':    'E.g.: A',
    'plot.row_ph':        'E.g.: 3',
    'plot.number_req':    'Number',
    'plot.number_ph':     'E.g.: 12',

    // Familiares modal form
    'fam.relation_req':   'Relationship',
    'fam.rel_spouse':     'Spouse',
    'fam.rel_child':      'Son/Daughter',
    'fam.rel_parent':     'Father/Mother',
    'fam.rel_sibling':    'Brother/Sister',
    'fam.rel_grandchild': 'Grandchild',
    'fam.rel_nephew':     'Nephew/Niece',
    'fam.rel_other':      'Other',
    'fam.phone':          'Phone',
    'fam.email':          'Email',
    'fam.cedula':         'ID / Document',
    'fam.cedula_ph':      'Identity document',
    'fam.address':        'Address',
    'fam.address_ph':     'Full address',

    // Pagos modal form
    'pay.amount_req':     'Amount',
    'pay.date_req':       'Date',
    'pay.reference_ph':   'Receipt number...',
    'pay.concept_ph':     'E.g.: Annual maintenance...',

    // Config org address label
    'cfg.org_address':    'Address',

    // App tagline
    'app.tagline':        'Business Management',

    // Backup / optimize dialogs
    'cfg.backup_title':   'Backup database',
    'cfg.backup_where':   'Where do you want to save the backup?',
    'cfg.backup_cancelled': 'Backup operation cancelled',
    'cfg.folder_cancelled': 'Folder selection cancelled',
    'cfg.backup_starting': 'Starting database backup...',
    'cfg.backup_done':    'Backup completed successfully',
    'cfg.backup_custom_loc': 'Custom location',
    'cfg.backup_default_loc': 'Default folder (backups/)',
    'cfg.file':           'File',
    'cfg.size':           'Size',
    'cfg.location':       'Location',
    'cfg.date':           'Date',
    'cfg.optimizing':     'Optimizing database...',
    'cfg.optimize_done':  'Database optimized',
    'cfg.exec_time':      'Time',
    'cfg.restore_title':  'Restore settings',
    'cfg.restore_msg':    'All preferences will be restored to their original values (light theme, 50 records per page).<br><br>This action cannot be undone.',
    'cfg.restore_done':   'Settings restored successfully',
    'cfg.prefs_saved':    'Preferences saved successfully',

    // Activity actions
    'act.deleted_m':      'Deleted',
    'act.deleted_f':      'Deleted',
    'act.modified_m':     'Modified',
    'act.modified_f':     'Modified',
    'act.new_record':     'New record',
    'act.new_plot':       'New plot',
    'act.backup':         'Backup',
    'act.optimized':      'Optimized',

    // Delete all data dialog
    'del.all_title':      'Delete ALL data?',
    'del.all_desc':       'This action will delete deceased records, plots, payments and relatives. <strong>This cannot be undone.</strong>',
    'del.all_warning':    'All records will be permanently removed from the database.',
    'del.all_done':       'All data has been deleted',

    // Parcela assigned message
    'dec.plot_assigned':  'Assigned plot',

    // About dialog
    'about.developer':    'Developer',
    'about.dev_role':     'Software Developer · Spain',
    'about.features':     'Features',
    'about.feat_deceased':'Deceased Management',
    'about.feat_plots':   'Plot Administration',
    'about.feat_search':  'Advanced Search',
    'about.feat_backup':  'Data Backup',
    'about.feat_reports': 'Reports & Statistics',
    'about.feat_family':  'Family Management',
    'about.rights':       'All rights reserved',

    // Change password dialog
    'pwd.desc':           'Enter your current password and new password to continue.',
    'pwd.current':        'Current password',
    'pwd.new':            'New password',
    'pwd.new_ph':         'Minimum 4 characters',
    'pwd.confirm':        'Confirm new password',
    'pwd.confirm_ph':     'Repeat the new password',
    'pwd.wrong_current':  'Current password is incorrect',
    'pwd.too_short':      'New password must be at least 4 characters',
    'pwd.no_match':       'Passwords do not match',
    'pwd.changed_ok':     'Password changed successfully',

    // Onboarding
    'ob.welcome':         'Welcome to Memorix',
    'ob.welcome_sub':     'Cemetery management system · Initial setup',
    'ob.step1_title':     'Your organization details',
    'ob.step1_desc':      'This data will appear in PDF reports and generated documents.',
    'ob.org_name_label':  'Cemetery / Organization Name *',
    'ob.org_name_ph':     'E.g.: Municipal Cemetery San José',
    'ob.step2_title':     'System preferences',
    'ob.step2_desc':      'Adjust the look and behavior of Memorix.',
    'ob.records_25':      '25 records',
    'ob.records_50':      '50 records (recommended)',
    'ob.records_100':     '100 records',
    'ob.lang_label':      'Language / Idioma',
    'ob.step3_title':     'All set!',
    'ob.step3_desc':      'Memorix is configured and ready to use. Here\'s a summary of what you can do:',
    'ob.feat1':           'Register deceased and assign them to plots',
    'ob.feat2':           'Manage plots and their occupancy status',
    'ob.feat3':           'Record payments and generate PDF reports',
    'ob.feat4':           'Export data to CSV and Excel',
    'ob.next':            'Next →',
    'ob.start':           'Get Started →',

    // CSV / Excel export column headers
    'exp.num':            '#',
    'exp.name':           'Name',
    'exp.surnames':       'Surnames',
    'exp.id_doc':         'ID / Document',
    'exp.sex':            'Sex',
    'exp.birthdate':      'Birth Date',
    'exp.deathdate':      'Death Date',
    'exp.birthplace':     'Birthplace',
    'exp.cause':          'Cause of Death',
    'exp.plot':           'Plot',
    'exp.status':         'Status',
    'exp.observations':   'Observations',
    'exp.code':           'Code',
    'exp.type':           'Type',
    'exp.zone':           'Zone',
    'exp.section':        'Section',
    'exp.row':            'Row',
    'exp.number':         'Number',
    'exp.location':       'Location',
    'exp.price_eur':      'Price (€)',
    'exp.date':           'Date',
    'exp.concept':        'Concept',
    'exp.method':         'Payment Method',
    'exp.amount_eur':     'Amount (€)',
    'exp.male':           'Male',
    'exp.female':         'Female',
    'exp.generated':      'Generated',
    'exp.total_records':  'Total records',
    'exp.address_label':  'Address',
    'exp.contact':        'Contact',
    'exp.dec_list':       'Deceased List',
    'exp.plot_list':      'Plots List',
    'exp.avail_list':     'Available Plots',
    'exp.pay_report':     'Payments Report',
    'exp.csv_success':    'CSV exported: {n} records',
    'exp.dec_sheet':      'Deceased',
    'exp.plot_sheet':     'Plots',
    'exp.avail_sheet':    'Available',

    // Dashboard activity refresh
    'dash.refreshing':      '⟳ Refreshing...',
    'msg.activity_updated': 'Recent activity updated',
    'dash.activity_updated':'✨ Activity Updated',

    // Search result count
    'search.count_one':    'result',
    'search.count_many':   'results',

    // Plot delete dialog
    'plot.del_safe':       'No deceased assigned — safe to delete',
    'plot.del_with_one':   'Plot with {n} assigned deceased',
    'plot.del_with_many':  'Plot with {n} assigned deceased',

    // Language change notification
    'msg.lang_changed':    'Language changed to English',

    // Multi-DB messages
    'db.empty':            'No databases registered.',
    'db.load_error':       'Error loading databases.',
    'db.folder_label':     'Destination folder *',
    'db.folder_ph':        'Select folder...',
    'db.browse':           'Browse',
    'db.create':           'Create',
    'db.fill_all':         'Please fill in all fields.',
    'db.created':          'Database created: {n}',
    'db.opened':           'Database added.',

    // Onboarding finish
    'ob.saved':            'Configuration saved! Welcome to Memorix.',

    // Excel export success
    'exp.excel_saved':     'Excel saved to Downloads: {n}',

    // Error messages
    'err.load_data':       'Error loading data: {n}',
    'err.load_stats':      'Error loading statistics',
    'err.refresh_activity':'Error refreshing recent activity',
    'err.load_dec':        'Error loading deceased records',
    'err.load_plots':      'Error loading plots',
    'err.save_dec':        'Error processing record: {n}',
    'err.save_plot':       'Error processing plot: {n}',
    'err.search':          'Error updating search results: {n}',
    'err.load_dec_data':   'Error loading deceased data',
    'err.del_record':      'Error deleting record',
    'err.load_dec_info':   'Error loading deceased information',
    'err.load_plot_data':  'Error loading plot data',
    'err.verify_plot':     'Error verifying plot: {n}',
    'err.del_plot':        'Error processing plot deletion',
    'err.del_plot_msg':    'Error deleting plot: {n}',
    'err.backup':          'Error creating backup: {n}',
    'err.optimize':        'Error optimizing: {n}',
    'err.save_prefs':      'Error saving preferences: {n}',
    'err.restore_cfg':     'Error restoring settings: {n}',
    'err.gen_pdf':         'Error generating PDF: {n}',
    'err.export_csv':      'Error exporting CSV: {n}',
    'err.export_excel':    'Error exporting Excel: {n}',
    'err.del_data':        'Error deleting data: {n}',
  }
};

class I18n {
  constructor() {
    this.locale = localStorage.getItem('memorix-lang') || 'es';
  }

  t(key, fallback) {
    return (TRANSLATIONS[this.locale] || TRANSLATIONS.es)[key] || fallback || key;
  }

  setLocale(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.locale = lang;
    localStorage.setItem('memorix-lang', lang);
    this.applyToDOM();
  }

  applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      const val = this.t(key);
      if (attr) {
        el.setAttribute(attr, val);
      } else if (el.children.length > 0) {
        // Element has child elements — update only the first direct text node
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = val + ' ';
            break;
          }
        }
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-ph'));
    });
    document.documentElement.lang = this.locale;
  }
}

window.i18n = new I18n();
window.t = (key, fb) => window.i18n.t(key, fb);
