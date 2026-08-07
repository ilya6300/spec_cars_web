import { observer } from "mobx-react-lite";
import collectibleStarImg from "../../assets/ui/collectible-star.svg";
import { objectConfigByType } from "../../state/objects";
import "../../style/star-fly.css";

export const CollectibleStarLayer = observer(({ mapStore }) => {
  const star = mapStore.activeObjects?.find(
    (obj) => obj.typeId === "collectible_star",
  );
  if (!star) return null;

  const config = objectConfigByType.collectible_star;
  const screenX = star.worldX - mapStore.offsetX;

  return (
    <div
      className="collectible-star-layer"
      data-type="collectible-star-layer"
      aria-hidden="true"
    >
      <img
        src={collectibleStarImg}
        alt=""
        className="collectible-star"
        data-type="collectible_star"
        data-uid={star.uid}
        style={{
          left: `${screenX}px`,
          width: config?.width ?? 48,
          height: config?.height ?? 48,
        }}
      />
    </div>
  );
});
