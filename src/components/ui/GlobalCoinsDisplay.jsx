import { observer } from "mobx-react-lite";
import coinsStore from "../../state/coinsStore";
import collectibleCoinImg from "../../assets/ui/collectible-coin.svg";

export const GlobalCoinsDisplay = observer(({ className = "" }) => (
  <div
    className={`global-coins ${className}`.trim()}
    data-type="global-coins"
    aria-label={`Всего монет: ${coinsStore.totalCoins}`}
  >
    <img
      src={collectibleCoinImg}
      alt=""
      className="global-coins__icon"
      aria-hidden="true"
    />
    <span
      key={coinsStore.totalCoins}
      className="global-coins__count global-coins__count--bounce"
    >
      {coinsStore.totalCoins}
    </span>
  </div>
));
