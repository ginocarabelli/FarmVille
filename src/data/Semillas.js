export const semillas = [
    { id: 1, planta: "Girasol", semillas: 3, time: 6000, semillaSrc: "/assets/GirasolSemilla.png", valor: 10, type: 1},
    { id: 2, planta: "Zanahoria", semillas: 0, time: 12000, semillaSrc: "/assets/ZanahoriaSemilla.png", valor: 50, type: 1}
]
export const frutos = [
    { id: 1, semilla: semillas[0], cantidad: 0, valor: 20, plantaSrc: "/assets/Girasol.webp"},
    { id: 2, semilla: semillas[1], cantidad: 0, valor: 100, plantaSrc: "/assets/Zanahoria.webp"}
]
export const objects = [
    {id: 1, type: 3, objeto: 'Azada', cantidad: 0, vidaUtil: 5, valor: 1500, objSrc: "/assets/Azada.webp"},
    {id: 2, type: 3, objeto: 'Pala', cantidad: 0, vidaUtil: 3, valor: 2000, objSrc: "/assets/Pala.webp"}
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
