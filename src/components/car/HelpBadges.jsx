import { observer } from "mobx-react-lite";
import collectibleCoinImg from "../../assets/ui/collectible-coin.svg";

export const HelpBadges = observer(({ carStore }) => {
  const coins = carStore.sessionCoins;

  return (
    <div className="help-badges" data-type="help-badges">
      <div
        className="help-coins"
        data-type="help-coins"
        aria-label={`Монеты: ${coins}`}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <img
            key={index}
            src={collectibleCoinImg}
            alt=""
            className={`help-coin${index < coins ? " help-coin--filled" : " help-coin--empty"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
});
