export const RATIO_DISPLAY_SEC = 3;
export const DISPATCH_RESPONSE_DELAY_SEC = 1;

export const DISPATCH_REQUEST_MESSAGES = [
  "Диспетчер, я свободный, есть что по близости?",
  "Диспетчер, диспетчер, есть работа?",
  "Диспетчер, есть что рядом?",
  "Диспетчер, готов принять вызов",
  "Диспетчер, есть что интересного?",
];

export const EVACUATION_RATIO_MESSAGE = "Диспетчер, нужен эвакуатор.";
export const DISPATCH_CONFLICT_MESSAGE = "Да, рядом замечен конфликт";
export const DISPATCH_QUIET_MESSAGE =
  "Пока всё тихо, продолжайте потрулирование";
export const DISPATCH_ORIENTATION_ALREADY_MESSAGE =
  "Мы уже выслали ориентировку, следую к цели";

/** Игровые метры (HUD / геймдизайн) */
export const ORIENTATION_MIN_METERS = 80;
export const ORIENTATION_MAX_METERS = 250;

/** world px = meters × distanceMetersFactor (20) — для TASK-065 spawn */
export const ORIENTATION_MIN_WORLD_PX = ORIENTATION_MIN_METERS * 20; // 1600
export const ORIENTATION_MAX_WORLD_PX = ORIENTATION_MAX_METERS * 20; // 5000
