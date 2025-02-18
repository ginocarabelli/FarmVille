"use client"
import Image from "next/image";
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

  function openModal(mode){
    setIsOpen(true);
    setModalMode(mode);
  }

  function buyItem(product){
    if(oro >= product.valor){
      let semillas = JSON.parse(localStorage.getItem('semillas'));
      semillas[product.id-1].semillas += 1;

      const newGold = oro - product.valor;
      setOro(newGold)
      setSemillas(semillas);
      localStorage.setItem('oro', newGold);
      localStorage.setItem('semillas', JSON.stringify(semillas))
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
    if(JSON.parse(localStorage.getItem('objetos')) === null){
      localStorage.setItem('objetos', objects);
    } else{
      setObjetos(JSON.parse(localStorage.getItem('objetos')))
    }
    if(JSON.parse(localStorage.getItem('oro')) === null){
      localStorage.setItem('oro', oro);
    } else{
      setOro(JSON.parse(localStorage.getItem('oro')))
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('semillas', JSON.stringify(semillas));
    localStorage.setItem('frutos', JSON.stringify(frutos));
    localStorage.setItem('objetos', JSON.stringify(objetos));
  }, [semillas, frutos, objetos])

  const [selectedSeed, setSelectedSeed] = useState(1);

  return (
    <div className="container">
      {isOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2 style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"}}>{modalMode === 1 ? 'COMPRA' : 'VENTA'} <span style={{display: "flex", alignItems: "center"}}><img src="../assets/Coin.png" alt="Oro" width="50px" /> {oro}</span></h2>
                  {modalMode === 1 ? 
                    <div className="items-container">
                      <ul className="ul-items-buy">
                        {semillas.map((s) => (
                          <li className="item-buy" key={s.id} onClick={() => buyItem(s)}>
                            <img src={s.semillaSrc} alt={s.planta} width="80px"/>
                            <div className="product-info">
                              <div className="item-info">
                                <p>Semillas de {s.planta}</p>
                                <p>${s.valor}</p>
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
              <a href="#">About Me</a>
            </li>
            <li>
              <a href="#">Portfolio</a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="game-menu">
        <aside className="menu">
          <h3 className="header-title" style={{textAlign: "center"}}>Inventario</h3>
          <div className="oro-player">
            <img src="../assets/Coin.png" alt="Oro" width="80px"/>
            <p className="oro-data">{oro}</p>
          </div>
          
          <div className="exchange-zone">
            <button className="exchange-button comprar" onClick={() => openModal(1)}>Comprar</button>
            <button className="exchange-button vender" onClick={() => openModal(2)}>Vender</button>
          </div>
          <ul className="ul-menu">
              {semillas.map((s) => (
                <li className={selectedSeed == s.id ? "plants-item selected" : "plants-item"} key={s.id} onClick={() => setSelectedSeed(s.id)}>
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
                <li className={selectedObject === o.id ? "fruto-item-list object active" : "fruto-item-list object"} key={o.id} onClick={() => {selectedObject === o.id ? setSelectedObject(0) : setSelectedObject(o.id)}}>
                  <img src={o.objSrc} alt={o.objeto} width="60px"/>
                  <span className="fruto-quantity">{o.cantidad}</span>
                </li>
              ))}
          </ul>
        </aside>
        <Game plantToFarm={selectedSeed} semillas={semillas} setSemillas={setSemillas} frutos={frutos} setFrutos={setFrutos} objetos={objetos} setObjetos={setObjetos} selectedObject={selectedObject}/>
      </div>
    </div>
  );
}
