import policeBody from "../assets/cars/police/body.png";
import shell_1 from "../assets/cars/police/shell_1.png";
import redBody from "../assets/cars/\other/sport_red_body.png";
import redWhell from "../assets/cars/\other/sport_red_wheel.png";
import blackBody from "../assets/cars/\other/sport_black_body.png";
import blackWhell from "../assets/cars/\other/sport_black_wheel.png";

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
  otherCars: [
    {
      id: 0,
      type: "car",
      name: "Красный гоночный автомобиль",
      urlBody: redBody, // изображение кузова кузова
      urlShell: redWhell, // изображение колеса
      maxSpeed: 890,
      mштSpeed: 700,
      enemy: true,
    },
    {
      id: 1,
      type: "car",
      name: "Чёрный гоночный автомобиль",
      urlBody: blackBody, // изображение кузова кузова
      urlShell: blackWhell, // изображение колеса
      maxSpeed: 800,
      mштSpeed: 650,
      enemy: true,
    },
    {
      id: 2,
      type: "car",
      name: "Красный автомобиль",
      urlBody: redBody, // изображение кузова кузова
      urlShell: redWhell, // изображение колеса
      maxSpeed: 400,
      mштSpeed: 300,
      enemy: true,
    },
    {
      id: 3,
      type: "car",
      name: "Чёрный автомобиль",
      urlBody: blackBody, // изображение кузова кузова
      urlShell: blackWhell, // изображение колеса
      maxSpeed: 350,
      mштSpeed: 200,
      enemy: true,
    },
  ],
};
export default Cars;
