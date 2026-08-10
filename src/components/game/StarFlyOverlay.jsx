import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import collectibleStarImg from "../../assets/ui/collectible-star.svg";
import "../../style/star-fly.css";

const FLY_DURATION_SEC = 0.6;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function getGlobalStarsTarget() {
  const el = document.querySelector('[data-type="global-stars"]');
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

const StarFlyItem = ({ fly, mapStore }) => {
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

      const target = getGlobalStarsTarget();
      const el = ref.current;
      if (!target || !el) {
        if (progressRef.current >= 1) {
          completedRef.current = true;
          mapStore.completeStarFly(fly.id);
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
        mapStore.completeStarFly(fly.id);
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
      src={collectibleStarImg}
      alt=""
      className="star-fly__sprite"
      aria-hidden="true"
      style={{
        transform: `translate(${fly.startX}px, ${fly.startY}px) translate(-50%, -50%)`,
      }}
    />
  );
};

export const StarFlyOverlay = observer(({ mapStore }) => {
  const starFlies = mapStore.starFlies ?? [];
  if (!starFlies.length) return null;

  return (
    <div
      className="star-fly-overlay"
      data-type="star-fly-overlay"
      aria-hidden="true"
    >
      {starFlies.map((fly) => (
        <StarFlyItem key={fly.id} fly={fly} mapStore={mapStore} />
      ))}
    </div>
  );
});
