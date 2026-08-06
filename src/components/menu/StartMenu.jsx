import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import { GlobalStarsDisplay } from "../ui/GlobalStarsDisplay";
import { GAME_MODES } from "../../state/modeScoring";
import menuBackground from "../../assets/background/background_police_day_1.png";
import modeFreeIcon from "../../assets/menu/mode-free.png";
import modeTimedIcon from "../../assets/menu/mode-timed.png";
import modeChaseIcon from "../../assets/menu/mode-chase.png";

const MODES = [
  {
    id: GAME_MODES.FREE,
    dataType: "mode-free",
    title: "Свободная езда",
    icon: modeFreeIcon,
  },
  {
    id: GAME_MODES.TIMED,
    dataType: "mode-timed",
    title: "На время",
    icon: modeTimedIcon,
  },
  {
    id: GAME_MODES.CHASE,
    dataType: "mode-chase",
    title: "Погоня",
    icon: modeChaseIcon,
  },
];

export const StartMenu = observer(() => (
  <div className="start-menu" data-type="start-menu">
    <div
      className="start-menu__bg"
      style={{ backgroundImage: `url(${menuBackground})` }}
      aria-hidden="true"
    />
    <GlobalStarsDisplay className="start-menu__stars" />
    <div className="start-menu__content">
      <header className="start-menu__header">
        <h1 className="start-menu__title">Машины специального назначения</h1>
      </header>
      <div className="start-menu__modes">
        {MODES.map(({ id, dataType, title, icon }) => (
          <button
            key={id}
            type="button"
            className="mode-card__frame"
            data-type={dataType}
            onClick={() => appStore.startGame(id)}
          >
            {/* <span className="mode-card__frame"> */}
            <img src={icon} alt="" className="mode-card__icon" />
            {/* </span> */}
            <span className="mode-card__label">{title}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
));
