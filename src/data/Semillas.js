export const objetos = [
    { id: 1, nombre: "Semillas de Girasol", cantidad: 0, vidaUtil: 0, time: 60000, src: "/assets/GirasolSemilla.png", valor: 10, type: 1},
    { id: 2, nombre: "Semillas de Zanahoria", cantidad: 0, vidaUtil: 0, time: 120000, src: "/assets/ZanahoriaSemilla.png", valor: 50, type: 1},
    { id: 3, nombre: "Semillas de Lechuga", cantidad: 0, vidaUtil: 0, time: 600000, src: "/assets/LechugaSemilla.png", valor: 100, type: 1},
    { id: 4, nombre: "Azada", cantidad: 0, vidaUtil: 3, time: 0, src: "/assets/Azada.webp", valor: 1500, type: 2},
    { id: 5, nombre: "Pala", cantidad: 0, vidaUtil: 3, time: 0, src: "/assets/Pala.webp", valor: 1500, type: 2},
    { id: 6, nombre: "Girasol", cantidad: 0, vidaUtil: 0, time: 0, src: "/assets/Girasol.webp", valor: 20, type: 3},
    { id: 7, nombre: "Zanahoria", cantidad: 0, vidaUtil: 0, time: 0, src: "/assets/Zanahoria.webp", valor: 100, type: 3},
    { id: 8, nombre: "Lechuga", cantidad: 0, vidaUtil: 0, time: 0, src: "/assets/Lechuga.webp", valor: 300, type: 3},
    { id: 9, nombre: "Espantapajaros", cantidad: 0, vidaUtil: 0, time: 0, src: "/assets/Espantapajaros.png", valor: 7000, type: 4},
    { id: 10, nombre: "Casa", cantidad: 0, vidaUtil: 0, time: 0, src: "/assets/Casa.png", valor: 50000, type: 4},
    
]
export const inventario = [
    { ...objetos[0], cantidad: 3 },
]
export const oro = 0;

export function renderDivsConCultivos(divs, storedCultivos) {
    divs.forEach(div => {
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
                    console.log()
                    div.innerHTML = `
                    <div class="cultivo cultivated-${respectivoCultivo[0].planta.toLowerCase()}" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].planta}1.png);">
                        <p class="countdown" style="display: flex;">${hours}h ${minutes}m ${seconds}s</p>
                    </div>
                    `
                } else {
                    clearInterval(intervalId)
                    div.innerHTML = `
                    <div class="cultivo cultivated-${respectivoCultivo[0].planta.toLowerCase()} finished" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].planta}2.png);">
                        <p class="countdown" style="display: none;"></p>
                    </div>
                    `
                }
                
            },1000)
        } else {
            div.innerHTML = `
                <div class="cultivo cultivated-${respectivoCultivo[0].planta.toLowerCase()} finished" id=${respectivoCultivo[0].parcela} style="background: url(../assets/${respectivoCultivo[0].planta}2.png);">
                    <p class="countdown" style="display: none;"></p>
                </div>
            `
        }
    })
}