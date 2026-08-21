import { observer } from "mobx-react-lite";
import React from "react";
import {
  getEffectiveLayoutTokens,
  layoutTokensToCssVars,
  PLAYER_LAYOUT_TOKENS,
} from "../../state/cars";

/**
 * @param {"player" | "traffic"} variant — спрайт и геометрия (кузов, колёса)
 * @param {boolean} nested — внутри обёртки (.quest-car-other / .quest-car), без абсолютного позиционирования
 */
export const CarModel = observer(
  ({
    carStore,
    variant = "traffic",
    nested = false,
    showHeadlights = false,
    layoutTokens = null,
  }) => {
    const containerClass = [
      "car_container",
      `car_container--${variant}`,
      nested ? "car_container--nested" : "car_container--standalone",
      showHeadlights ? "car_container--headlights" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const resolvedPlayerTokens =
      variant === "player"
        ? getEffectiveLayoutTokens(
            layoutTokens ?? carStore?.layoutTokens ?? PLAYER_LAYOUT_TOKENS,
          )
        : null;

    const playerStyle = resolvedPlayerTokens
      ? layoutTokensToCssVars(resolvedPlayerTokens)
      : undefined;

    return (
      <div className={containerClass} style={playerStyle}>
        {showHeadlights && (
          <div className="car-headlight-beam" aria-hidden="true" />
        )}
        <div className={carStore.sirena ? "sirena-car-on" : null}></div>
        <img src={carStore.urlBody} alt="Кузов" className="car-body" />
        <img
          src={carStore.urlShell}
          alt="Колесо"
          className="left-shell"
          style={{ transform: `rotate(${carStore.wheelRotation}deg)` }}
        />
        <img
          src={carStore.urlShell}
          alt="Колесо"
          className="right-shell"
          style={{ transform: `rotate(${carStore.wheelRotation}deg)` }}
        />
      </div>
    );
  },
);
