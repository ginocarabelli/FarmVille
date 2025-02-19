"use client"
import { objects, oro, renderDivsConCultivos } from "@/data/Semillas";
import game from "./game.css";
import { useEffect, useState } from "react";
import { act } from "react";

const gridSize = 10;

export default function Game({ plantToFarm, semillas, setSemillas, frutos, setFrutos, objetos, setObjetos, selectedObject }) {

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
            const divsParcela = Array.from(document.querySelectorAll('.box')).find(div => div.id === p.id)
            divsParcela.className = 'box-cultivo';
        })
    }

    function convertGrassToDirt(semillas, plantToFarm, e, farmDate) {
        const div = document.createElement('div'); // CREO UNA "PLANTA" DENTRO DE LA PARCELA
        div.classList.add('cultivo'); // ESTABLEZCO LA CLASE CULTIVO PARA DIFERENCIARSE DE SU PADRE
        div.setAttribute('id', e.id)
        if(semillas[plantToFarm-1].id === 1){  // ESTABLEZCO ATRIBUTOS NECESARIOS PARA LA DIFERENCIACIÓN DE CULTIVO
            div.style.background = 'url(/assets/Girasol1.png)';
            div.classList.add('cultivated-girasol');
        } else if(semillas[plantToFarm-1].id === 2){
            div.style.background = 'url(/assets/Zanahoria1.png)';
            div.classList.add('cultivated-zanahoria');
        }

        const pCountdown = document.createElement('p');
        pCountdown.style.display = 'none';
        pCountdown.classList.add('countdown');
        div.appendChild(pCountdown);

        const timerId = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = farmDate.getTime() - now;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                pCountdown.style.display = "none";
                div.style.background = `url(/assets/${semillas[plantToFarm-1].planta}2.png)`;
                div.classList.add('finished')
            } else {
                const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                const seconds = Math.floor((timeLeft / 1000) % 60);
                pCountdown.style.display = 'flex';
                pCountdown.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000); // ACTUALIZO EL TIEMPO RESTANTE PARA LA COSECHA
        
        return div;
    }

    useEffect(() => {
        const storedParcelas = JSON.parse(localStorage.getItem('parcelas')) || []
        setParcelas(storedParcelas)
        console.log(storedParcelas)

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
        const updatedSemillas = [...semillas]; // OBTENGO LAS SEMILLAS EN FORMA DE ARRAY
        const updatedFrutos = [...frutos]; // OBTENGO LOS FRUTOS EN FORMA DE ARRAY
        const updatedObjetos = [...objetos]; // OBTENGO LOS OBJETOS EN FORMA DE ARRAY
        if (
            selectedObject === 0 && // VERIFICO QUE NO HAYA OBJETOS SELECCIONADOS
            e.className.includes("box-cultivo") && // VERIFICO QUE SEA UNA PARCELA DE CULTIVO
            e.className !== "box-cultivo cultivado" && // VERIFICO QUE NO ESTÉ CULTIVADA LA PARCELA
            semillas[plantToFarm-1].semillas > 0 // VERIFICO QUE LA SEMILLA NO SEA 0 O MENOS
        ) {
            updatedSemillas[plantToFarm-1].semillas -= 1; //RESTO LAS SEMILLAS DE LA PLANTA SELECCIONADA
            setSemillas(updatedSemillas); // ACTUALIZO EL LOCALSTORAGE DE SEMILLAS
            
            const date = new Date();
            date.setSeconds(date.getSeconds() + (updatedSemillas[plantToFarm-1].time/100))

            const div = convertGrassToDirt(semillas, plantToFarm, e, date);
            e.appendChild(div) // AÑADO EL CULTIVO A SU PARCELA PADRE 

            const cultivo = {
                parcela: e.id,
                type: semillas[plantToFarm-1].id,
                farmDate: date
            }
            
            setCultivos(prevCultivos => {
                const nuevosCultivos = [...prevCultivos, cultivo];
                localStorage.setItem('cultivos', JSON.stringify(nuevosCultivos));
                return nuevosCultivos;
            });

        } else if (e.className.includes("finished")) { // CONSULTO SI EL CULTIVO ES ZANAHORIA O GIRASOL PARA SU RECOLECCION
            const plantIndex = e.className.includes("girasol") ? 0 : 1;
            updatedFrutos[plantIndex].cantidad += 1;
            setFrutos(updatedFrutos);
            e.remove();
            setCultivos(cultivos => {
                const nuevosCultivos = cultivos.filter(c => c.parcela.toString() !== e.id);
                localStorage.setItem('cultivos', JSON.stringify(nuevosCultivos));
                return nuevosCultivos;
            });
        } else if(selectedObject !== 0) {
            switch (selectedObject){
                case 1:
                    if(updatedObjetos[selectedObject-1].cantidad >= 1 && e.className === 'box')
                    {
                        e.className = 'box-cultivo';
                        setParcelas(prevParcelas => {
                            const nuevasParcelas = [...prevParcelas, {id: e.id}];
                            localStorage.setItem('parcelas', JSON.stringify(nuevasParcelas));
                            return nuevasParcelas;
                        })
                        updatedObjetos[selectedObject-1].vidaUtil -= 1
                        if(updatedObjetos[selectedObject-1].vidaUtil === 0){
                            updatedObjetos[selectedObject-1].cantidad -= 1;
                            updatedObjetos[selectedObject-1].vidaUtil = 5;
                        }
                        setObjetos(updatedObjetos)
                        localStorage.setItem("objetos", JSON.stringify(updatedObjetos));
                        localStorage.setItem("parcelas", JSON.stringify(parcelas));
                        console.log(updatedObjetos)
                    }
                    break;
                case 2:
                    if(updatedObjetos[selectedObject-1].cantidad >= 1 && e.className === 'box-cultivo')
                    {
                        e.className = 'box';
                        setParcelas(prevParcelas => {
                            const nuevasParcelas = prevParcelas.filter(p => p.id !== e.id);
                            localStorage.setItem('parcelas', JSON.stringify(nuevasParcelas));
                            return nuevasParcelas;
                        })
                        updatedObjetos[selectedObject-1].vidaUtil -= 1
                        if(updatedObjetos[selectedObject-1].vidaUtil === 0){
                            updatedObjetos[selectedObject-1].cantidad -= 1;
                            updatedObjetos[selectedObject-1].vidaUtil = 5;
                        }
                        setObjetos(updatedObjetos)
                        localStorage.setItem("objetos", JSON.stringify(updatedObjetos));
                        localStorage.setItem("parcelas", JSON.stringify(parcelas));
                    } else if(e.className.includes('initial')){
                        alert('No puedes eliminar una parcela Inicial')
                    }
            }
        }
        localStorage.setItem('cultivos', JSON.stringify(cultivos))
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