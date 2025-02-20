"use client"
import { objects, objetos, oro, renderDivsConCultivos } from "@/data/Semillas";
import game from "./game.css";
import { useEffect, useState } from "react";
import { act } from "react";

const gridSize = 10;

export default function Game({ inventario, setInventario, selectedObject }) {
    
    const [parcelas, setParcelas] = useState([]);
    const [cultivos, setCultivos] = useState([]);

    const cultivoRanges = [
        [11, 13], [21, 23], [31, 33]
    ];

    function renderDirt(i) {
    
        for (const [start, end] of cultivoRanges) {
            if (i >= start && i <= end) {
                return "box-cultivo initial";
            } 
            else if (parcelas !== null && parcelas.some(p => p.id === i)) {
                return "box-cultivo";
            }
        }
    
        return "box";
    }

    function renderStoredParcelas(storedParcelas) {
        storedParcelas.forEach(p => {
            const divsParcela = Array.from(document.querySelectorAll('.box')).find(div => div.id == p)
            divsParcela.className = 'box-cultivo';
        })
    }

    function convertDirtToGrass(object, e){
        const cultivoHijo = e.querySelector('.cultivated') || null;
        if(!e.className.includes('initial') && cultivoHijo === null){
            e.className = 'box';

            setParcelas(prevParcelas => {
                const newParcelas = prevParcelas.filter(p => p.id !== e.id);
                localStorage.setItem('parcelas', JSON.stringify(newParcelas));
                return newParcelas;
            })
        } else {
            alert('no se puede eliminar una parcela con cultivo/inicial')
        }
    }

    function restarInventario(obj) {
        setInventario(prevInventario => {
            return prevInventario.map(item => {
                if (item.id === obj.id) {
                    const objModelo = objetos.find(o => o.id === obj.id);
                    
                    // Crear una copia del objeto a modificar
                    let newItem = { ...item, vidaUtil: item.vidaUtil - 1 };
    
                    if (newItem.vidaUtil === 0) {
                        newItem.cantidad -= 1;
                        newItem.vidaUtil = newItem.cantidad > 0 ? objModelo.vidaUtil : 0;
                    }
    
                    return newItem; // Devolvemos el objeto actualizado
                }
                return item; // Si no es el objeto buscado, lo devolvemos sin cambios
            });
        });
    }
    

    function convertGrassToDirt(object, e) {
        const obj = objetos.find(o => o.id === selectedObject);
        if(object.type === 1) {

            const div = document.createElement('div');
            const now = new Date();
            const farmDate = new Date(now.getTime()+object.time);
            div.classList.add('cultivo'); // ESTABLEZCO LA CLASE CULTIVO PARA DIFERENCIARSE DE SU PADRE
            div.setAttribute('id', e.id)
            switch (object.id) {
                case 1:
                    div.style.background = 'url(/assets/Girasol1.png)';
                    div.classList.add('cultivated-girasol');
                    break;
                case 2:
                    div.style.background = 'url(/assets/Zanahoria1.png)';
                    div.classList.add('cultivated-zanahoria');
                    break;
            }

            const pCountdown = document.createElement('p');
            pCountdown.classList.add('countdown');
            pCountdown.style.display = 'none';

            const timerId = setInterval(() => {

                const nowDate = new Date();
                const timeLeft = farmDate.getTime() - nowDate.getTime();

                if (timeLeft <= 0) {
                    pCountdown.style.display = "none";
                    div.style.background = `url(/assets/${object.nombre.substring(11).trim()}2.png)`;
                    div.classList.add('finished')
                    clearInterval(timerId);

                } else {
                    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                    const seconds = Math.floor((timeLeft / 1000) % 60);

                    pCountdown.style.display = 'flex';
                    div.style.background = `url(/assets/${object.nombre.substring(11).trim()}1.png)`;
                    pCountdown.textContent = `${hours}h ${minutes}m ${seconds}s`;
                
                }

            }, 1000); 

            div.appendChild(pCountdown);

            const cultivo = {
                planta: object.nombre.substring(11).trim(),
                parcela: e.id,
                farmDate: farmDate
            }

            setCultivos(prevCultivos => {
                const newCultivos = [...prevCultivos, cultivo];
                localStorage.setItem('cultivos', JSON.stringify(newCultivos));
                return newCultivos;
            })
            
            e.appendChild(div);

            return div;
            
        } else if (object.type === 2) {
            switch (object.nombre) {
                case "Azada":
                    
                    if(e.className !== 'box-cultivo') {
                        e.className = 'box-cultivo';
                        setParcelas(prevParcelas => {
                            const newParcelas = [...prevParcelas, e.id];
                            localStorage.setItem('parcelas', JSON.stringify(newParcelas));
                            return newParcelas;
                        })
                        restarInventario(obj)
                        console.log(JSON.parse(localStorage.getItem('inventario')))
                    }
                    
                    break;

                case "Pala":

                    if(!e.parentElement.className.includes('initial') && !e.className.includes('initial') && e.className !== 'box'){
                        
                        if(!e.className.includes('countdown') && e.className === 'box-cultivo' && !e.className.includes('finished')) {
                            e.className = "box";
                            setParcelas(prevParcelas => {
                                const newParcelas = prevParcelas.filter(p => p !== e.id);
                                localStorage.setItem('parcelas', JSON.stringify(newParcelas));
                                return newParcelas;
                            })
                            restarInventario(obj)
                        }
                        
                    }

                    break;
            }
        }
    }

    function convertFirstLetterUppercase(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    useEffect(() => {
        const storedParcelas = JSON.parse(localStorage.getItem('parcelas')) || []
        setParcelas(storedParcelas)

        renderStoredParcelas(storedParcelas)
        
        const storedCultivos = JSON.parse(localStorage.getItem('cultivos'));

        if (storedCultivos !== null) {
            setCultivos(storedCultivos);
            const divs = document.querySelectorAll('.box-cultivo');
            const divsConCultivos = Array.from(divs).filter(div => storedCultivos.some(cultivo => cultivo.parcela === div.id.toString()));
            
            renderDivsConCultivos(divsConCultivos, storedCultivos)
        }

    }, []);

    function handlePlant(e) {
        const obj = objetos.find(o => o.id === selectedObject) || {type: 0};
        if(e.className.includes("box-cultivo") && !e.className.includes("cultivado") && obj.type !== 2)
        {

            setInventario(prevInventario =>
                {
                    const nuevoInventario = prevInventario.map(item =>
                    item.id === obj.id ? { ...item, cantidad: item.cantidad-1 } : item
                    );
                    return nuevoInventario;
                }
            );
            convertGrassToDirt(obj, e)

        } else if (e.className.includes("finished") && obj.type !== 2) { // CONSULTO SI EL CULTIVO ES ZANAHORIA O GIRASOL PARA SU RECOLECCION

            const farmedPlant = objetos.filter(obj => obj.nombre === convertFirstLetterUppercase(e.className.split('-')[1].split(' ')[0]))[0];
            setInventario(prevInventario =>
                {
                  const existe = prevInventario.some(o => o.id === farmedPlant.id);
        
                  const nuevoInventario = existe ? 
                    prevInventario.map(obj => obj.id === farmedPlant.id ? {...obj, cantidad: obj.cantidad+1 } : obj)
                  :
                    [...prevInventario, {...farmedPlant, cantidad: 1}]
        
                  return nuevoInventario;
                }
            );
              localStorage.setItem('inventario', JSON.stringify(inventario))
            e.remove();
            setCultivos(cultivos => {
                const nuevosCultivos = cultivos.filter(c => c.parcela.toString() !== e.id);
                localStorage.setItem('cultivos', JSON.stringify(nuevosCultivos));
                return nuevosCultivos;
            });
        } else if (obj.type === 2) {

            convertGrassToDirt(obj, e)
        }
        
    }
    
    return (
        <main
            className="game"
            style={{
            display: "grid",
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`
      }}
    >
    
      {Array.from({ length: gridSize * gridSize}).map((_, i) => (
        <div
          key={i}
          id={i+1}
          onClick={(e) => handlePlant(e.target)}
          className={renderDirt(i)}
        >
        </div>
      ))}
        </main>
    );
}