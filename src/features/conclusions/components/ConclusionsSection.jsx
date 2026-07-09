import './ConclusionsSection.css'

export function ConclusionsSection() {
  return (
    <section className="conclusions" id="conclusiones">
      <div className="conclusions__inner">
        <h2>Conclusiones y limitaciones</h2>

        <h3>Lo que demuestra esta propuesta</h3>
        <ul>
          <li>
            Un problema de navegación autónoma puede modelarse como un proceso de decisión de
            Markov: la posición del dron en el grid es el estado, la dirección de movimiento es la
            acción, y el costo/beneficio de cada resultado (tiempo perdido, congestión, anomalía
            encontrada) es la recompensa.
          </li>
          <li>
            El diseño de recompensas (−1 por movimiento, −50 por entrar a congestión, +100 por
            encontrar una anomalía) permite codificar prioridades de la misión directamente en el
            aprendizaje, sin programar una ruta ni reglas de antemano.
          </li>
          <li>
            Con apenas 25 estados y una tabla Q de 25×4, el agente desarrolla una política muy
            eficiente en pocas decenas de episodios — visible en vivo en la simulación de esta
            página.
          </li>
        </ul>

        <h3>Lo que este enfoque no resuelve</h3>
        <ul>
          <li>
            <strong>Escala:</strong> el Q-learning tabular exige discretizar el estado. Una ciudad
            real, con GPS continuo y muchas más variables (velocidad, hora del día, sensores),
            haría explotar la tabla; los sistemas reales usan aproximación de funciones (Deep
            Q-Networks) en vez de una tabla explícita.
          </li>
          <li>
            <strong>Datos sintéticos:</strong> el grid de esta demo sortea anomalías y congestión de
            forma independiente por celda al inicio de cada episodio. El tráfico real tiene
            correlación espacial y temporal (un accidente afecta a las calles vecinas, la
            congestión se mueve con la hora pico), algo que este modelo simplificado no captura.
          </li>
          <li>
            <strong>Entorno estático dentro de un episodio:</strong> aquí el grid no cambia mientras
            el dron lo recorre. En la realidad una anomalía puede aparecer o resolverse a mitad de
            un recorrido, lo que requeriría un entorno no estacionario y reentrenamiento continuo.
          </li>
          <li>
            <strong>Optimalidad no garantizada:</strong> como la tasa de exploración (ε) se mantiene
            fija en vez de reducirse con el tiempo, no hay garantía matemática de que la política
            aprendida sea la óptima exacta — en la práctica converge a un comportamiento muy
            eficiente, pero no a la ruta perfecta demostrable.
          </li>
        </ul>

        <footer className="conclusions__footer">
          <p>
            Proyecto individual · Sistemas Inteligentes · 2026 —{' '}
            <a href="https://github.com/smr10110/rl-traffic-anomaly-detection" rel="noreferrer">
              código fuente en GitHub
            </a>
          </p>
        </footer>
      </div>
    </section>
  )
}
