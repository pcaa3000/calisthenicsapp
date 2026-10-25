# Calistenia Militar

Web app que genera rutinas semanales de calistenia militar para entrenar en casa, sin equipamiento de gimnasio.

## Características

- Wizard de perfil (edad, peso, tipo de cuerpo, nivel, días/semana, tiempo por sesión, objetivo, enfoque muscular).
- Plan semanal generado: calentamiento + circuito principal + vuelta a la calma por día.
- 37 ejercicios con figuras SVG animadas propias y enlace a video demostrativo.
- Personalización: objetivo (bajar peso / ganar músculo / atlético), nivel (básico / intermedio / avanzado), enfoques (pecho, pierna, brazo, core), bajo impacto automático para obeso, 50+ años o 120+ kg.
- Persistencia en `localStorage` (perfil, plan y ejercicios completados).

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:5173
npm test       # vitest
npm run build  # typecheck + build de producción
```

## Estructura

- `src/engine/generateRoutine.ts` — motor de generación (determinista por seed).
- `src/data/exercises.ts` — biblioteca de ejercicios.
- `src/figures/Figure.tsx` — figura stick-figure animada por CSS (`anim-*` en `src/styles.css`).
- `src/components/` — wizard, plan semanal, rutina del día, tarjeta/modal de ejercicio.
