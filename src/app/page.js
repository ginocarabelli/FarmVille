"use client"
import styles from "./page.css";
import { objetos, inventario as Inventario, oro as Gold} from "@/data/Semillas";
import { useEffect, useState } from "react";
import Game from "./Game"

export default function Home() {
  const [oro, setOro] = useState(Gold);
  const [mensaje, setMensaje] = useState("");
  const [selectedObject, setSelectedObject] = useState(0);
  const [inventario, setInventario] = useState(Inventario);

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState(0);

  const [intervalId, setIntervalId] = useState(null);
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
      setTiempoRestante('+50 de Oro!');

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
      setOro(newGold)
      setInventario(prevInventario =>
        {
          const existe = prevInventario.some(o => o.id === product.id);

          const nuevoInventario = existe ? 
            prevInventario.map(obj => obj.id === product.id ? {...obj, cantidad: obj.cantidad+1, vidaUtil: product.vidaUtil } : obj)
          :
            [...prevInventario, {...product, cantidad: 1}]

          return nuevoInventario;
        }
      );
      localStorage.setItem('oro', newGold);
      localStorage.setItem('inventario', JSON.stringify(inventario))

    } else{
      setMensaje("No tienes oro suficiente!"); // Oculta el mensaje después de 2 segundos
      setTimeout(() => {
        setMensaje("");
      }, 2000);
    }
  }

  function sellItem(product){
    if(inventario.filter(i => i.id === product.id)[0]?.cantidad >= 1){
      const newGold = oro + product.valor;
      setOro(newGold)
      setInventario(prevInventario =>
        {
          const nuevoInventario = prevInventario.map(item =>
            item.id === product.id ? { ...item, cantidad: item.cantidad-1 } : item
          );
          return nuevoInventario;
        }
      );
      localStorage.setItem('oro', newGold);
      localStorage.setItem('inventario', JSON.stringify(inventario))
    } else{
      setMensaje(`No tienes objetos suficientes!`); // Oculta el mensaje después de 2 segundos
      setTimeout(() => {
        setMensaje("");
      }, 2000);
    }
  }

  // RECLAMO DE ORO AUTOMÁTICO
  useEffect(() => {
    // Recuperar objetos y oro de localStorage
    if (JSON.parse(localStorage.getItem('inventario')) === null) {
      localStorage.setItem('inventario', inventario);
    } else {
      setInventario(JSON.parse(localStorage.getItem('inventario')));
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

  // QUE SE EJECUTA CADA VEZ QUE CAMBIA EL INVENTARIO
  useEffect(() => {
    localStorage.setItem('inventario', JSON.stringify(inventario));
  }, [inventario])

  return (
    <div className="container">
      
      <aside className="menu">
          <h3 className="header-title" style={{textAlign: "center"}}>Inventario</h3>
          <h4 style={{ fontSize: "15px",textAlign: "center", backgroundColor: "var(--darkblue)", padding: "10px 0", borderRadius: "10px", color: tiempoRestante === '+50 de Oro!' ? 'var(--yellow)' : 'white'}}>Oro Gratis: {tiempoRestante}</h4>
          <div className="oro-player">
            <img src="../assets/Coin.png" alt="Oro" width="80px"/>
            <h4 className="oro-data">{oro}</h4>
          </div>
          
          <div className="exchange-zone">
            <button className="exchange-button comprar" onClick={() => {setIsOpen(true); setModalMode(1)}}>Comprar</button>
            <button className="exchange-button vender" onClick={() => {setIsOpen(true); setModalMode(2)}}>Vender</button>
          </div>
          <p>Semillas</p>
          <ul className="ul-frutos-menu">
              {inventario.filter(o => o.type === 1 && o.cantidad > 0).map((o) => (
                <li className={selectedObject == o.id ? "plants-item active" : "plants-item"} key={o.id} onClick={() => selectedObject === o.id ? setSelectedObject(0) : setSelectedObject(o.id) }>
                  <img src={o.src} alt={o.nombre}/>
                  <span className="item-quantity">{o.cantidad}</span>
                  <p>{(o.time/1000)/60} min.</p>
                </li>
              ))}
          </ul>
          <p>Plantas</p>
          <ul className="ul-frutos-menu">
              {inventario.filter(o => o.type === 3 && o.cantidad > 0).map((o) => (
                <li className={selectedObject === o.id && o.type !== 3 ? "fruto-item-list active" : "fruto-item-list"} key={o.id} onClick={() => selectedObject === o.id ? setSelectedObject(0) : setSelectedObject(o.id)}>
                  <img src={o.src} alt={o.nombre} width="60px"/>
                  <span className="fruto-quantity">{o.cantidad}</span>
                </li>
              ))}
          </ul>
          <p>Objetos / Decoraciones</p>
          <ul className="ul-frutos-menu">
              {inventario.filter(o => (o.type !== 1 && o.type !== 3) && (o.cantidad > 0 || o.vidaUtil !== 0)).map(o => (
                <li className={selectedObject === o.id && o.type !== 3 ? "fruto-item-list active" : "fruto-item-list"} key={o.id} onClick={() => selectedObject === o.id ? setSelectedObject(0) : setSelectedObject(o.id)}>
                  <img src={o.src} alt={o.nombre} width="60px"/>
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
                      <h3>Semillas</h3>
                      <ul className="ul-items-buy">
                        {objetos.filter(o => o.type === 1).map(o => (
                          <li className="item-buy" key={o.id} onClick={() => buyItem(o)}>
                            <img src={o.src} alt={o.nombre} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{o.nombre}</p>
                                <p>${o.valor}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <h3>Objetos</h3>
                      <ul className="ul-items-buy">
                        {objetos.filter(o => o.type === 2).map(o => (
                          <li className="item-buy" key={o.id} onClick={() => buyItem(o)}>
                            <img src={o.src} alt={o.nombre} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{o.nombre}</p>
                                <p>${o.valor}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <h3>Decoraciones</h3>
                      <ul className="ul-items-buy">
                        {objetos.filter(o => o.type === 4).map(o => (
                          <li className="item-buy" key={o.id} onClick={() => buyItem(o)}>
                            <img src={o.src} alt={o.nombre} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{o.nombre}</p>
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
                      {objetos.filter(o => o.type === 3).map((o) => (
                        <div className="sell-container-item" key={o.id}>
                          <li className="item-buy" onClick={() => sellItem(o)}>
                            <img src={o.src} alt={o.nombre} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>{o.nombre}</p>
                                <p>${o.valor}</p>
                              </div>
                            </div>
                          </li>
                          <p>Tienes: {inventario.filter(i => i.id === o.id)[0]?.cantidad || 0}</p>
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
          inventario={inventario} setInventario={setInventario}
          selectedObject={selectedObject}
        />
      </div>
    </div>
  );
}
