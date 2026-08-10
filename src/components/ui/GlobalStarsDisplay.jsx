import { observer } from "mobx-react-lite";
import starsStore from "../../state/starsStore";

export const GlobalStarsDisplay = observer(({ className = "" }) => (
  <div
    className={`global-stars ${className}`.trim()}
    data-type="global-stars"
    aria-label={`Всего звёзд: ${starsStore.totalStars}`}
  >
    <span className="global-stars__icon" aria-hidden="true">
      ★
    </span>
    <span key={starsStore.totalStars} className="global-stars__count global-stars__count--bounce">
      {starsStore.totalStars}
    </span>
  </div>
));
