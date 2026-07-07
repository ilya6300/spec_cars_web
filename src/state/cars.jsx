import policeBody from "../assets/cars/police/body.png";
import shell_1 from "../assets/cars/police/shell_1.png";

const Cars = {
  cars: [
    {
      id: 0,
      type: "police",
      name: "Полицейский автомобиль",
      urlBody: policeBody, // изображение кузова кузова
      urlShell: shell_1, // изображение колеса
      maxSpeed: 900, // Скорость в коде
      acceleration: 400, // Разгон
      friction: 700, // Торможение
      fuel: 65000, // Топливо
      speed: "120км/ч",
      startSpeed: "3 сек",
    },
  ],
};
export default Cars;
