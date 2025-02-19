export const semillas = [
    { id: 1, planta: "Girasol", semillas: 3, time: 6000, semillaSrc: "/assets/GirasolSemilla.png", valor: 10},
    { id: 2, planta: "Zanahoria", semillas: 0, time: 12000, semillaSrc: "/assets/ZanahoriaSemilla.png", valor: 50}
]
export const frutos = [
    { id: 1, semilla: semillas[0], cantidad: 0, valor: 20, plantaSrc: "/assets/Girasol.webp"},
    { id: 2, semilla: semillas[1], cantidad: 0, valor: 100, plantaSrc: "/assets/Zanahoria.webp"}
]
export const objects = [
    {id: 1, objeto: 'Azada', cantidad: 0, vidaUtil: 5, valor: 3000, objSrc: "/assets/Azada.webp"},
    {id: 2, objeto: 'Pala', cantidad: 0, vidaUtil: 3, valor: 2700, objSrc: "/assets/Pala.webp"}
]
export const oro = 0;