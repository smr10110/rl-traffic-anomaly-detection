import { TheorySection } from '../features/theory/components/TheorySection'
import { AnomalyDetectionDemoSection } from '../features/anomaly-detection-demo/components/AnomalyDetectionDemoSection'
import { ConclusionsSection } from '../features/conclusions/components/ConclusionsSection'
import './App.css'

export function App() {
  return (
    <>
      <nav className="topnav" aria-label="Secciones de la página">
        <span className="topnav__brand">RL · Detección de anomalías en tráfico</span>
        <div className="topnav__links">
          <a href="#teoria">Teoría</a>
          <a href="#algoritmo">Algoritmo</a>
          <a href="#demo">Demo en vivo</a>
          <a href="#conclusiones">Conclusiones</a>
        </div>
      </nav>
      <main>
        <TheorySection />
        <AnomalyDetectionDemoSection />
        <ConclusionsSection />
      </main>
    </>
  )
}
