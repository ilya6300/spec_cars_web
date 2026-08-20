import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import collectibleCoinImg from "../../assets/ui/collectible-coin.svg";
import "../../style/coin-fly.css";

const FLY_DURATION_SEC = 0.6;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function getGlobalCoinsTarget() {
  const el = document.querySelector('[data-type="global-coins"]');
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

const CoinFlyItem = ({ fly, mapStore }) => {
  const ref = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    progressRef.current = 0;
    completedRef.current = false;

    const animate = (currentTime) => {
      if (completedRef.current) return;

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      progressRef.current = Math.min(
        progressRef.current + deltaTime / FLY_DURATION_SEC,
        1,
      );

      const target = getGlobalCoinsTarget();
      const el = ref.current;
      if (!target || !el) {
        if (progressRef.current >= 1) {
          completedRef.current = true;
          mapStore.completeCoinFly(fly.id);
        } else {
          requestAnimationFrame(animate);
        }
        return;
      }

      const t = easeOutCubic(progressRef.current);
      const x = fly.startX + (target.x - fly.startX) * t;
      const arcHeight = 80;
      const y =
        fly.startY +
        (target.y - fly.startY) * t -
        arcHeight * Math.sin(Math.PI * t);

      const scale = 1 - t * 0.35;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;

      if (progressRef.current >= 1) {
        completedRef.current = true;
        mapStore.completeCoinFly(fly.id);
        return;
      }

      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [fly.id, fly.startX, fly.startY, mapStore]);

  return (
    <img
      ref={ref}
      src={collectibleCoinImg}
      alt=""
      className="coin-fly__sprite"
      aria-hidden="true"
      style={{
        transform: `translate(${fly.startX}px, ${fly.startY}px) translate(-50%, -50%)`,
      }}
    />
  );
};

export const CoinFlyOverlay = observer(({ mapStore }) => {
  const coinFlies = mapStore.coinFlies ?? [];
  if (!coinFlies.length) return null;

  return (
    <div
      className="coin-fly-overlay"
      data-type="coin-fly-overlay"
      aria-hidden="true"
    >
      {coinFlies.map((fly) => (
        <CoinFlyItem key={fly.id} fly={fly} mapStore={mapStore} />
      ))}
    </div>
  );
});
