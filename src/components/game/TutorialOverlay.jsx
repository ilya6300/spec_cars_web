import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import fingerPointerImg from "../../assets/ui/tutorial_finger_pointer.png";

const STEP_SELECTORS = {
  ignition: '[data-type="ignition"]',
  "gear-2": '[data-type="gear-2"]',
  "gas-pedal": '[data-type="gas-pedal"]',
  siren: '[data-type="siren"]',
  "gear-4": '[data-type="gear-4"]',
  "gas-station": '[data-type="gas_station"]',
  "pedestrian-human": '[data-type="quest-crossing-human"]',
};

const WORLD_STEPS = new Set([
  "gas-station",
  "roadside-bandit",
  "pedestrian-human",
]);

function getFingerPosition(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + rect.width * 0.55,
    top: rect.top - rect.height * 0.15,
  };
}

export const TutorialOverlay = observer(({ tutorialStore }) => {
  const step = tutorialStore.highlightTarget;
  const [fingerPos, setFingerPos] = useState(null);

  useEffect(() => {
    if (!step) {
      setFingerPos(null);
      return undefined;
    }

    const selector =
      step === "roadside-bandit"
        ? tutorialStore.banditTargetSelector
        : STEP_SELECTORS[step];

    if (!selector) {
      setFingerPos(null);
      return undefined;
    }

    const updatePosition = () => {
      const pos = getFingerPosition(selector);
      setFingerPos((prev) => {
        if (!pos) return null;
        if (
          prev &&
          Math.abs(prev.left - pos.left) < 1 &&
          Math.abs(prev.top - pos.top) < 1
        ) {
          return prev;
        }
        return pos;
      });
    };

    if (WORLD_STEPS.has(step)) {
      let frameId;
      const loop = () => {
        updatePosition();
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
      window.addEventListener("resize", updatePosition);

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", updatePosition);
        setFingerPos(null);
      };
    }

    const frameId = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      setFingerPos(null);
    };
  }, [step, tutorialStore.banditTargetSelector]);

  if (!step || !fingerPos) return null;

  return (
    <>
      <div
        className="tutorial-overlay"
        data-type="tutorial-overlay"
        data-tutorial-step={step}
        aria-hidden="true"
      />
      <img
        src={fingerPointerImg}
        alt=""
        className="tutorial-finger"
        data-type="tutorial-finger"
        data-tutorial-step={step}
        style={{
          left: `${fingerPos.left}px`,
          top: `${fingerPos.top}px`,
        }}
      />
    </>
  );
});
