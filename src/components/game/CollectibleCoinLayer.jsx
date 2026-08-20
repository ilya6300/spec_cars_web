import { observer } from "mobx-react-lite";
import collectibleCoinImg from "../../assets/ui/collectible-coin.svg";
import { objectConfigByType } from "../../state/objects";
import "../../style/coin-fly.css";

export const CollectibleCoinLayer = observer(({ mapStore }) => {
  const coin = mapStore.activeObjects?.find(
    (obj) => obj.typeId === "collectible_coin",
  );
  if (!coin) return null;

  const config = objectConfigByType.collectible_coin;
  const screenX = coin.worldX - mapStore.offsetX;

  return (
    <div
      className="collectible-coin-layer"
      data-type="collectible-coin-layer"
      aria-hidden="true"
    >
      <img
        src={collectibleCoinImg}
        alt=""
        className="collectible-coin"
        data-type="collectible_coin"
        data-uid={coin.uid}
        style={{
          left: `${screenX}px`,
          width: config?.width ?? 48,
          height: config?.height ?? 48,
        }}
      />
    </div>
  );
});
