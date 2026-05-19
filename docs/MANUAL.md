# Memorix — Manual de Usuario

**Versión 1.0.0** · Software de gestión de cementerios

---

## Índice

1. [Introducción](#1-introducción)
2. [Instalación](#2-instalación)
3. [Activación de la licencia](#3-activación-de-la-licencia)
4. [Configuración inicial](#4-configuración-inicial)
5. [Acceso al sistema](#5-acceso-al-sistema)
6. [Dashboard](#6-dashboard)
7. [Parcelas](#7-parcelas)
8. [Difuntos](#8-difuntos)
9. [Búsqueda](#9-búsqueda)
10. [Reportes PDF](#10-reportes-pdf)
11. [Configuración](#11-configuración)
12. [Etiquetas y categorías](#12-etiquetas-y-categorías)
13. [Licencia](#13-licencia)
14. [Preguntas frecuentes](#14-preguntas-frecuentes)
15. [Soporte](#15-soporte)

---

## 1. Introducción

Memorix es una aplicación de escritorio para la gestión integral de cementerios. Permite administrar parcelas, registrar difuntos, generar reportes en PDF y consultar estadísticas en tiempo real, todo desde un entorno seguro y completamente offline.

### ¿Qué puedes hacer con Memorix?

- Gestionar el inventario completo de parcelas con sus estados y ubicaciones
- Registrar y consultar expedientes de difuntos
- Asignar difuntos a parcelas de forma rápida
- Buscar cualquier registro en segundos
- Generar documentos PDF listos para imprimir
- Consultar estadísticas de ocupación en tiempo real
- Personalizar el sistema con los nombres de zonas y tipos que usa tu organización

### Funcionamiento offline

Memorix almacena todos los datos en tu propio equipo. No necesitas conexión a internet para trabajar. La conexión solo es necesaria para activar la licencia y recibir actualizaciones.

---

## 2. Instalación

### Requisitos del sistema

| | Mínimo |
|---|---|
| Sistema operativo | Windows 10 (64 bits) o superior |
| Memoria RAM | 256 MB |
| Espacio en disco | 150 MB libres |
| Conexión a internet | Solo para activación y actualizaciones |

### Pasos de instalación

1. Descarga el instalador `Memorix-Setup-1.0.0.exe` desde el enlace que recibiste al comprar.
2. Haz doble clic en el archivo descargado.
3. Si Windows muestra una advertencia de seguridad, haz clic en **Más información** y luego en **Ejecutar de todas formas**.
4. Sigue los pasos del asistente de instalación.
5. Al finalizar, Memorix se abrirá automáticamente.

> **Nota:** No es necesario instalar nada más. Memorix incluye todo lo que necesita para funcionar.

---

## 3. Activación de la licencia

Al abrir Memorix por primera vez, verás la pantalla de activación de licencia.

### ¿Cómo obtengo mi clave de licencia?

Si aún no tienes una licencia, puedes adquirirla en:

**[memorix.lemonsqueezy.com/checkout](https://memorix.lemonsqueezy.com/checkout)**

Recibirás tu clave de licencia por correo electrónico inmediatamente después del pago.

### Activar la licencia

1. Copia la clave de licencia que recibiste por email.
2. Pégala en el campo **Clave de licencia** de la pantalla de activación.
3. Haz clic en **Activar licencia**.
4. Si la clave es válida, la aplicación se abrirá directamente.

> **Importante:** La licencia queda vinculada al equipo donde se activa. Si necesitas cambiar de equipo, contacta con soporte.

---

## 4. Configuración inicial

La primera vez que entras en Memorix, un asistente de configuración te guiará en tres pasos.

### Paso 1 — Preferencias del sistema

- **Idioma:** Selecciona entre Inglés o Español. Todos los textos de la aplicación cambiarán al idioma elegido.
- **Tema visual:** Elige entre modo Claro y modo Oscuro según tu preferencia.
- **Registros por página:** Número de filas que se muestran en las tablas (25, 50 o 100). El valor recomendado es 50.

Haz clic en **Siguiente** cuando estés listo.

### Paso 2 — Datos de tu organización

Introduce los datos de tu cementerio u organización. Esta información aparecerá en los reportes PDF que generes.

- **Nombre** *(obligatorio)*: Nombre del cementerio o empresa.
- **Dirección** *(opcional)*: Dirección completa.
- **Teléfono** *(opcional)*: Número de contacto.

Haz clic en **Siguiente** para continuar.

### Paso 3 — Todo listo

Memorix muestra un resumen de las funcionalidades principales. Haz clic en **Empezar** para comenzar a usar la aplicación.

> Puedes modificar cualquiera de estos ajustes en cualquier momento desde la sección **Configuración**.

---

## 5. Acceso al sistema

Cada vez que abras Memorix, se te pedirá una contraseña antes de acceder.

- **Contraseña por defecto:** `1234`
- Se recomienda cambiarla en el primer uso desde **Configuración → Seguridad**.

### Cambiar la contraseña

1. Ve a **Configuración** en el menú lateral.
2. Localiza la sección **Seguridad**.
3. Introduce la contraseña actual y la nueva contraseña dos veces.
4. Haz clic en **Guardar contraseña**.

---

## 6. Dashboard

El dashboard es la pantalla principal de Memorix. Muestra un resumen del estado del cementerio en tiempo real.

### Tarjetas de estadísticas

| Tarjeta | Descripción |
|---|---|
| **Total parcelas** | Número total de parcelas registradas |
| **Ocupadas** | Parcelas con un difunto asignado actualmente |
| **Disponibles** | Parcelas libres y listas para asignar |
| **Difuntos** | Total de registros de difuntos en el sistema |

Haz clic en cualquier tarjeta para ir directamente a la sección correspondiente.

### Actividad reciente

En la parte inferior del dashboard verás las últimas acciones realizadas en el sistema: creaciones, ediciones y eliminaciones, con la fecha y hora de cada operación.

Si acabas de instalar la aplicación y no tienes datos todavía, verás un mensaje de bienvenida con accesos directos para empezar.

---

## 7. Parcelas

La sección de Parcelas te permite gestionar todos los espacios disponibles en el cementerio.

### Ver el listado de parcelas

Haz clic en **Parcelas** en el menú lateral. Verás una tabla con todas las parcelas registradas, ordenables por cualquier columna.

Cada parcela muestra:
- **Código** — Identificador único
- **Tipo** — Parcela, Nicho, Mausoleo, etc.
- **Zona** — Agrupación geográfica dentro del cementerio
- **Ubicación** — Posición dentro de la zona
- **Estado** — Disponible, Ocupada, Reservada, Mantenimiento
- **Difunto asignado** — Si la parcela está ocupada, el nombre del difunto

### Añadir una parcela

1. Haz clic en el botón **+ Nueva parcela**.
2. Rellena el formulario:
   - **Código** *(obligatorio)*: Identificador único. Ej: `A-001`, `N-012`.
   - **Tipo**: Selecciona el tipo de espacio.
   - **Zona y Ubicación**: Selecciona de las categorías configuradas.
   - **Estado inicial**: Normalmente "Disponible".
   - **Precio** *(opcional)*: Coste de la parcela.
   - **Observaciones** *(opcional)*: Notas adicionales.
3. Haz clic en **Guardar**.

### Editar una parcela

1. Haz clic en el icono de **editar** (lápiz) en la fila de la parcela.
2. Modifica los campos necesarios.
3. Haz clic en **Guardar**.

### Eliminar una parcela

1. Haz clic en el icono de **eliminar** (papelera) en la fila de la parcela.
2. Confirma la eliminación en el diálogo.

> **Nota:** No es posible eliminar una parcela que tenga un difunto asignado. Primero debes reasignar o eliminar el registro del difunto.

### Estados de las parcelas

| Estado | Significado |
|---|---|
| **Disponible** | La parcela está libre y puede asignarse |
| **Ocupada** | Tiene un difunto asignado actualmente |
| **Reservada** | Está reservada pero aún no ocupada |
| **Mantenimiento** | Temporalmente fuera de servicio |

El estado cambia automáticamente a **Ocupada** cuando asignas un difunto a la parcela, y vuelve a **Disponible** cuando se elimina o reasigna ese difunto.

---

## 8. Difuntos

La sección de Difuntos gestiona todos los expedientes de personas fallecidas registradas en el sistema.

### Ver el listado de difuntos

Haz clic en **Difuntos** en el menú lateral. La tabla muestra todos los registros con sus datos principales.

### Añadir un difunto

1. Haz clic en **+ Nuevo difunto**.
2. Rellena el formulario:

**Datos personales**
- **Nombre y apellidos** *(obligatorio)*
- **DNI / Documento de identidad** *(opcional)*
- **Fecha de nacimiento** *(opcional)*
- **Lugar de nacimiento** *(opcional)*

**Datos del fallecimiento**
- **Fecha de fallecimiento** *(opcional)*
- **Causa del fallecimiento** *(opcional)*

**Asignación**
- **Parcela**: Selecciona una parcela disponible del desplegable. La parcela pasará automáticamente a estado Ocupada.

**Notas adicionales** *(opcional)*

3. Haz clic en **Guardar**.

### Editar un difunto

1. Haz clic en el icono de **editar** en la fila del difunto.
2. Realiza los cambios necesarios.
3. Haz clic en **Guardar**.

### Eliminar un difunto

1. Haz clic en el icono de **eliminar** en la fila del difunto.
2. Confirma en el diálogo.

> Cuando eliminas un difunto que tenía una parcela asignada, esa parcela vuelve automáticamente al estado **Disponible**.

---

## 9. Búsqueda

La búsqueda te permite encontrar cualquier registro rápidamente entre todos los datos del sistema.

### Cómo buscar

1. Haz clic en **Búsqueda** en el menú lateral.
2. Escribe en el campo de búsqueda cualquier término: nombre, apellido, código de parcela, DNI, etc.
3. Los resultados aparecen automáticamente mientras escribes.

### Filtros disponibles

Puedes combinar varios criterios a la vez:
- **Nombre / Apellidos**
- **Fecha de fallecimiento** (desde / hasta)
- **Parcela asignada**

### Acciones desde los resultados

Desde la tabla de resultados puedes editar o eliminar cualquier registro directamente, sin necesidad de ir a la sección correspondiente.

---

## 10. Reportes PDF

Memorix permite generar documentos PDF de cualquier listado para imprimir o archivar.

### Generar un reporte

1. Ve a la sección que quieras exportar: Parcelas, Difuntos o Búsqueda.
2. Aplica los filtros u ordenación que necesites.
3. Haz clic en el botón **Exportar PDF** o **Imprimir**.
4. Se abrirá una vista previa del documento.
5. Desde la vista previa puedes imprimir directamente o guardar como PDF.

### Contenido del reporte

Cada reporte incluye automáticamente:
- Nombre de tu organización (configurado en Ajustes)
- Fecha y hora de generación
- Tabla con todos los registros visibles
- Número total de registros

---

## 11. Configuración

Accede a la configuración desde el icono de engranaje en el menú lateral.

### Organización

Datos de tu empresa o cementerio que aparecen en los reportes PDF.

- **Nombre de la organización**
- **Dirección**
- **Teléfono**

Haz clic en **Guardar cambios** después de modificar cualquier dato.

### Apariencia

- **Tema visual**: Cambia entre modo Claro y modo Oscuro en cualquier momento.
- **Idioma**: Alterna entre Español e Inglés. El cambio es inmediato.
- **Registros por página**: Controla cuántas filas se muestran en las tablas.

### Seguridad

- **Cambiar contraseña**: Introduce la contraseña actual y la nueva dos veces.

### Sistema

Muestra información sobre la versión de la aplicación y el sistema operativo.

---

## 12. Etiquetas y categorías

Las etiquetas te permiten personalizar los valores disponibles para los campos **Tipo**, **Zona** y **Ubicación** de las parcelas, adaptándolos a la nomenclatura que usa tu organización.

### Gestionar etiquetas

1. Ve a **Configuración** y localiza la sección **Etiquetas y Categorías**.
2. Verás tres grupos: **Tipo de parcela**, **Zona** y **Ubicación**.

### Añadir un valor

1. Haz clic en **+ Añadir** dentro del grupo correspondiente.
2. Escribe el nuevo valor (ej: `Sector Norte`, `Cripta`, `Fila 3`).
3. Pulsa Enter o haz clic en confirmar.

### Eliminar un valor

Haz clic en la **X** junto al valor que quieras eliminar.

> **Atención:** No puedes eliminar un valor que esté siendo utilizado por una o más parcelas. Primero debes actualizar esas parcelas.

### Valores por defecto

Al instalar Memorix, se crean automáticamente los siguientes valores según el idioma elegido:

| Grupo | Valores en Español | Valores en Inglés |
|---|---|---|
| Tipo | Parcela, Nicho, Mausoleo | Plot, Niche, Mausoleum |
| Zona | Nuevo, Antiguo | New, Old |
| Ubicación | Izquierda, Centro, Derecha | Left, Center, Right |

---

## 13. Licencia

### Ver el estado de tu licencia

Ve a **Configuración** y localiza la tarjeta **Licencia**. Verás:
- Si la licencia está activa
- El correo con el que se registró la compra
- La fecha de expiración (si aplica)

### Renovar la licencia

Cuando tu licencia expire, recibirás un aviso al abrir la aplicación. Puedes renovarla desde la tienda:

**[memorix.lemonsqueezy.com/checkout](https://memorix.lemonsqueezy.com/checkout)**

### Desactivar la licencia

Si necesitas mover Memorix a otro equipo:

1. Ve a **Configuración → Licencia**.
2. Haz clic en **Desactivar licencia**.
3. Confirma la acción.
4. La aplicación se cerrará. Ahora puedes activar la misma clave en el nuevo equipo.

---

## 14. Preguntas frecuentes

**¿Dónde se guardan mis datos?**
Todos los datos se almacenan en tu equipo, en la carpeta de datos de usuario de Windows (`%APPDATA%\memorix\`). No se envía ningún dato a servidores externos.

**¿Puedo usar Memorix sin internet?**
Sí. Una vez activada la licencia, la aplicación funciona completamente sin conexión. Solo necesitas internet para activar la licencia y recibir actualizaciones.

**¿Cómo hago una copia de seguridad?**
Copia el archivo `cementerio.db` que encontrarás en `%APPDATA%\memorix\` a un lugar seguro (disco externo, nube, etc.). Para restaurar, basta con copiar ese archivo de vuelta a la misma carpeta.

**Olvidé mi contraseña. ¿Qué hago?**
Contacta con soporte en **bblottus@gmail.com** e indica el nombre de tu organización. Te proporcionaremos instrucciones para restablecer el acceso.

**¿Puedo instalar Memorix en más de un equipo?**
La licencia permite una sola instalación activa. Si necesitas cambiar de equipo, desactiva la licencia desde el equipo actual antes de activarla en el nuevo.

**¿Las actualizaciones son gratuitas?**
Sí. Todas las actualizaciones publicadas durante el período de tu licencia activa se instalan automáticamente al abrir la aplicación.

**¿Qué pasa con mis datos si dejo de renovar la licencia?**
Tus datos permanecen en tu equipo. Si en el futuro decides renovar, la aplicación los recupera exactamente como los dejaste.

---

## 15. Soporte

Si tienes alguna duda, problema técnico o necesitas ayuda con la configuración, contacta con nosotros:

📧 **bblottus@gmail.com**

Incluye en tu mensaje:
- Descripción del problema o pregunta
- Versión de Memorix (visible en Configuración → Sistema)
- Versión de Windows de tu equipo

Tiempo de respuesta habitual: **1–2 días laborables**.

---

<div align="center">

**Memorix v1.0.0** — Software profesional de gestión de cementerios

*Gracias por confiar en Memorix.*

</div>
