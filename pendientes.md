Pendientes
1. Escala y Real Size

 Revisar que todas las rutas de zoom pasen por setZoom().
2. Tamaños de referencia
 Elegir tamaños comunes para botones rápidos.
 Cambiar 14.5 cm por un valor predeterminado más apropiado.
 Agregar botones de tamaños rápidos.
 Guardar en localStorage el último tamaño de referencia usado.
 Cargar ese valor al iniciar.
 Decidir si los tamaños rápidos deben depender de cm/mm.
 Revisar cómo presentar esto en móvil sin ocupar demasiado espacio.
3. Interfaz / UX
 Hacer secciones del menú retractiles/expandibles.
 Simplificar la sección de cargar imagen.
 Hacer que la sección de imagen pueda cerrarse después de cargar.
 Revisar qué secciones deberían permanecer abiertas por defecto.
 Mejorar la barra superior en móvil.
 Mantener como máximo unas 2 filas de controles en móvil.
 Mover acciones poco frecuentes a un menú secundario.
 Revisar tamaño/táctilidad de los botones móviles.
 Agregar acceso rápido a Real Size.
 Definir cómo debería comportarse visualmente el botón de Real Size activo/inactivo.
4. Proyectos guardados

 Usar automáticamente el nombre de la imagen para sugerir el nombre del proyecto.

Ejemplo:

dibujo.png
↓
dibujo.json
 Separar correctamente nombre de archivo y metadatos (1920×1080, etc.).
 Validar que el archivo cargado realmente sea un proyecto válido.
 Rechazar JSON que no tenga la estructura esperada.
 Decidir entre .json y una extensión propia como .gridjson.
 Si usamos extensión propia, hacer que el selector de archivos filtre apropiadamente.
 Revisar mensajes de error al intentar cargar un proyecto inválido.
5. Guardar/cargar proyecto
 Mejorar la experiencia de guardar/cargar desde la interfaz.
6. Detalles pendientes de la aplicación
 Revisar si queda alguna función antigua que ya no tenga utilidad después de la migración.
 Hacer una búsqueda final de código muerto/funciones sin uso.
 Revisar nombres de archivos, funciones y estados para consistencia.
 Revisar pequeños detalles de UX que aparezcan durante las pruebas reales.
7. Prueba final

Después de esos cambios:

 npm run check
 Probar escritorio.
 Probar móvil/touch.
 Probar carga de imagen.
 Probar escala.
 Probar Real Size.
 Probar transformaciones.
 Probar referencias.
 Probar mediciones.
 Probar VP/rays.
 Probar guardar/cargar.
 Probar archivos inválidos.
 Probar exportación.
 Hacer revisión final de Git y nuevo commit estable.






------------------
agregar botones rapidos para elegir tamaños ya que 14.5cm fue para un caso especial mio, probablemente dejar por default algun tamaño común

si es posible almacenar en localstorage el ultimo usado de tamaño de escala de referencia por ejemplo yo uso 14.5cm no me refiero a la de la regla, la idea es por que muchos artistas usan el mismo tipo de lienzo u hoja y estar escribe y escribe cada cambio debe ser molesto

hacer que tenga tanto el boton de mostrar tamaño real como agregar uno rapido en la barra sean de uso rapido o sea
no se mantengan activos si no que muestre el tamaño real, o bloquee el tamaño real (por ejemplo bloquearia lo de hacer zoom y solo usaria tamaño real)