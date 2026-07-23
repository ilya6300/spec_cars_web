import policeBody from "../assets/cars/police/body.png";
import shell_1 from "../assets/cars/police/shell_1.png";
import redBody from "../assets/cars/\other/sport_red_body.png";
import redWhell from "../assets/cars/\other/sport_red_wheel.png";
import blackBody from "../assets/cars/\other/sport_black_body.png";
import blackWhell from "../assets/cars/\other/sport_black_wheel.png";
import car1 from "../assets/cars/\other/car1_body.png";
import car2 from "../assets/cars/\other/car2_body.png";
import car3 from "../assets/cars/\other/car3_body.png";

const Cars = {
  speedMultiplierUI: 0.156,
  speedMultiplier: 6.43,
  cars: [
    {
      id: 0,
      type: "police",
      name: "Полицейский автомобиль",
      urlBody: policeBody,
      urlShell: shell_1,
      maxSpeed: 140,
      speedMultiplier: 6.43,
      acceleration: 400,
      friction: 700,
      fuel: 65000,
    },
  ],
  otherCars: [
    {
      id: 0,
      type: "car",
      name: "Красный гоночный автомобиль",
      urlBody: redBody,
      urlShell: redWhell,
      maxSpeed: 130,
      minSpeed: 105,
      enemy: true,
      speedMultiplier: 6.43,
    },
    {
      id: 1,
      type: "car",
      name: "Чёрный гоночный автомобиль",
      urlBody: blackBody,
      urlShell: blackWhell,
      maxSpeed: 120,
      minSpeed: 105,
      enemy: true,
      speedMultiplier: 6.43,
    },
    // {
    //   id: 2,
    //   type: "car",
    //   name: "Красный автомобиль",
    //   urlBody: redBody,
    //   urlShell: redWhell,
    //   maxSpeed: 58,
    //   minSpeed: 50,
    //   enemy: false,
    //   speedMultiplier: 6.43,
    // },
    // {
    //   id: 3,
    //   type: "car",
    //   name: "Чёрный автомобиль",
    //   urlBody: blackBody,
    //   urlShell: blackWhell,
    //   maxSpeed: 55,
    //   minSpeed: 50,
    //   enemy: false,
    //   speedMultiplier: 6.43,
    // },
    // {
    //   id: 4,
    //   type: "car",
    //   name: "Авто 1",
    //   urlBody: car1,
    //   urlShell: blackWhell,
    //   maxSpeed: 59,
    //   minSpeed: 50,
    //   enemy: false,
    //   speedMultiplier: 6.43,
    // },
    // {
    //   id: 5,
    //   type: "car",
    //   name: "Авто 2",
    //   urlBody: car2,
    //   urlShell: blackWhell,
    //   maxSpeed: 59,
    //   minSpeed: 50,
    //   enemy: false,
    //   speedMultiplier: 6.43,
    // },
    // {
    //   id: 6,
    //   type: "car",
    //   name: "Авто 3",
    //   urlBody: car3,
    //   urlShell: blackWhell,
    //   maxSpeed: 59,
    //   minSpeed: 50,
    //   enemy: false,
    //   speedMultiplier: 6.43,
    // },
  ],
};
export default Cars;
