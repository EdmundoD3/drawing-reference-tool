# Herramienta de referencias para dibujo

Aplicación web estática (Svelte 5 + TypeScript + Vite) para calcar, medir y trasladar
proporciones desde una imagen de referencia hacia un objeto físico (lienzo, papel,
madera, etc.). Corre completamente en el navegador: ninguna imagen ni proyecto sale
de tu equipo.

## Funciones

- **Escala de referencia**: define qué mide el ancho o el alto de la imagen en cm/mm;
  todo lo demás se calcula a partir de ahí.
- **Reglas y grid**: regla superior/lateral con subdivisiones adaptadas al zoom, y una
  cuadrícula configurable (filas × columnas).
- **Zoom / pan / transformar**: acercar, desplazar, rotar 90°, voltear horizontal y
  vertical — sin alterar la escala lógica.
- **Mediciones**: clic en dos puntos para medir distancias reales.
- **Líneas y puntos de referencia**: horizontal, vertical, extremo a extremo,
  personalizada y puntos sueltos — todos nombrables y, los puntos, arrastrables.
- **Proporción áurea**: guías verticales/horizontales o la espiral áurea completa.
- **Punto de fuga**: colócalo, arrástralo, y añade líneas de convergencia que se
  actualizan solas.
- **Tamaño real en pantalla**: modo automático (96 dpi) o calibrado comparando una
  barra en pantalla contra una regla física.
- **Proyectos**: guarda/abre un `.json` autocontenido (incluye la imagen) y exporta
  una imagen PNG con todas las referencias activas "horneadas" encima.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo con recarga en caliente
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción localmente
npm run check    # svelte-check + verificación de tipos de TypeScript
```

## Arquitectura

```
src/
├── App.svelte                     # layout: sidebar + lienzo
├── app.css                        # tema y sistema de diseño compartido
├── lib/
│   ├── types.ts                   # tipos compartidos (RefObject, Measurement, etc.)
│   ├── state.svelte.ts            # estado reactivo central (runas $state) + acciones
│   ├── ui.svelte.ts               # estado de UI efímero (overlay de calibración)
│   ├── geometry.ts                # matemáticas puras: clipping, espiral áurea, etc.
│   ├── draw.ts                    # funciones de dibujo en Canvas (sin estado)
│   ├── project.ts                 # guardar/abrir proyecto y exportar PNG
│   └── components/
│       ├── StageCanvas.svelte     # lienzo, reglas, interacción de puntero
│       ├── ImagePanel.svelte
│       ├── ScalePanel.svelte
│       ├── TransformPanel.svelte
│       ├── ReferencesPanel.svelte
│       ├── GoldenRatioPanel.svelte
│       ├── MeasurementsPanel.svelte
│       ├── LinesPanel.svelte
│       ├── VanishingPointPanel.svelte
│       ├── RealSizePanel.svelte
│       └── ProjectPanel.svelte
```

El estado vive en un único objeto reactivo (`toolState`, en `state.svelte.ts`) usando
runas de Svelte 5. Cualquier componente puede leerlo o mutarlo directamente y la UI
se actualiza sola. Las acciones que dependen del tamaño del lienzo en pantalla
(ajustar zoom, tamaño real) están expuestas por `StageCanvas.svelte` mediante
`bind:this`, ya que es el único componente que conoce las dimensiones reales del
lienzo.
