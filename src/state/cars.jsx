import policeBody from "../assets/cars/police/body.png";
import shell_1 from "../assets/cars/police/shell_1.png";
import whellNew1 from "../assets/cars/whell/whell_new_1.png";
import whellNew2 from "../assets/cars/whell/whell_new_2.png";
import whellNew3 from "../assets/cars/whell/whell_new_3.png";
import whellNew4 from "../assets/cars/whell/whell_new_4.png";
import whellNew5 from "../assets/cars/whell/whell_new_5.png";
import whellNew6 from "../assets/cars/whell/whell_new_6.png";
import whellNew7 from "../assets/cars/whell/whell_new_7.png";
import whellNew8 from "../assets/cars/whell/whell_new_8.png";
import whellNew9 from "../assets/cars/whell/whell_new_9.png";
import whellNew10 from "../assets/cars/whell/whell_new_10.png";
import whellNew11 from "../assets/cars/whell/whell_new_11.png";
import whellNew12 from "../assets/cars/whell/whell_new_12.png";
import whellNew13 from "../assets/cars/whell/whell_new_13.png";
import whellNew14 from "../assets/cars/whell/whell_new_14.png";
import whellNew15 from "../assets/cars/whell/whell_new_15.png";
import whellNew16 from "../assets/cars/whell/whell_new_16.png";
import redBody from "../assets/cars/\other/sport_red_body.png";
import redWhell from "../assets/cars/\other/sport_red_wheel.png";
import blackBody from "../assets/cars/\other/sport_black_body.png";
import blackWhell from "../assets/cars/\other/sport_black_wheel.png";
import car1 from "../assets/cars/\other/car1_body.png";
import car2 from "../assets/cars/\other/car2_body.png";
import car3 from "../assets/cars/\other/car3_body.png";
import evacuatorBody from "../assets/cars/other/evacuator_v1.png";
import evacuatorWhell from "../assets/cars/other/evacuator_wheel.png";
import ratio from "../assets/objects/two_way_radio.png";

export { ratio };

export const PLAYER_LAYOUT_TOKENS = {
  width: "250px",
  wheelOffset: "11%",
  bodyLift: "-1%",
  wheelBottom: "-11%",
  wheelSize: "20.5%",
  wheelLeft: "9%",
  wheelRight: "69%",
};

export const MOBILE_PLAYER_LAYOUT_WIDTH = "220px";

const Cars = {
  speedMultiplierUI: 0.156,
  speedMultiplier: 6.43,
  wheels: [
    {
      id: "shell_1",
      name: "Стандарт",
      src: shell_1,
      active: true,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_1",
      name: "Колёса 1",
      src: whellNew1,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_2",
      name: "Колёса 2",
      src: whellNew2,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_3",
      name: "Колёса 3",
      src: whellNew3,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_4",
      name: "Колёса 4",
      src: whellNew4,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_5",
      name: "Колёса 5",
      src: whellNew5,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_6",
      name: "Колёса 6",
      src: whellNew6,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_7",
      name: "Колёса 7",
      src: whellNew7,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_8",
      name: "Колёса 8",
      src: whellNew8,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_9",
      name: "Колёса 9",
      src: whellNew9,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_10",
      name: "Колёса 10",
      src: whellNew10,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_11",
      name: "Колёса 11",
      src: whellNew11,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_12",
      name: "Колёса 12",
      src: whellNew12,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_13",
      name: "Колёса 13",
      src: whellNew13,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_14",
      name: "Колёса 14",
      src: whellNew14,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_15",
      name: "Колёса 15",
      src: whellNew15,
      active: false,
      open: true,
      price: 5,
    },
    {
      id: "whell_new_16",
      name: "Колёса 16",
      src: whellNew16,
      active: false,
      open: true,
      price: 5,
    },
  ],
  cars: [
    {
      id: "police-0",
      service: "police",
      type: "police",
      name: "Полицейский автомобиль",
      urlBody: policeBody,
      active: true,
      open: true,
      price: 0,
      layoutTokens: { ...PLAYER_LAYOUT_TOKENS },
      skins: [
        {
          id: "default",
          urlBody: policeBody,
          active: true,
          open: true,
          price: 0,
        },
      ],
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
    {
      id: 2,
      type: "car",
      name: "Красный автомобиль",
      urlBody: redBody,
      urlShell: redWhell,
      maxSpeed: 58,
      minSpeed: 50,
      enemy: false,
      speedMultiplier: 6.43,
    },
    {
      id: 3,
      type: "car",
      name: "Чёрный автомобиль",
      urlBody: blackBody,
      urlShell: blackWhell,
      maxSpeed: 55,
      minSpeed: 50,
      enemy: false,
      speedMultiplier: 6.43,
    },
    {
      id: 4,
      type: "car",
      name: "Авто 1",
      urlBody: car1,
      urlShell: blackWhell,
      maxSpeed: 59,
      minSpeed: 50,
      enemy: false,
      speedMultiplier: 6.43,
    },
    {
      id: 5,
      type: "car",
      name: "Авто 2",
      urlBody: car2,
      urlShell: blackWhell,
      maxSpeed: 59,
      minSpeed: 50,
      enemy: false,
      speedMultiplier: 6.43,
    },
    {
      id: 6,
      type: "car",
      name: "Авто 3",
      urlBody: car3,
      urlShell: blackWhell,
      maxSpeed: 59,
      minSpeed: 50,
      enemy: false,
      speedMultiplier: 6.43,
    },
  ],
  evacuator: {
    type: "evacuator",
    name: "Эвакуатор",
    urlBody: evacuatorBody,
    urlShell: evacuatorWhell,
    maxSpeed: 55,
    minSpeed: 45,
    speedMultiplier: 6.43,
  },
};

export function getWheelById(wheelId) {
  return Cars.wheels.find((wheel) => wheel.id === wheelId);
}

export function getSkinById(car, skinId) {
  return car?.skins?.find((skin) => skin.id === skinId);
}

export function getEffectiveLayoutTokens(
  layoutTokens,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1024,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 768,
) {
  const base = layoutTokens ?? PLAYER_LAYOUT_TOKENS;
  const isMobile = viewportHeight <= 600 || viewportWidth <= 900;
  if (!isMobile) {
    return { ...base };
  }
  return { ...base, width: MOBILE_PLAYER_LAYOUT_WIDTH };
}

export function layoutTokensToCssVars(tokens) {
  if (!tokens) return {};
  return {
    "--player-car-width": tokens.width,
    "--player-car-wheel-offset": tokens.wheelOffset,
    "--player-car-body-lift": tokens.bodyLift,
    "--player-car-wheel-bottom": tokens.wheelBottom,
    "--player-car-wheel-size": tokens.wheelSize,
    "--player-car-wheel-left": tokens.wheelLeft,
    "--player-car-wheel-right": tokens.wheelRight,
  };
}

export function getDefaultCar() {
  return Cars.cars[0];
}

export function getCarById(carId) {
  const found = Cars.cars.find(
    (car) => car.id === carId || String(car.id) === String(carId),
  );
  return found ?? getDefaultCar();
}

export function getCarsByService(service) {
  return Cars.cars.filter((car) => car.service === service);
}

export default Cars;
