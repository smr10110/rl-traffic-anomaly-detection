import qtableTrainingHeatmap from '../../../assets/qtable-training-heatmap.gif'
import explorationVsExploitationDiagram from '../../../assets/exploration-vs-exploitation-diagram.jpg'
import './AlgorithmExplainer.css'

const REWARDS = [
  { situation: 'Cada movimiento', reward: '−1', why: 'Consume tiempo/batería del dron — fuerza a buscar la ruta más corta.', good: false },
  { situation: 'Entrar a una zona de congestión', reward: '−50', why: 'El embotellamiento retrasa la misión — el dron aprende a evadir estos sectores.', good: false },
  { situation: 'Llegar a la anomalía (accidente/corte)', reward: '+100', why: 'Es el objetivo de la misión: encontrarla lo antes posible.', good: true },
]

export function AlgorithmExplainer() {
  return (
    <>
      <h2><span aria-hidden="true">🧮</span> El algoritmo: Q-learning</h2>
      <p>
        Q-learning es uno de los algoritmos clásicos de RL
        <sup><a href="#ref-2" className="citation">[2]</a></sup>. Su idea central es mantener una{' '}
        <strong>tabla Q</strong>: una fila por cada estado posible, una columna por cada acción, y
        en cada celda un número — <span className="algo__q">Q(s, a)</span> — que estima qué tan
        buena es esa acción en ese estado
        <sup><a href="#ref-3" className="citation">[3]</a></sup>. Al inicio todo vale cero: el dron
        no sabe nada.
      </p>
      <figure className="algo__media">
        <img
          src={qtableTrainingHeatmap}
          alt="Animación de un grid de entrenamiento donde las celdas se colorean según su recompensa a medida que el agente las visita, mostrando cómo la tabla de valores se va llenando con la experiencia"
        />
        <figcaption>
          Cada celda se colorea según su recompensa a medida que un agente la va visitando — la
          misma idea que la tabla Q de esta demo, aplicada a un grid de entrenamiento.
        </figcaption>
      </figure>

      <h3><span aria-hidden="true">🔁</span> La regla de actualización</h3>
      <p>
        Después de cada movimiento, la celda usada se corrige con la ecuación de Bellman
        <sup><a href="#ref-2" className="citation">[2]</a></sup>:
      </p>
      <div className="algo__formula" role="math" aria-label="Q de s y a se actualiza sumando alfa por la diferencia entre r más gamma por el máximo Q del siguiente estado, menos Q actual">
        Q(s, a) ← Q(s, a) + α · [ r + γ · max<sub>a′</sub> Q(s′, a′) − Q(s, a) ]
      </div>
      <p>
        Fijate que la actualización usa el <strong>máximo</strong> Q del siguiente estado — no la
        acción que el dron realmente va a tomar después (que puede ser una exploración al azar).
        Por eso Q-learning es un algoritmo <em>off-policy</em>: aprende sobre la mejor política
        posible aunque en la práctica explore siguiendo otra
        <sup><a href="#ref-1" className="citation">[1]</a></sup>.
      </p>
      <ul className="algo__params">
        <li>
          <strong>α (alfa = 0.1)</strong> — tasa de aprendizaje: cuánto corrige cada nueva
          experiencia lo ya aprendido.
        </li>
        <li>
          <strong>γ (gamma = 0.9)</strong> — factor de descuento: cuánto pesan las recompensas
          futuras frente a la inmediata.
        </li>
        <li>
          <strong>ε (épsilon = 0.2)</strong> — exploración: un 20% de las veces el dron prueba una
          dirección al azar en vez de la mejor conocida. Sin explorar, nunca descubriría rutas
          mejores que la primera que le funcionó
          <sup><a href="#ref-1" className="citation">[1]</a></sup>.
        </li>
      </ul>
      <p>
        En el código de esta app la fórmula es literalmente una línea —{' '}
        <code>q + alpha * (reward + gamma * maxNextQ - q)</code> — ejecutada tras cada movimiento.
      </p>
      <figure className="algo__media algo__media--wide">
        <img
          src={explorationVsExploitationDiagram}
          alt="Diagrama de balanza comparando exploración (búsqueda de conocimiento, incertidumbre a corto plazo) contra explotación (maximización de recompensa, certeza a corto plazo), equilibradas por el parámetro épsilon"
        />
        <figcaption>
          El mismo dilema que resuelve ε: probar algo nuevo para aprender (explorar) versus usar
          lo que ya funciona (explotar).
        </figcaption>
      </figure>

      <h3><span aria-hidden="true">🚧</span> El sistema de recompensas</h3>
      <p>
        El diseño de la recompensa codifica el costo real de la misión: moverse cuesta tiempo,
        la congestión cuesta más, y encontrar la anomalía es lo único que realmente importa.
      </p>
      <table className="algo__rewards">
        <thead>
          <tr>
            <th scope="col">Situación</th>
            <th scope="col">Recompensa</th>
            <th scope="col">Por qué</th>
          </tr>
        </thead>
        <tbody>
          {REWARDS.map((row) => (
            <tr key={row.situation}>
              <td>{row.situation}</td>
              <td className={row.good ? 'algo__reward--up' : 'algo__reward--down'}>{row.reward}</td>
              <td>{row.why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3><span aria-hidden="true">🗺️</span> El resultado: una política muy eficiente</h3>
      <p>
        Mediante prueba y error continuo, el dron calcula el valor de cada intersección: qué tan
        conveniente es estar ahí y hacia dónde conviene moverse después. El resultado es{' '}
        <strong>una política muy eficiente</strong> — un mapa mental donde el dron ya casi no
        explora al azar, sino que toma una ruta directa hacia la anomalía, reaccionando
        inteligentemente a la congestión que va descubriendo en el camino. Como ε y α se mantienen
        fijos en vez de ir bajando con el tiempo, no hay garantía matemática de que sea la ruta
        perfecta<sup><a href="#ref-2" className="citation">[2]</a></sup> — pero en la práctica
        converge a un comportamiento muy cercano al óptimo.
      </p>
    </>
  )
}
