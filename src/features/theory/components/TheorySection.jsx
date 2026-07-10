import { ConceptsGrid } from './ConceptsGrid'
import { AlgorithmExplainer } from './AlgorithmExplainer'
import { Band } from '../../../components/Band'
import heroIllustration from '../../../assets/artificial-intelligence-hero.svg'
import goalAchievementIllustration from '../../../assets/goal-achievement-illustration.svg'
import trafficGridlockIllustration from '../../../assets/traffic-gridlock-illustration.jpg'
import agentEnvironmentLoopGif from '../../../assets/agent-environment-loop.gif'
import droneCityAnalogyIllustration from '../../../assets/drone-city-analogy-illustration.jpg'
import './TheorySection.css'

export function TheorySection() {
  return (
    <section className="theory" id="teoria">
      <header className="theory__hero">
        <div className="theory__hero-text">
          <span className="theory__kicker">Sistemas Inteligentes · Recurso educativo</span>
          <h1>
            Aprendizaje por Refuerzo aplicado a la detección de anomalías en tráfico vehicular
          </h1>
          <p className="theory__lead">
            El flujo vehicular es dinámico. Los accidentes o cortes de ruta son anomalías que
            alteran el patrón normal, y encontrarlos rápido es vital para la gestión del tráfico y
            los equipos de emergencia. ¿Cómo aprende un dron a navegar la ciudad y encontrarlos por
            sí solo, sin una ruta programada de antemano?
          </p>
          <a className="btn btn--lg theory__cta" href="#demo">
            Ver al agente aprender en vivo ↓
          </a>
        </div>
        <img
          src={heroIllustration}
          alt="Ilustración de inteligencia artificial"
          className="theory__hero-illustration"
          width="229"
          height="360"
        />
      </header>

      <Band tone="light" wide>
        <div className="theory__split">
          <div className="theory__split-text">
            <h2><span aria-hidden="true">🎯</span> Propósito</h2>
            <p>
              El Aprendizaje por Refuerzo (<em>Reinforcement Learning</em>, RL) es una rama de la
              Inteligencia Artificial en la que un <strong>agente</strong> aprende interactuando
              con un <strong>entorno</strong>: prueba acciones, recibe{' '}
              <strong>recompensas</strong> o penalizaciones, y ajusta su comportamiento para
              conseguir la mayor recompensa posible a largo plazo — sin que nadie le muestre de
              antemano la respuesta correcta
              <sup><a href="#ref-1" className="citation">[1]</a></sup>.
            </p>
          </div>
          <img
            src={goalAchievementIllustration}
            alt="Ilustración de una persona escalando hacia una meta, con engranajes y un cohete de fondo, representando la maximización de recompensa a largo plazo"
            className="theory__split-media"
          />
        </div>
      </Band>

      <Band tone="soft" wide>
        <div className="theory__split">
          <div className="theory__split-text">
            <h2><span aria-hidden="true">😟</span> El problema real</h2>
            <p>
              Las rutas estáticas no sirven para esto: un accidente puede ocurrir en cualquier
              intersección, en cualquier momento. Enviar un dron o un equipo a recorrer siempre el
              mismo camino predefinido significa llegar tarde la mayoría de las veces — o no
              llegar nunca si la anomalía ocurre fuera de esa ruta fija.
            </p>
            <p>
              Hace falta algo que <strong>explore la ciudad de forma autónoma</strong> y aprenda,
              con la experiencia, qué caminos suelen llevar a incidentes y cuáles conviene evitar
              por congestión — sin que nadie le programe el mapa de antemano.
            </p>
          </div>
          <img
            src={trafficGridlockIllustration}
            alt="Ilustración de un atasco masivo de tráfico con múltiples vías colapsadas y carteles de 'sin salida'"
            className="theory__split-media"
          />
        </div>
      </Band>

      <Band tone="light" wide>
        <div className="theory__split">
          <div className="theory__split-text">
            <h2><span aria-hidden="true">😊</span> La solución con RL</h2>
            <p>
              En lugar de programar rutas fijas, se entrena a un <strong>agente</strong> — un dron
              de monitoreo — para que aprenda de forma autónoma a navegar la ciudad. Su misión es
              encontrar la anomalía en el menor tiempo posible, esquivando la congestión habitual.
            </p>
            <p>
              El agente y el entorno conversan en un bucle continuo: el dron observa su posición
              actual, elige hacia dónde moverse, y la ciudad responde con una recompensa y su nueva
              posición. Cada vuelta del ciclo es una oportunidad de aprender — la mecánica de
              navegación en grid de esta demo está inspirada en un simulador educativo de RL de
              código abierto<sup><a href="#ref-4" className="citation">[4]</a></sup>.
            </p>
          </div>
          <img
            src={agentEnvironmentLoopGif}
            alt="Animación del ciclo agente-entorno-recompensa: el agente observa, actúa, recibe recompensa y repite"
            className="theory__split-media"
          />
        </div>
      </Band>

      <Band tone="soft" wide>
        <div className="theory__analogy theory__split">
          <div className="theory__split-text">
            <h2><span aria-hidden="true">🚁</span> Analogía</h2>
            <p>
              Es como entrenar a un <strong>dron novato</strong>: nadie le entrega el mapa de dónde
              suelen ocurrir los accidentes ni por dónde se congestiona el tráfico. En vez de eso,
              recorre la ciudad, prueba caminos, y con el tiempo — a partir de aciertos y errores —
              desarrolla instinto para llegar directo a lo que busca. También se parece a sentar a
              alguien frente a un videojuego nuevo: prueba direcciones, gana puntos, pierde tiempo
              en callejones sin salida, y aprende la estrategia sin que nadie le explique las
              reglas de antemano.
            </p>
          </div>
          <img
            src={droneCityAnalogyIllustration}
            alt="Ilustración isométrica de un dron sobrevolando una cuadrícula de calles de una ciudad, con varias intersecciones marcadas"
            className="theory__split-media"
          />
        </div>
      </Band>

      <Band tone="light">
        <h2><span aria-hidden="true">🧩</span> Mapeo del modelo: los seis conceptos fundamentales</h2>
        <p>
          Todo problema de RL se describe con las mismas seis piezas. Así se ven en general — y así
          se ven traducidas a nuestro caso del dron de monitoreo.
        </p>
        <ConceptsGrid />
        <p>
          Al principio el dron decide prácticamente al azar. Pero cada recompensa deja una huella:
          las direcciones que funcionaron bien en una intersección se vuelven más probables, las que
          salieron caras (congestión) se vuelven menos. Con suficientes repeticiones, el
          comportamiento aleatorio se transforma en una <strong>política</strong>: una ruta
          aprendida.
        </p>
      </Band>

      <Band tone="soft" id="algoritmo">
        <AlgorithmExplainer />
      </Band>
    </section>
  )
}
