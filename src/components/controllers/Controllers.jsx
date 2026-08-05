import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { GearBox } from "./GearBox";
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

export const Controllers = observer(({ activeCarStore }) => {
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

  const ignitionClass = [
    "ignition-key",
    ignitionFlash,
  ]
    .filter(Boolean)
    .join(" ");

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
        onMouseDown={() => activeCarStore.pressGas()}
        onMouseUp={() => activeCarStore.releaseGas()}
        onMouseLeave={() => activeCarStore.releaseGas()}
        onTouchStart={(e) => {
          e.preventDefault();
          activeCarStore.pressGas();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          activeCarStore.releaseGas();
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          activeCarStore.releaseGas();
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
});
