# Clasificación propuesta de acciones

Declaraciones estáticas; propuesta de clasificación, no fallos confirmados ni instancias renderizadas. Todas requieren aprobación del protocolo, no aprobación individual obligatoria. Las expresiones muestran variantes reales del código.

| ID | Ubicación | Etiqueta / expresión | Tipo propuesto | Revisión |
|---|---|---|---|---|
| A001 | app/app-panel.tsx:8 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A002 | app/app-panel.tsx:13 | (contenido delegado) | navigation | Validar variantes dinámicas |
| A003 | app/app-panel.tsx:13 | "Cerrar panel" | secondary | Validar patrón en contexto |
| A004 | app/choice-chips.tsx:2 | {text} | selection | Validar variantes dinámicas |
| A005 | app/commitment-review.tsx:9 | Decidir mi próximo paso (opcional) | disclosure | Validar patrón en contexto |
| A006 | app/commitment-review.tsx:15 | Explorar un próximo paso | navigation | Validar patrón en contexto |
| A007 | app/commitment-review.tsx:15 | Ajustar este compromiso | secondary | Validar patrón en contexto |
| A008 | app/commitment-review.tsx:16 | {saved?'Editar mi nota y valoración':'Anotar o valorar este período'} | secondary | Validar variantes dinámicas |
| A009 | app/community.tsx:93 | {saved ? "Guardado" : submitLabel} | primary | Validar variantes dinámicas |
| A010 | app/community.tsx:161 | {'Registrar ocasión: '+p.title} | secondary | Validar variantes dinámicas |
| A011 | app/community.tsx:161 | Ver mis registros | navigation | Validar patrón en contexto |
| A012 | app/community.tsx:164 | Cerrar detalle | navigation | Validar patrón en contexto |
| A013 | app/community.tsx:171 | Participar en el propósito | primary | Validar patrón en contexto |
| A014 | app/community.tsx:191 | Cambiar día | disclosure | Validar patrón en contexto |
| A015 | app/community.tsx:203 | {day===localDate()?"Lo viví hoy":"Lo viví ese día"} | navigation | Validar variantes dinámicas |
| A016 | app/community.tsx:226 | Deshacer una ocasión | reversible | Validar patrón en contexto |
| A017 | app/community.tsx:433 | {`Decena ${n}: ${MYSTERIES[r.mystery].items[n-1]}${done?', completada':''}`} | selection | Validar variantes dinámicas |
| A018 | app/community.tsx:458 | {s?.done ? "Acompañar" : "Rezar"} | secondary | Validar variantes dinámicas |
| A019 | app/community.tsx:470 | Reservar | secondary | Validar patrón en contexto |
| A020 | app/community.tsx:482 | Liberar | secondary | Validar patrón en contexto |
| A021 | app/community.tsx:504 | Marcar un compromiso de hoy | disclosure | Validar patrón en contexto |
| A022 | app/community.tsx:557 | Administrar este encuentro | disclosure | Validar patrón en contexto |
| A023 | app/community.tsx:558 | Cancelar el encuentro | sensitive | Validar patrón en contexto |
| A024 | app/community.tsx:592 | {`Avemaría ${i + 1}`} | selection | Validar variantes dinámicas |
| A025 | app/community.tsx:606 | Oraciones para consultar | disclosure | Validar patrón en contexto |
| A026 | app/community.tsx:625 | Consultar los misterios · Santa Sede | navigation | Validar patrón en contexto |
| A027 | app/community.tsx:633 | Terminé de rezar esta decena | primary | Validar patrón en contexto |
| A028 | app/community.tsx:643 | Ya la recé por mi cuenta | secondary | Validar patrón en contexto |
| A029 | app/confession-guide.tsx:16 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A030 | app/confession-guide.tsx:17 | (contenido delegado) | navigation | Validar variantes dinámicas |
| A031 | app/confession-guide.tsx:17 | "Cerrar preparación" | secondary | Validar patrón en contexto |
| A032 | app/confession-guide.tsx:22 | Atrás | navigation | Validar patrón en contexto |
| A033 | app/confession-guide.tsx:22 | {step===0?'Comenzar':'Siguiente'} | primary | Validar variantes dinámicas |
| A034 | app/confession-guide.tsx:22 | Finalizar | primary | Validar patrón en contexto |
| A035 | app/confession-guide.tsx:23 | Orientación y fuentes | disclosure | Validar patrón en contexto |
| A036 | app/confession-guide.tsx:23 | Catecismo, 2052–2055 | navigation | Validar patrón en contexto |
| A037 | app/confession-guide.tsx:23 | Catecismo, 1451–1460 · Contrición, examen, confesión y reparación | navigation | Validar patrón en contexto |
| A038 | app/donation.tsx:23 | Donar | secondary | Validar patrón en contexto |
| A039 | app/donation.tsx:47 | {"Copiar " + label} | secondary | Validar variantes dinámicas |
| A040 | app/donation.tsx:70 | sitio de Schoenstatt Costa Rica | navigation | Validar patrón en contexto |
| A041 | app/formation-guide.tsx:12 | {label} (PDF) | navigation | Validar variantes dinámicas |
| A042 | app/formation-guide.tsx:15 | Repasar el sentido del horario espiritual | disclosure | Validar patrón en contexto |
| A043 | app/formation-guide.tsx:15 | Horario espiritual · Schoenstatt Brasil (portugués) | navigation | Validar patrón en contexto |
| A044 | app/formation-guide.tsx:19 | Ayudame a formularlo | secondary | Validar patrón en contexto |
| A045 | app/formation-guide.tsx:20 | Atrás | navigation | Validar patrón en contexto |
| A046 | app/formation-guide.tsx:20 | Siguiente | secondary | Validar patrón en contexto |
| A047 | app/formation-guide.tsx:20 | Usar como borrador | secondary | Validar patrón en contexto |
| A048 | app/formation-guide.tsx:27 | ¿Y si todavía no tenemos ideal matrimonial? | disclosure | Validar patrón en contexto |
| A049 | app/groups-workspace.tsx:22 | Quitar imagen del símbolo | secondary | Validar patrón en contexto |
| A050 | app/groups-workspace.tsx:22 | Quitar foto | secondary | Validar patrón en contexto |
| A051 | app/groups-workspace.tsx:31 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A052 | app/groups-workspace.tsx:31 | Crear grupo | secondary | Validar patrón en contexto |
| A053 | app/groups-workspace.tsx:31 | Tengo una invitación | secondary | Validar patrón en contexto |
| A054 | app/groups-workspace.tsx:31 | Abrir mi invitación | primary | Validar patrón en contexto |
| A055 | app/groups-workspace.tsx:31 | Mis grupos | navigation | Validar patrón en contexto |
| A056 | app/groups-workspace.tsx:32 | Mi participación | selection | Validar patrón en contexto |
| A057 | app/groups-workspace.tsx:32 | Organizar | selection | Validar patrón en contexto |
| A058 | app/groups-workspace.tsx:33 | Editar identidad y fotos | secondary | Validar patrón en contexto |
| A059 | app/groups-workspace.tsx:33 | Permisos y responsabilidades | secondary | Validar patrón en contexto |
| A060 | app/groups-workspace.tsx:33 | Crear invitación | secondary | Validar patrón en contexto |
| A061 | app/groups-workspace.tsx:33 | Transferir coordinación principal | sensitive | Validar patrón en contexto |
| A062 | app/groups-workspace.tsx:34 | {l} | selection | Validar variantes dinámicas |
| A063 | app/groups-workspace.tsx:35 | Nuevo propósito | secondary | Validar patrón en contexto |
| A064 | app/groups-workspace.tsx:35 | Editar propósito | secondary | Validar patrón en contexto |
| A065 | app/groups-workspace.tsx:36 | Iniciar rosario del grupo | primary | Validar patrón en contexto |
| A066 | app/groups-workspace.tsx:37 | Proponer una intención | secondary | Validar patrón en contexto |
| A067 | app/groups-workspace.tsx:37 | Ofrecer un aporte | primary | Validar patrón en contexto |
| A068 | app/groups-workspace.tsx:37 | Deshacer un aporte de hoy | reversible | Validar patrón en contexto |
| A069 | app/groups-workspace.tsx:38 | {group.meeting?'Editar encuentro':'Preparar encuentro'} | secondary | Validar variantes dinámicas |
| A070 | app/groups-workspace.tsx:38 | Abrir material | navigation | Validar patrón en contexto |
| A071 | app/groups-workspace.tsx:38 | {l} | selection | Validar variantes dinámicas |
| A072 | app/groups-workspace.tsx:38 | {t.done?'Completado · Deshacer':'Marcar completado'} | reversible | Validar variantes dinámicas |
| A073 | app/groups-workspace.tsx:38 | Asignar un encargo | secondary | Validar patrón en contexto |
| A074 | app/groups-workspace.tsx:39 | Compartir aviso o material | secondary | Validar patrón en contexto |
| A075 | app/groups-workspace.tsx:39 | Abrir material | navigation | Validar patrón en contexto |
| A076 | app/groups-workspace.tsx:40 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A077 | app/groups-workspace.tsx:42 | Salir del grupo | sensitive | Validar patrón en contexto |
| A078 | app/groups-workspace.tsx:45 | Consultar invitación | navigation | Validar patrón en contexto |
| A079 | app/groups-workspace.tsx:53 | Copiar enlace | secondary | Validar patrón en contexto |
| A080 | app/groups-workspace.tsx:53 | Revocar invitaciones vigentes | sensitive | Validar patrón en contexto |
| A081 | app/groups-workspace.tsx:55 | Confirmar salida | primary | Validar patrón en contexto |
| A082 | app/habit-fields.tsx:9 | Más opciones (opcional) | disclosure | Validar patrón en contexto |
| A083 | app/home.tsx:8 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A084 | app/home.tsx:8 | Continuar | primary | Validar patrón en contexto |
| A085 | app/home.tsx:8 | Elegir otro comienzo | secondary | Validar patrón en contexto |
| A086 | app/home.tsx:9 | Explorar mi horario sin elegir todavía | navigation | Validar patrón en contexto |
| A087 | app/home.tsx:12 | Entendido | secondary | Validar patrón en contexto |
| A088 | app/install-guide.tsx:12 | {copied?'Enlace copiado':'Compartir enlace de Alianza'} | secondary | Validar variantes dinámicas |
| A089 | app/install-guide.tsx:35 | iPhone · Apple | selection | Validar patrón en contexto |
| A090 | app/install-guide.tsx:35 | Android | selection | Validar patrón en contexto |
| A091 | app/install-guide.tsx:45 | {copied?'Dirección copiada':'Copiar dirección'} | secondary | Validar variantes dinámicas |
| A092 | app/install-guide.tsx:46 | Atrás | navigation | Validar patrón en contexto |
| A093 | app/install-guide.tsx:46 | Siguiente | primary | Validar patrón en contexto |
| A094 | app/install-guide.tsx:48 | No encuentro la opción | disclosure | Validar patrón en contexto |
| A095 | app/install-guide.tsx:48 | Ver la ayuda de {phone==='iphone'?'Apple':'Google'} | navigation | Validar variantes dinámicas |
| A096 | app/install-guide.tsx:53 | Cerrar la guía | navigation | Validar patrón en contexto |
| A097 | app/install-guide.tsx:56 | Volver a Alianza | navigation | Validar patrón en contexto |
| A098 | app/journal.tsx:103 | Abrir mi espacio | navigation | Validar patrón en contexto |
| A099 | app/journal.tsx:104 | Volver a intentar | navigation | Validar patrón en contexto |
| A100 | app/journal.tsx:104 | Entrar con otra cuenta | secondary | Validar patrón en contexto |
| A101 | app/journal.tsx:119 | "Alianza · Ir al inicio" | secondary | Validar patrón en contexto |
| A102 | app/journal.tsx:119 | Ayuda | secondary | Validar patrón en contexto |
| A103 | app/journal.tsx:120 | Reintentar | secondary | Validar patrón en contexto |
| A104 | app/journal.tsx:124 | "Día anterior" | navigation | Validar patrón en contexto |
| A105 | app/journal.tsx:124 | "Día siguiente" | navigation | Validar patrón en contexto |
| A106 | app/journal.tsx:124 | Hoy | navigation | Validar patrón en contexto |
| A107 | app/journal.tsx:125 | Mi espacio | navigation | Validar patrón en contexto |
| A108 | app/journal.tsx:125 | Rezar | secondary | Validar patrón en contexto |
| A109 | app/journal.tsx:125 | Mi camino | secondary | Validar patrón en contexto |
| A110 | app/journal.tsx:126 | {title} | selection | Validar variantes dinámicas |
| A111 | app/journal.tsx:128 | Cómo se registra mi avance | disclosure | Validar patrón en contexto |
| A112 | app/journal.tsx:132 | "Editar mi propósito particular" | secondary | Validar patrón en contexto |
| A113 | app/journal.tsx:136 | (contenido delegado) | selection | Validar variantes dinámicas |
| A114 | app/journal.tsx:136 | Abrir ayuda de oración | navigation | Validar patrón en contexto |
| A115 | app/journal.tsx:136 | {registeredCount(checks[h.key])?'Registrar otra ocasión':'Registrar una ocasión'} | secondary | Validar variantes dinámicas |
| A116 | app/journal.tsx:136 | Deshacer una ocasión | reversible | Validar patrón en contexto |
| A117 | app/journal.tsx:136 | Mi anotación de apoyo | disclosure | Validar patrón en contexto |
| A118 | app/journal.tsx:136 | {'Editar: '+h.data.title} | secondary | Validar variantes dinámicas |
| A119 | app/journal.tsx:136 | Editar compromiso | secondary | Validar patrón en contexto |
| A120 | app/journal.tsx:136 | {hasHabitHistory(state.own,h.key)?'Dejar de seguir':'Eliminar compromiso'} | sensitive | Validar variantes dinámicas |
| A121 | app/journal.tsx:136 | Me costó | secondary | Validar patrón en contexto |
| A122 | app/journal.tsx:136 | Hoy no aplicaba | navigation | Validar patrón en contexto |
| A123 | app/journal.tsx:136 | Quitar registro | reversible | Validar patrón en contexto |
| A124 | app/journal.tsx:136 | Anotar o revisar este compromiso | secondary | Validar patrón en contexto |
| A125 | app/journal.tsx:136 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A126 | app/journal.tsx:137 | Añadir compromiso | secondary | Validar patrón en contexto |
| A127 | app/journal.tsx:139 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A128 | app/journal.tsx:146 | Las 4 Rs | selection | Validar patrón en contexto |
| A129 | app/journal.tsx:146 | Rosario | selection | Validar patrón en contexto |
| A130 | app/journal.tsx:146 | Nuestro ideal | selection | Validar patrón en contexto |
| A131 | app/journal.tsx:146 | Nuestro recorrido | selection | Validar patrón en contexto |
| A132 | app/journal.tsx:146 | {v?.done?'Ver nuestro registro':v?.planDate?'Abrir nuestro encuentro':'Preparar este momento'} | secondary | Validar variantes dinámicas |
| A133 | app/journal.tsx:146 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A134 | app/journal.tsx:147 | Reintentar | secondary | Validar patrón en contexto |
| A135 | app/journal.tsx:148 | Misa | secondary | Validar patrón en contexto |
| A136 | app/journal.tsx:148 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A137 | app/journal.tsx:149 | Volver a Oración | navigation | Validar patrón en contexto |
| A138 | app/journal.tsx:151 | Volver a Oración | navigation | Validar patrón en contexto |
| A139 | app/journal.tsx:153 | Mi espacio | navigation | Validar patrón en contexto |
| A140 | app/journal.tsx:154 | Reintentar | secondary | Validar patrón en contexto |
| A141 | app/journal.tsx:155 | {label} | selection | Validar variantes dinámicas |
| A142 | app/journal.tsx:155 | Editar | secondary | Validar patrón en contexto |
| A143 | app/journal.tsx:155 | Mi camino y mi ideal | secondary | Validar patrón en contexto |
| A144 | app/journal.tsx:155 | Agregar o editar mis oraciones | secondary | Validar patrón en contexto |
| A145 | app/journal.tsx:155 | Elegir mi símbolo | secondary | Validar patrón en contexto |
| A146 | app/journal.tsx:159 | Editar y retomar | secondary | Validar patrón en contexto |
| A147 | app/journal.tsx:160 | Cambiar mi contraseña | secondary | Validar patrón en contexto |
| A148 | app/journal.tsx:161 | Añadir al calendario | secondary | Validar patrón en contexto |
| A149 | app/journal.tsx:163 | Descargar mis registros | secondary | Validar patrón en contexto |
| A150 | app/journal.tsx:168 | Actualizar registros | secondary | Validar patrón en contexto |
| A151 | app/journal.tsx:168 | Cerrar sesión | sensitive | Validar patrón en contexto |
| A152 | app/journal.tsx:171 | {removing?'Guardando…':removeHabit&&hasHabitHistory(state.own,removeHabit.key)?'Sí, dejar de seguir':'Sí, eliminar'} | sensitive | Validar variantes dinámicas |
| A153 | app/journal.tsx:181 | Sobre esta revisión | disclosure | Validar patrón en contexto |
| A154 | app/journal.tsx:183 | Ideas y preguntas para este encuentro | disclosure | Validar patrón en contexto |
| A155 | app/journal.tsx:183 | Crear recordatorio recurrente | secondary | Validar patrón en contexto |
| A156 | app/journal.tsx:184 | Actualizar versión disponible | secondary | Validar patrón en contexto |
| A157 | app/journal.tsx:184 | {hasHabitHistory(state.own,editor.key)?'Dejar de seguir este compromiso':'Eliminar compromiso'} | sensitive | Validar variantes dinámicas |
| A158 | app/journal.tsx:184 | Atrás | navigation | Validar patrón en contexto |
| A159 | app/journal.tsx:184 | Cerrar | secondary | Validar patrón en contexto |
| A160 | app/journal.tsx:184 | {busy?<><LoaderCircle size={18} className="spin"/>Guardando…</>:<><Check size={18}/>{editor.kind==='habit'&&editor.version===0&&habitStep===0?'Continuar':'Guardar'}</>} | primary | Validar variantes dinámicas |
| A161 | app/logo-viewer.tsx:5 | "Ver logo de Alianza en grande" | secondary | Validar patrón en contexto |
| A162 | app/logo-viewer.tsx:5 | (contenido delegado) | navigation | Validar variantes dinámicas |
| A163 | app/logo-viewer.tsx:5 | "Cerrar logo" | secondary | Validar patrón en contexto |
| A164 | app/mass.tsx:39 | {r.title} | disclosure | Validar variantes dinámicas |
| A165 | app/mass.tsx:39 | Fuente del texto | navigation | Validar patrón en contexto |
| A166 | app/mass.tsx:41 | Volver a Oración | navigation | Validar patrón en contexto |
| A167 | app/mass.tsx:43 | Hoy | navigation | Validar patrón en contexto |
| A168 | app/mass.tsx:44 | "Día anterior" | navigation | Validar patrón en contexto |
| A169 | app/mass.tsx:44 | "Día siguiente" | navigation | Validar patrón en contexto |
| A170 | app/mass.tsx:47 | {c.label} | selection | Validar variantes dinámicas |
| A171 | app/mass.tsx:52 | {s==='guide'?'Guía':'Lecturas'} | selection | Validar variantes dinámicas |
| A172 | app/mass.tsx:52 | "Reducir letra" | secondary | Validar patrón en contexto |
| A173 | app/mass.tsx:52 | "Ampliar letra" | secondary | Validar patrón en contexto |
| A174 | app/mass.tsx:53 | (contenido delegado) | disclosure | Validar variantes dinámicas |
| A175 | app/mass.tsx:54 | {label} | selection | Validar variantes dinámicas |
| A176 | app/mass.tsx:55 | {washing?'Lavatorio incluido':'Sin lavatorio'} | selection | Validar variantes dinámicas |
| A177 | app/mass.tsx:56 | {v?'Con bautismos':'Sin bautismos'} | selection | Validar variantes dinámicas |
| A178 | app/mass.tsx:58 | {m} | disclosure | Validar variantes dinámicas |
| A179 | app/mass.tsx:62 | Celebraciones especiales | disclosure | Validar patrón en contexto |
| A180 | app/mass.tsx:62 | {s.title} | secondary | Validar variantes dinámicas |
| A181 | app/mass.tsx:63 | Fuentes y estado de los textos | disclosure | Validar patrón en contexto |
| A182 | app/mass.tsx:63 | Instrucción General del Misal Romano | navigation | Validar patrón en contexto |
| A183 | app/mass.tsx:63 | Orientación sobre el Triduo | navigation | Validar patrón en contexto |
| A184 | app/month-review.tsx:15 | {current?.text?'Editar mi propósito':'Anotar mi propósito'} | primary | Validar variantes dinámicas |
| A185 | app/month-review.tsx:15 | Retomar el propósito anterior | secondary | Validar patrón en contexto |
| A186 | app/month-review.tsx:18 | Revisar {monthLabel(monthBefore(month))} | secondary | Validar variantes dinámicas |
| A187 | app/movement-costa-rica.tsx:6 | {children} | navigation | Validar variantes dinámicas |
| A188 | app/movement-costa-rica.tsx:19 | Volver a mi espacio | navigation | Validar patrón en contexto |
| A189 | app/my-path.tsx:51 | Cambiar mi punto de partida | secondary | Validar patrón en contexto |
| A190 | app/my-path.tsx:62 | {label} | selection | Validar variantes dinámicas |
| A191 | app/my-path.tsx:77 | Escribir o revisar mi ideal | primary | Validar patrón en contexto |
| A192 | app/my-path.tsx:107 | Guardar y continuar otro día | primary | Validar patrón en contexto |
| A193 | app/pairing-requests.tsx:18 | Continuar | primary | Validar patrón en contexto |
| A194 | app/pairing-requests.tsx:19 | Enviar solicitud | primary | Validar patrón en contexto |
| A195 | app/pairing-requests.tsx:19 | Probar otro correo | secondary | Validar patrón en contexto |
| A196 | app/pairing-requests.tsx:30 | Compartir enlace | secondary | Validar patrón en contexto |
| A197 | app/pairing-requests.tsx:30 | Copiar enlace | secondary | Validar patrón en contexto |
| A198 | app/pairing-requests.tsx:32 | Sí, cancelar solicitud | sensitive | Validar patrón en contexto |
| A199 | app/pairing-requests.tsx:32 | Conservar solicitud | reversible | Validar patrón en contexto |
| A200 | app/pairing-requests.tsx:32 | Cancelar solicitud | sensitive | Validar patrón en contexto |
| A201 | app/pairing-requests.tsx:39 | Cómo me reconoce mi pareja | secondary | Validar patrón en contexto |
| A202 | app/pairing-requests.tsx:39 | Guardar preferencia | primary | Validar patrón en contexto |
| A203 | app/pairing-requests.tsx:47 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A204 | app/pairing-requests.tsx:49 | Ir a nuestro espacio | primary | Validar patrón en contexto |
| A205 | app/pairing-requests.tsx:49 | Aceptar vinculación | primary | Validar patrón en contexto |
| A206 | app/pairing-requests.tsx:49 | Rechazar solicitud | sensitive | Validar patrón en contexto |
| A207 | app/pairing-requests.tsx:49 | Ver otras solicitudes | secondary | Validar patrón en contexto |
| A208 | app/pairing-requests.tsx:49 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A209 | app/pairing.tsx:15 | Administrar desvinculación | sensitive | Validar patrón en contexto |
| A210 | app/pairing.tsx:15 | Confirmar desvinculación | sensitive | Validar patrón en contexto |
| A211 | app/pairing.tsx:15 | Conservar vinculación | reversible | Validar patrón en contexto |
| A212 | app/pairing.tsx:16 | Continuar individualmente | primary | Validar patrón en contexto |
| A213 | app/pairing.tsx:16 | Quiero usarla en pareja | secondary | Validar patrón en contexto |
| A214 | app/pairing.tsx:16 | Tengo un código de vinculación | secondary | Validar patrón en contexto |
| A215 | app/pairing.tsx:18 | Revisar invitación | secondary | Validar patrón en contexto |
| A216 | app/pairing.tsx:18 | Aceptar vinculación | primary | Validar patrón en contexto |
| A217 | app/pairing.tsx:18 | Rechazar invitación | sensitive | Validar patrón en contexto |
| A218 | app/pairing.tsx:19 | Volver a mis opciones | reversible | Validar patrón en contexto |
| A219 | app/pairing.tsx:28 | Nuestro ideal matrimonial · opcional | disclosure | Validar patrón en contexto |
| A220 | app/pairing.tsx:29 | Guardar borrador matrimonial | primary | Validar patrón en contexto |
| A221 | app/pairing.tsx:29 | Cancelar edición | reversible | Validar patrón en contexto |
| A222 | app/pairing.tsx:29 | {ideal.text?'Editar nuestra frase':'Anotar una frase cuando lo deseemos'} | secondary | Validar variantes dinámicas |
| A223 | app/pairing.tsx:29 | {ideal.confirmedByMe?'Ya confirmé esta frase':'Confirmo que esta frase nos representa'} | secondary | Validar variantes dinámicas |
| A224 | app/pairing.tsx:34 | Mi historial matrimonial anterior | disclosure | Validar patrón en contexto |
| A225 | app/pairing.tsx:34 | Consultar archivo del {new Date(a.archivedAt).toLocaleDateString('es-CR',{timeZone:'America/Costa_Rica'})} | navigation | Validar variantes dinámicas |
| A226 | app/pairing.tsx:34 | {R_TYPES.find(t=>t.id===r.data.type)?.title??'Encuentro'} · {r.data.periodDate} | disclosure | Validar variantes dinámicas |
| A227 | app/personal-rosary.tsx:82 | {isMarked(h.key)?'Ya está marcado':candidates.length===1?'Marcar mi compromiso':h.data.title} | secondary | Validar variantes dinámicas |
| A228 | app/personal-rosary.tsx:82 | {linked?'Añadido a hoy':'Añadir solo por hoy'} | navigation | Validar variantes dinámicas |
| A229 | app/personal-rosary.tsx:82 | Rezar las letanías | secondary | Validar patrón en contexto |
| A230 | app/personal-rosary.tsx:82 | Terminar | primary | Validar patrón en contexto |
| A231 | app/personal-rosary.tsx:85 | Al inicio | selection | Validar patrón en contexto |
| A232 | app/personal-rosary.tsx:85 | Después de los cinco misterios | selection | Validar patrón en contexto |
| A233 | app/personal-rosary.tsx:85 | Habituales | selection | Validar patrón en contexto |
| A234 | app/personal-rosary.tsx:85 | Hija, Madre y Esposa | selection | Validar patrón en contexto |
| A235 | app/personal-rosary.tsx:85 | {step?'Continuar rezando':'Empezar a rezar'} | primary | Validar variantes dinámicas |
| A236 | app/personal-rosary.tsx:85 | Descartar este rosario | sensitive | Validar patrón en contexto |
| A237 | app/personal-rosary.tsx:88 | {finished&&litany===null?'Cerrar':'Pausar'} | secondary | Validar variantes dinámicas |
| A238 | app/personal-rosary.tsx:90 | Seguir rezando | primary | Validar patrón en contexto |
| A239 | app/personal-rosary.tsx:90 | {confirm==='discard'?'Sí, descartar':'Guardar y salir'} | sensitive | Validar variantes dinámicas |
| A240 | app/personal-rosary.tsx:91 | "Reducir letra" | secondary | Validar patrón en contexto |
| A241 | app/personal-rosary.tsx:91 | "Aumentar letra" | secondary | Validar patrón en contexto |
| A242 | app/personal-rosary.tsx:91 | Volver al rezo | navigation | Validar patrón en contexto |
| A243 | app/personal-rosary.tsx:91 | Descartar este rosario | sensitive | Validar patrón en contexto |
| A244 | app/personal-rosary.tsx:91 | Oraciones · Holy Rosary Parish | navigation | Validar patrón en contexto |
| A245 | app/personal-rosary.tsx:91 | Acto de contrición · Santa Sede | navigation | Validar patrón en contexto |
| A246 | app/personal-rosary.tsx:91 | Letanías · Santa Sede | navigation | Validar patrón en contexto |
| A247 | app/personal-rosary.tsx:93 | {expanded?'Ocultar oración':'Ver oración'} | disclosure | Validar variantes dinámicas |
| A248 | app/personal-rosary.tsx:96 | {litany!==null?(litany===LITANY.length-1?'Terminar letanías':'Avanzar'):step===ROSARY_STEPS.length-1?'Terminé el rosario':'Avanzar'} | primary | Validar variantes dinámicas |
| A249 | app/personal-rosary.tsx:96 | Atrás | navigation | Validar patrón en contexto |
| A250 | app/personal-rosary.tsx:96 | "Opciones del rezo" | secondary | Validar patrón en contexto |
| A251 | app/pilot-support.tsx:11 | {busy?'Enviando…':'Enviar solicitud'} | primary | Validar variantes dinámicas |
| A252 | app/pilot-support.tsx:11 | Mis solicitudes ( {requests.length} ) | disclosure | Validar variantes dinámicas |
| A253 | app/reflection-summary.tsx:8 | {expanded?'Ver menos':'Ver todas las reflexiones'} | secondary | Validar variantes dinámicas |
| A254 | app/reports.tsx:22 | Ver compromiso por compromiso | disclosure | Validar patrón en contexto |
| A255 | app/reports.tsx:22 | Ver mis reflexiones | disclosure | Validar patrón en contexto |
| A256 | app/reports.tsx:22 | Escribir mi revisión | primary | Validar patrón en contexto |
| A257 | app/reports.tsx:22 | Preparar reporte para mi asesor | secondary | Validar patrón en contexto |
| A258 | app/reports.tsx:23 | {downloading?'Preparando PDF…':'Descargar PDF'} | primary | Validar variantes dinámicas |
| A259 | app/rhythm-progress.tsx:5 | (contenido delegado) | selection | Validar variantes dinámicas |
| A260 | app/spaces.tsx:8 | (contenido delegado) | selection | Validar variantes dinámicas |
| A261 | app/spaces.tsx:8 | Mis espacios | navigation | Validar patrón en contexto |
| A262 | app/spaces.tsx:9 | {draft.enabled.includes(id)&&<Check size={19}/>} | selection | Validar variantes dinámicas |
| A263 | app/spaces.tsx:9 | {label} | selection | Validar variantes dinámicas |
| A264 | app/spaces.tsx:9 | Guardar mis espacios | navigation | Validar patrón en contexto |
| A265 | app/start-guide.tsx:12 | Crear mi primer compromiso | primary | Validar patrón en contexto |
| A266 | app/start-guide.tsx:13 | Necesito una idea para empezar | disclosure | Validar patrón en contexto |
| A267 | app/start-guide.tsx:13 | Consultar la orientación del Movimiento de Schoenstatt Brasil (portugués) | navigation | Validar patrón en contexto |
| A268 | app/start-guide.tsx:13 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A269 | app/start-guide.tsx:14 | Prefiero empezar con las 4 Rs | secondary | Validar patrón en contexto |
| A270 | app/start-guide.tsx:24 | Registrar un compromiso | secondary | Validar patrón en contexto |
| A271 | app/start-guide.tsx:24 | Rezar o preparar mi confesión | secondary | Validar patrón en contexto |
| A272 | app/start-guide.tsx:24 | Trabajar mi ideal personal | secondary | Validar patrón en contexto |
| A273 | app/start-guide.tsx:24 | Vivir las 4 Rs en pareja | secondary | Validar patrón en contexto |
| A274 | app/start-guide.tsx:24 | Consultar mis registros | navigation | Validar patrón en contexto |
| A275 | app/start-guide.tsx:24 | Privacidad y preferencias | secondary | Validar patrón en contexto |
| A276 | app/start-guide.tsx:24 | Instalar Alianza en mi teléfono | navigation | Validar patrón en contexto |
| A277 | app/start-guide.tsx:25 | Problemas para volver a entrar | disclosure | Validar patrón en contexto |
| A278 | app/start-guide.tsx:26 | Volver | navigation | Validar patrón en contexto |
| A279 | app/symbol-picker.tsx:18 | Sin símbolo | selection | Validar patrón en contexto |
| A280 | app/symbol-picker.tsx:18 | (contenido delegado) | selection | Validar variantes dinámicas |
| A281 | app/symbol-picker.tsx:19 | No encuentro mi símbolo | disclosure | Validar patrón en contexto |
| A282 | app/symbol-picker.tsx:20 | Solicitar un símbolo | disclosure | Validar patrón en contexto |
| A283 | app/symbol-picker.tsx:21 | Quitar imagen | secondary | Validar patrón en contexto |
| A284 | components/ui/alert-dialog.tsx:155 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A285 | components/ui/alert-dialog.tsx:173 | (contenido delegado) | secondary | Validar variantes dinámicas |
| A286 | components/ui/dialog.tsx:117 | Cerrar | secondary | Validar patrón en contexto |
| A287 | github/admin.tsx:60 | ← Volver a mi espacio | navigation | Validar patrón en contexto |
| A288 | github/admin.tsx:64 | Uso del piloto | selection | Validar patrón en contexto |
| A289 | github/admin.tsx:64 | Personas e invitaciones | selection | Validar patrón en contexto |
| A290 | github/admin.tsx:64 | Solicitudes y mejoras | selection | Validar patrón en contexto |
| A291 | github/admin.tsx:66 | Detalle de uso de los últimos 30 días | disclosure | Validar patrón en contexto |
| A292 | github/admin.tsx:66 | Medición general voluntaria | disclosure | Validar patrón en contexto |
| A293 | github/admin.tsx:75 | {busy ? "Cargando…" : "Actualizar resumen"} | primary | Validar variantes dinámicas |
| A294 | github/admin.tsx:137 | Cómo interpretar estos indicadores | disclosure | Validar patrón en contexto |
| A295 | github/admin.tsx:226 | Uso y mejora | secondary | Validar patrón en contexto |
| A296 | github/admin.tsx:231 | Ayudar a mejorar Alianza | disclosure | Validar patrón en contexto |
| A297 | github/admin.tsx:267 | {v} | secondary | Validar variantes dinámicas |
| A298 | github/app-update.tsx:31 | Actualizar Alianza | secondary | Validar patrón en contexto |
| A299 | github/invitations.tsx:45 | Actualizar invitaciones | secondary | Validar patrón en contexto |
| A300 | github/invitations.tsx:47 | Copiar enlace | secondary | Validar patrón en contexto |
| A301 | github/invitations.tsx:47 | Ocultar enlace | secondary | Validar patrón en contexto |
| A302 | github/invitations.tsx:48 | Reintentar la misma solicitud | secondary | Validar patrón en contexto |
| A303 | github/invitations.tsx:54 | Crear invitación | primary | Validar patrón en contexto |
| A304 | github/invitations.tsx:59 | {proposal.action==='cancel'?'Sí, cancelar invitación':'Confirmar y crear enlace'} | sensitive | Validar variantes dinámicas |
| A305 | github/invitations.tsx:60 | Volver sin cambios | navigation | Validar patrón en contexto |
| A306 | github/invitations.tsx:69 | {p.state==='pending'?'Generar enlace nuevo':'Renovar invitación'} | secondary | Validar variantes dinámicas |
| A307 | github/invitations.tsx:70 | Cancelar invitación | sensitive | Validar patrón en contexto |
| A308 | github/invitations.tsx:102 | {busy?'Preparando tu espacio…':'Entrar a mi espacio individual'} | navigation | Validar variantes dinámicas |
| A309 | github/invitations.tsx:104 | Cerrar sesión | sensitive | Validar patrón en contexto |
| A310 | github/main.tsx:75 | Volver a entrar | navigation | Validar patrón en contexto |
| A311 | github/main.tsx:78 | {visible?'Ocultar contraseña':'Mostrar contraseña'} | secondary | Validar variantes dinámicas |
| A312 | github/main.tsx:80 | {busy?<><LoaderCircle className="spin" size={18}/>Un momento…</>:mode==='login'?'Entrar':mode==='recover'?'Recibir enlace':'Guardar y entrar'} | primary | Validar variantes dinámicas |
| A313 | github/main.tsx:81 | ¿Es mi primera vez? | disclosure | Validar patrón en contexto |
| A314 | github/main.tsx:81 | {mode==='login'?'Olvidé mi contraseña':'Volver'} | navigation | Validar variantes dinámicas |
| A315 | github/main.tsx:81 | Instalar Alianza en mi teléfono | navigation | Validar patrón en contexto |
| A316 | github/main.tsx:87 | {busy?'Un momento…':'Continuar y elegir contraseña'} | primary | Validar variantes dinámicas |
| A317 | github/main.tsx:87 | Ya tengo contraseña | navigation | Validar patrón en contexto |
| A318 | github/main.tsx:98 | Volver a intentar | navigation | Validar patrón en contexto |
| A319 | github/maintenance.tsx:23 | Actualizar Alianza | primary | Validar patrón en contexto |
| A320 | github/pilot-pulse.tsx:13 | Actualizar tendencias | secondary | Validar patrón en contexto |
| A321 | github/pilot-pulse.tsx:13 | Ver cifras y cobertura | disclosure | Validar patrón en contexto |
| A322 | github/pilot-pulse.tsx:13 | Cómo cuidamos la privacidad | disclosure | Validar patrón en contexto |
| A323 | github/pilot.tsx:9 | {busy?'Cargando piloto…':'Actualizar piloto'} | secondary | Validar variantes dinámicas |
| A324 | github/support-admin.tsx:9 | Actualizar solicitudes | secondary | Validar patrón en contexto |
| A325 | github/support-admin.tsx:9 | {v} | secondary | Validar variantes dinámicas |
