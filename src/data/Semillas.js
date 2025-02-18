export const semillas = [
    { id: 1, planta: "Girasol", semillas: 3, time: 6000, semillaSrc: "/assets/GirasolSemilla.png", valor: 10},
    { id: 2, planta: "Zanahoria", semillas: 0, time: 12000, semillaSrc: "/assets/ZanahoriaSemilla.png", valor: 30}
]
export const frutos = [
    { id: 1, semilla: semillas[0], cantidad: 0, valor: 20, plantaSrc: "/assets/Girasol.png"},
    { id: 2, semilla: semillas[1], cantidad: 0, valor: 50, plantaSrc: "/assets/Zanahoria.png"}
]
export const objects = [
    {id: 1, objeto: 'Azada', cantidad: 2, vidaUtil: 5, valor: 3000, objSrc: "/assets/Azada.png"},
    {id: 2, objeto: 'Pala', cantidad: 1, vidaUtil: 3, valor: 2700, objSrc: "/assets/Pala.png"}
]
export const oro = 0;