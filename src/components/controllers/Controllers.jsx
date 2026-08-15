import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { GearBox } from "./GearBox";
import { mapKeyCodeToGear, shiftGearUp } from "./keyboardControls";
import gasPedal from "../../assets/objects/gas_pedal.png";
import keyActiveImg from "../../assets/objects/key_active.png";
import keyDeactiveImg from "../../assets/objects/key_deactive.png";
import sirenaBtn from "../../assets/objects/sirena_btn.png";

function activateControl(action) {
  return (event) => {
    event.preventDefault();
    action();
  };
}

export const Controllers = observer(
  ({ activeCarStore, controlsBlocked = false, onEmptyGasPress }) => {
  const [ignitionFlash, setIgnitionFlash] = useState(null);
  const prevIgnitionRef = useRef(activeCarStore.isIgnitionOn);

  useEffect(() => {
    if (prevIgnitionRef.current !== activeCarStore.isIgnitionOn) {
      setIgnitionFlash(
        activeCarStore.isIgnitionOn ? "ignition-key--flash-on" : "ignition-key--flash-off",
      );
      prevIgnitionRef.current = activeCarStore.isIgnitionOn;
      const timer = setTimeout(() => setIgnitionFlash(null), 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeCarStore.isIgnitionOn]);

  useEffect(() => {
    const releaseGasIfPressed = () => {
      if (activeCarStore.isGasPressed) {
        activeCarStore.releaseGas();
      }
    };

    window.addEventListener("pointerup", releaseGasIfPressed);
    window.addEventListener("pointercancel", releaseGasIfPressed);
    window.addEventListener("blur", releaseGasIfPressed);

    return () => {
      window.removeEventListener("pointerup", releaseGasIfPressed);
      window.removeEventListener("pointercancel", releaseGasIfPressed);
      window.removeEventListener("blur", releaseGasIfPressed);
    };
  }, [activeCarStore]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (controlsBlocked) return;

      const { code, repeat } = event;

      if (code === "Space") {
        event.preventDefault();
        if (activeCarStore.fuel <= 0) {
          if (activeCarStore.isIgnitionOn && onEmptyGasPress) {
            onEmptyGasPress();
          }
          return;
        }
        activeCarStore.pressGas();
        return;
      }

      if (repeat) return;

      const gear = mapKeyCodeToGear(code);
      if (gear) {
        activeCarStore.shiftGear(gear);
        return;
      }

      switch (code) {
        case "ControlLeft":
          activeCarStore.toggleIgnition();
          break;
        case "ShiftLeft":
        case "ShiftRight":
          activeCarStore.shiftGear(shiftGearUp(activeCarStore.gear));
          break;
        case "KeyC":
          activeCarStore.toggleSirena();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!controlsBlocked) {
          activeCarStore.releaseGas();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeCarStore, controlsBlocked, onEmptyGasPress]);

  const ignitionClass = [
    "ignition-key",
    ignitionFlash,
  ]
    .filter(Boolean)
    .join(" ");

  const handlePressGas = () => {
    if (controlsBlocked) return;
    if (activeCarStore.fuel <= 0) {
      if (activeCarStore.isIgnitionOn && onEmptyGasPress) {
        onEmptyGasPress();
      }
      return;
    }
    activeCarStore.pressGas();
  };

  const handleReleaseGas = () => {
    if (controlsBlocked) return;
    activeCarStore.releaseGas();
  };

  return (
    <div className="controllers_container">
      <img
        className={ignitionClass}
        data-type="ignition"
        alt="Зажигание"
        src={activeCarStore.isIgnitionOn ? keyActiveImg : keyDeactiveImg}
        onClick={() => activeCarStore.toggleIgnition()}
        onTouchEnd={activateControl(() => activeCarStore.toggleIgnition())}
        onContextMenu={(e) => e.preventDefault()}
      />
      <GearBox
        gear={activeCarStore.gear}
        shiftGear={(g) => activeCarStore.shiftGear(g)}
      />

      <img
        className={`gas_pedal ${activeCarStore.isGasPressed ? "pressed" : ""}`}
        data-type="gas-pedal"
        alt="Педаль газа"
        src={gasPedal}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handlePressGas}
        onMouseUp={handleReleaseGas}
        onMouseLeave={handleReleaseGas}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePressGas();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleReleaseGas();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleReleaseGas();
        }}
      />
      <img
        className={
          activeCarStore.sirena ? "ignition-sirena-on" : "ignition-sirena"
        }
        data-type="siren"
        alt="Сирена"
        src={sirenaBtn}
        onClick={() => activeCarStore.toggleSirena()}
        onTouchEnd={activateControl(() => activeCarStore.toggleSirena())}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
},
);
