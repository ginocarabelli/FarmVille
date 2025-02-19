"use client"
import styles from "./page.css";
import { frutos as frutosData, oro as Gold, objects, semillas as semillasData} from "@/data/Semillas";
import { useEffect, useState } from "react";
import Game from "./Game"

export default function Home() {
  const [oro, setOro] = useState(Gold);
  const [mensaje, setMensaje] = useState("");
  const [frutos, setFrutos] = useState(() => {
    const storedFrutos = JSON.parse(localStorage.getItem('frutos'));
    return storedFrutos || frutosData;
  })
  const [semillas, setSemillas] = useState(() => {
    const storedSemillas = JSON.parse(localStorage.getItem('semillas'));
    return storedSemillas || semillasData;
  })
  const [selectedObject, setSelectedObject] = useState(0);
  const [objetos, setObjetos] = useState(objects);

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(0);
  
  const [selectedSeed, setSelectedSeed] = useState(1);

  const [intervalId, setIntervalId] = useState(null); // Para almacenar el ID del intervalo
  const [tiempoRestante, setTiempoRestante] = useState('');

  const updateTimeRemaining = (claimDate, interval) => {
    const actualDate = new Date();
    const diferenciaMs = claimDate - actualDate;

    if (diferenciaMs > 0) {
      // Calcular horas, minutos y segundos restantes
      const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
      const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenciaMs % (1000 * 60)) / 1000);

      // Actualizar el tiempo restante en la UI
      setTiempoRestante(`${horas}hs ${minutos}min ${segundos}seg`);
    } else {
      // Cuando llega a 0, actualizar oro y restablecer la fecha de reclamación
      setTiempoRestante('+100 de Oro!');

      // Añadir oro
      setOro((prevOro) => {
        const newGoldAmount = prevOro + 50;
        localStorage.setItem('oro', newGoldAmount);
        return newGoldAmount;
      });

      // Actualizar la fecha de reclamación para dentro de 1 hora
      const newClaimDate = new Date();
      newClaimDate.setHours(newClaimDate.getHours() + 1);
      localStorage.setItem('nextGoldClaim', newClaimDate);

      // Reiniciar el intervalo
      clearInterval(interval);
      const newInterval = setInterval(() => {
        updateTimeRemaining(newClaimDate, newInterval);
      }, 1000);
      setIntervalId(newInterval);
    }
  };

  function buyItem(product){
    if(oro >= product.valor){
      const newGold = oro - product.valor;
      switch(product.type){
        case 1:
          let semillas = JSON.parse(localStorage.getItem('semillas'));
          semillas[product.id-1].semillas += 1;

          setOro(newGold)
          setSemillas(semillas);
          localStorage.setItem('oro', newGold);
          localStorage.setItem('semillas', JSON.stringify(semillas))
          break;
        case 3:
          let objetos = JSON.parse(localStorage.getItem('objetos'));
          objetos[product.id-1].cantidad += 1;

          setOro(newGold)
          setObjetos(objetos);
          localStorage.setItem('oro', newGold);
          localStorage.setItem('objetos', JSON.stringify(objetos))
      }
    } else{
      setMensaje("No tienes dinero suficiente!"); // Oculta el mensaje después de 2 segundos
      setTimeout(() => {
        setMensaje("");
      }, 2000);
    }
  }

  function sellItem(product){
    if(product.cantidad >= 1){
      let frutos = JSON.parse(localStorage.getItem('frutos'));
      frutos[product.id-1].cantidad -= 1;

      const newGold = oro + product.valor;
      setOro(newGold)
      setFrutos(frutos);
      localStorage.setItem('oro', newGold);
      localStorage.setItem('frutos', JSON.stringify(frutos))
    } else{
      setMensaje("No tienes plantas suficiente!"); // Oculta el mensaje después de 2 segundos
      setTimeout(() => {
        setMensaje("");
      }, 2000);
    }
  }

  useEffect(() => {
    // Recuperar objetos y oro de localStorage
    if (JSON.parse(localStorage.getItem('objetos')) === null) {
      localStorage.setItem('objetos', objects);
    } else {
      setObjetos(JSON.parse(localStorage.getItem('objetos')));
    }

    if (JSON.parse(localStorage.getItem('oro')) === null) {
      localStorage.setItem('oro', oro);
    } else {
      setOro(JSON.parse(localStorage.getItem('oro')));
    }

    // Recuperar la fecha de reclamación siguiente
    let nextGoldClaim = localStorage.getItem('nextGoldClaim');
    if (!nextGoldClaim) {
      // Si no hay fecha, se establece la fecha de reclamación para 1 hora a partir de ahora
      nextGoldClaim = new Date();
      nextGoldClaim.setHours(nextGoldClaim.getHours() + 1);
      localStorage.setItem('nextGoldClaim', nextGoldClaim);
    }

    const claimDate = new Date(nextGoldClaim);

    // Iniciar el intervalo
    const interval = setInterval(() => {
      updateTimeRemaining(claimDate, interval);
    }, 1000);

    // Guardar el ID del intervalo
    setIntervalId(interval);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('semillas', JSON.stringify(semillas));
    localStorage.setItem('frutos', JSON.stringify(frutos));
    localStorage.setItem('objetos', JSON.stringify(objetos));
  }, [semillas, frutos, objetos])

  return (
    <div className="container">
      <aside className="menu">
          <h3 className="header-title" style={{textAlign: "center"}}>Inventario</h3>
          <h4 style={{textAlign: "center", backgroundColor: "var(--darkblue)", padding: "10px 0", borderRadius: "10px", color: tiempoRestante === '+100 de Oro!' ? 'var(--yellow)' : 'white'}}>Oro Gratis: {tiempoRestante}</h4>
          <div className="oro-player">
            <img src="../assets/Coin.png" alt="Oro" width="80px"/>
            <p className="oro-data">{oro}</p>
          </div>
          
          <div className="exchange-zone">
            <button className="exchange-button comprar" onClick={() => {setIsOpen(true); setModalMode(1)}}>Comprar</button>
            <button className="exchange-button vender" onClick={() => {setIsOpen(true); setModalMode(2)}}>Vender</button>
          </div>
          <ul className="ul-menu">
              {semillas.map((s) => (
                <li className={selectedSeed == s.id ? "plants-item selected" : "plants-item"} key={s.id} onClick={() => {setSelectedSeed(s.id); setSelectedObject(0);} }>
                  <img src={s.semillaSrc} alt={s.planta}/>
                  <span className="item-quantity">{s.semillas}</span>
                  <p>{s.planta} - {s.time / 100} Seg.</p>
                </li>
              ))}
          </ul>
          <ul className="ul-frutos-menu">
              {frutos.map((f) => (
                <li className="fruto-item-list" key={f.id}>
                  <img src={f.plantaSrc} alt={f.semilla.planta} width="60px"/>
                  <span className="fruto-quantity">{f.cantidad}</span>
                </li>
              ))}
              {objetos.map((o) => (
                o.cantidad === 0 ? "" : 
                <li className={selectedObject === o.id ? "fruto-item-list object active" : "fruto-item-list object"} key={o.id} onClick={() => {{selectedObject === o.id ? setSelectedObject(0) : setSelectedObject(o.id)}; setSelectedSeed(0)}}>
                  <img src={o.objSrc} alt={o.objeto} width="60px"/>
                  <span className="fruto-quantity">{o.cantidad}</span>
                </li>
              ))}
          </ul>
      </aside>
      {isOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"}}>{modalMode === 1 ? 'COMPRAR' : 'VENDER'} <span style={{display: "flex", alignItems: "center"}}><img src="../assets/Coin.png" alt="Oro" width="50px" /> {oro}</span></h2>
                  {modalMode === 1 ? 
                    <div className="items-container">
                      <ul className="ul-items-buy">
                        {semillas.map((s) => (
                          <li className="item-buy" key={s.id} onClick={() => buyItem(s)}>
                            <img src={s.semillaSrc} alt={s.planta} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{s.planta}</p>
                                <p>${s.valor}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                        {objetos.map((o) => (
                          <li className="item-buy" key={o.id} onClick={() => buyItem(o)}>
                            <img src={o.objSrc} alt={o.objeto} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{o.objeto}</p>
                                <p>${o.valor}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p style={{ color: "red"}}>{mensaje}</p>
                    </div>
                  :
                  <div className="items-container">
                    <ul className="ul-items-buy">
                      {frutos.map((f) => (
                        <div className="sell-container-item" key={f.id}>
                          <li className="item-buy" onClick={() => sellItem(f)}>
                            <img src={f.plantaSrc} alt={f.semilla.planta} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{f.semilla.planta}</p>
                                <p>${f.valor}</p>
                              </div>
                            </div>
                          </li>
                          <p>Tienes: {f.cantidad}</p>
                        </div>
                      ))}
                    </ul>
                    <p style={{ color: "red"}}>{mensaje}</p>
                  </div>
                  }
                  <button onClick={() => setIsOpen(false)} className="close-btn">
                      Cerrar
                  </button>
              </div>
          </div>
      )}
      <header className="header">
        <h3 className="header-title">FarmVille</h3>
        <nav>
          <ul>
            <li>
              <a href="#">How to play</a>
            </li>
            <li>
              <a href="#">Portfolio</a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="game-menu">
        <Game 
        plantToFarm={selectedSeed} 
        semillas={semillas} setSemillas={setSemillas} 
        frutos={frutos} setFrutos={setFrutos} 
        objetos={objetos} setObjetos={setObjetos} selectedObject={selectedObject}
        tiempoRestante={tiempoRestante} setTiempoRestante={setTiempoRestante}
        intervalId={intervalId} setIntervalId={setIntervalId}
        />
      </div>
    </div>
  );
}
