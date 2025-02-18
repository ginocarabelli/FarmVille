"use client"
import { objects } from "@/data/Semillas";
import game from "./game.css";
import { useEffect, useState } from "react";

const gridSize = 10;

export default function Game({ plantToFarm, semillas, setSemillas, frutos, setFrutos, objetos, setObjetos, selectedObject }) {

    const [parcelas, setParcelas] = useState([]);
    const [cultivos, setCultivos] = useState([]);

    const cultivoRanges = [
        [11, 13], [21, 23], [31, 33], // Primer bloque
        [16, 18], [26, 28], [36, 38]  // Segundo bloque
    ];

    function renderDirt(i) {
    
        for (const [start, end] of cultivoRanges) {
            if (i >= start && i <= end) {
                return "box-cultivo";
            }
        }
    
        return "box";
    }

    useEffect(() => {
        
        const storedCultivos = JSON.parse(localStorage.getItem('cultivos'));

        if (storedCultivos !== null) {
            setCultivos(storedCultivos);
            const divs = document.querySelectorAll('.box-cultivo');
            const divsConCultivos = Array.from(divs).filter(div => storedCultivos.some(cultivo => cultivo.parcela === div.id.toString()));
            
            divsConCultivos.forEach(div => {
                const respectivoCultivo = storedCultivos.filter(c => c.parcela === div.id)
                
                const farmDate = new Date(respectivoCultivo[0].farmDate)
                
                if(farmDate > new Date()){
                    const intervalId = setInterval(() => {
                        const date = new Date();
                        let timeLeft = farmDate - date;
                        let hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                        let minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                        let seconds = Math.floor((timeLeft / 1000) % 60);
    
                        if(timeLeft > 0){
                            
                            div.innerHTML = `
                            <div class="cultivo cultivated-${respectivoCultivo[0].type === 1 ? 'girasol' : 'zanahoria'}" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].type === 1 ? 'Girasol' : 'Zanahoria'}1.png);">
                                <p class="countdown" style="display: flex;">${hours}h ${minutes}m ${seconds}s</p>
                            </div>
                            `
                        } else {
                            clearInterval(intervalId)
                            div.innerHTML = `
                            <div class="cultivo cultivated-${respectivoCultivo[0].type === 1 ? 'girasol' : 'zanahoria'} finished" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].type === 1 ? 'Girasol' : 'Zanahoria'}2.png);">
                                <p class="countdown" style="display: none;"></p>
                            </div>
                            `
                        }
                        
                    },1000)
                } else {
                    div.innerHTML = `
                        <div class="cultivo cultivated-${respectivoCultivo[0].type === 1 ? 'girasol' : 'zanahoria'} finished" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].type === 1 ? 'Girasol' : 'Zanahoria'}2.png);">
                            <p class="countdown" style="display: none;"></p>
                        </div>
                    `
                }
                
            })
        }
    }, []);

    function handlePlant(e) {
        const updatedSemillas = [...semillas]; // OBTENGO LAS SEMILLAS EN FORMA DE ARRAY
        const updatedFrutos = [...frutos]; // OBTENGO LOS FRUTOS EN FORMA DE ARRAY
        const updatedObjetos = [...objetos]; // OBTENGO LOS OBJETOS EN FORMA DE ARRAY
        if (e.className === "box-cultivo" && // VERIFICO QUE SEA UNA PARCELA DE CULTIVO
            e.className !== "box-cultivo cultivado" && // VERIFICO QUE NO ESTÉ CULTIVADA LA PARCELA
            semillas[plantToFarm-1].semillas > 0 && // VERIFICO QUE LA SEMILLA NO SEA 0 O MENOS
            selectedObject === undefined
        ) {
            updatedSemillas[plantToFarm-1].semillas -= 1; //RESTO LAS SEMILLAS DE LA PLANTA SELECCIONADA
            setSemillas(updatedSemillas); // ACTUALIZO EL LOCALSTORAGE DE SEMILLAS
            
            const date = new Date();
            date.setSeconds(date.getSeconds() + (updatedSemillas[plantToFarm-1].time/100))

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
            e.appendChild(div) // AÑADO EL CULTIVO A SU PARCELA PADRE 
            div.appendChild(pCountdown);

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

            const timerId = setInterval(() => {
                const now = new Date().getTime();
                const timeLeft = date.getTime() - now;
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

        } else if (e.className.includes("finished")) { // CONSULTO SI EL CULTIVO ES ZANAHORIA O GIRASOL PARA SU RECOLECCION
            const plantIndex = e.className.includes("girasol") ? 0 : 1;
            if(plantIndex === 0){ // SI ES GIRASOL QUE DEVUELVA +3 FRUTOS
                updatedFrutos[plantIndex].cantidad += 3;
            } else { // SI ES ZANAHORIA QUE DEVUELVA 1
                updatedFrutos[plantIndex].cantidad += 2;
            }
            setFrutos(updatedFrutos);
            e.remove();
            setCultivos(cultivos => cultivos.filter(c => c.parcela.toString() !== e.id))
        } else if(selectedObject !== undefined && e.className !== 'box-cultivo') {
            switch (selectedObject){
                case 1:
                    if(updatedObjetos[selectedObject-1].cantidad >= 1)
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