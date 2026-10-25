# Feature: calisthenics-routine-app

Objetivo: web app generadora de rutinas semanales de calistenia militar para casa.
Branch: feature/calisthenics-routine-app | Entrega: work-unit commits convencionales en la rama | Runner: `npx vitest run` + `npm run build`.

## Specs

- S1 (usuario, verbatim): "Crea una app para generar una rutina de ejercicios, de calistenia militar para casa" — genera un plan semanal (calentamiento + bloque principal + vuelta a la calma por día) sin equipamiento de gimnasio (silla/mesa del hogar permitida).
- S2 (usuario, verbatim): "con imagenes y animaciones de cada ejercio" — resuelto en clarificación como "SVG animados propios + enlace/embed de video demostrativo". Cada ejercicio muestra figura stick-figure SVG animada con CSS y enlace "Ver demostración" (búsqueda de YouTube, URL determinística).
- S3 (usuario, verbatim): "Basada en la edad, peso, dias por semana, tiempo de rutina, tipo de cuerpo (delgado,grueso, obeso,etc), objetivo (bajar de peso, ganar musculo, atletico), enfoque en pecho, pierna, brazo, core(abdominales) y niveles de esfuerzo y dificultad (basico, intermedio y avanzado)". La rutina se personaliza con los 8 parámetros; obeso o edad ≥50 filtra ejercicios de alto impacto (suposición marcada como tal).
- S4 (clarificación respondida): plataforma "Web app (React + Vite)"; persistencia "Sí, localStorage" (perfil + rutina + progreso).
- S5 (usuario, verbatim): "Para la implementacion recuerda usar ODD y TDD" — test-first donde exista test determinista con resultado esperado claro (motor de generación); checks proporcionales para UI (build + revisión visual).

## Tasks

- T1 [S1,S4] scaffold Vite react-ts + git init + vitest — inline — done — commit 29b6e45
- T2 [S3] types.ts + data/exercises.ts (biblioteca ≥24 ejercicios) — inline — in progress
- T3 [S1,S3,S5] engine/generateRoutine.ts con tests TDD (RED→GREEN) — inline — pending
- T4 [S2] figures/Figure.tsx + animations (SVG stick-figure animado por ejercicio) — inline — pending
- T5 [S1,S2] componentes ProfileForm, WeeklyPlan, DayRoutine, ExerciseCard, ExerciseModal — inline — pending
- T6 [S4] hooks/useLocalStorage + integración en App — inline — pending
- T7 styles.css tema militar + verificación final (build/test/dev) — inline — pending

## Log

- L1 (request original, verbatim): "Crea una app para generar una rutina de ejercicios, de calistenia militar para casa, con imagenes y animaciones de cada ejercio. Basada en la edad, peso, dias por semana, tiempo de rutina, tipo de cuerpo (delgado,grueso, obeso,etc), objetivo (bajar de peso, ganar musculo, atletico), enfoque en pecho, pierna, brazo, core(abdominales) y niveles de esfuerzo y dificultad (basico, intermedio y avanzado). Preguntame ante cualquier duda o ambiguedad."
- L2 (respuestas de clarificación): plataforma = "Web app (React + Vite)"; animaciones = "SVG animados propios + enlace/embed de video demostrativo"; persistencia = "Sí, localStorage".
- L3 (corrección de workflow, verbatim): "Para la implementacion recuerda usar ODD y TDD".
- L4: UI copy en español (idioma del request y del contenido del dominio). Los enlaces de video usan búsqueda de YouTube para no inventar IDs. Carpeta `calisthenicsapp` estaba vacía; se inicializó git (main + commit de scaffold 29b6e45) y rama feature.
