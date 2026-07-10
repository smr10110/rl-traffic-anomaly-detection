# Aprendizaje por Refuerzo para Detección de Anomalías en Tráfico Vehicular

**Estudiante:** Angelo Huaiquil

> **Demo en vivo:** https://smr10110.github.io/rl-traffic-anomaly-detection/

Aplicación web educativa e interactiva que enseña Aprendizaje por Refuerzo (RL) mediante un caso
práctico de navegación autónoma: un dron de monitoreo que aprende, con Q-learning tabular, a
recorrer una ciudad para encontrar accidentes o cortes de ruta lo más rápido posible, evadiendo la
congestión que va descubriendo en el camino. Proyecto individual para el curso "Sistemas
Inteligentes".

## Stack

- React + Vite, sin backend.
- Deploy estático en GitHub Pages.
- Sin router: una sola página con secciones ancladas por scroll (Teoría, Algoritmo, Demo en
  vivo, Conclusiones).
- Tests: Vitest + React Testing Library + `jest-axe` + `fast-check`.

## Instalación y uso

Clonar el repositorio:

```bash
git clone https://github.com/smr10110/rl-traffic-anomaly-detection.git
cd rl-traffic-anomaly-detection
```

O descargar el ZIP desde GitHub (botón "Code" → "Download ZIP") y descomprimirlo, sin necesidad
de tener git instalado.

Luego, instalar dependencias y correr la app:

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # sirve el build de dist/ localmente
npm run lint      # oxlint
npm run test      # vitest en modo watch
npm run test:run  # vitest en modo CI (una corrida)
```

> `npm run dev` levanta la app en **http://localhost:5173** (puerto por defecto de Vite).

## Arquitectura

El código se organiza **por feature** ("screaming architecture") en vez de por tipo técnico —
cada sección pedagógica de la página es una carpeta autocontenida. La lógica de Aprendizaje por
Refuerzo vive separada en `core/`, sin ninguna dependencia de React, para poder testearla de forma
aislada.

```
src/
├── app/                        # Shell: layout general, navegación entre secciones
│   └── App.jsx
├── features/                   # Cada sección pedagógica = un dominio autocontenido
│   ├── theory/                 # Intro a RL + conceptos fundamentales + algoritmo
│   ├── anomaly-detection-demo/ # Caso práctico: entorno + agente + resultados en vivo
│   │   ├── components/
│   │   └── hooks/
│   └── conclusions/            # Conclusiones y limitaciones
├── core/                       # Lógica de RL PURA — sin imports de React, testeable aislada
│   ├── environment/
│   │   └── TrafficGridEnv.js   # MDP: reset(), step(action) → {reward, nextState, done, ...}
│   └── agent/
│       └── QLearningAgent.js   # tabla Q, política epsilon-greedy, update(s,a,r,s')
├── components/                 # UI compartida entre features (Card, Badge, Band, Button)
├── assets/                     # Imágenes y diagramas del contenido pedagógico
├── styles/                     # Tokens de diseño y estilos globales
├── test/                       # Setup global de Vitest (jsdom, matchers)
└── main.jsx
tests/                          # Carpeta espejo de src/, alias @ configurado en vite.config.js
docs/
└── Informe.pdf                 # Informe breve (2-4 páginas) del entregable
```

## Documentación adicional

- [`docs/Informe.pdf`](docs/Informe.pdf) — informe breve (2-4 páginas) exigido como entregable:
  introducción a RL, conceptos fundamentales, algoritmo, modelado del caso práctico, visualización
  y conclusiones/limitaciones.
