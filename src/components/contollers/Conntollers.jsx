import { observer } from "mobx-lite";
import React from "react";
import { GearBox } from "./GearBox";
import gasPedal from "../../assets/objects/gas_pedal.png";
import keyActiveImg from "../../assets/objects/key_active.png";
import keyDeactiveImg from "../../assets/objects/key_deactive.png";
import sirenaBtn from "../../assets/objects/sirena_btn.png";

export const Conntollers = observer(({ activeCarStore }) => {
  return (
    <div className="controllers_container">
      <img
        className="ignition-key"
        alt="Зажигание"
        src={activeCarStore.isIgnitionOn ? keyActiveImg : keyDeactiveImg}
        onClick={() => activeCarStore.toggleIgnition()}
        onContextMenu={(e) => e.preventDefault()}
      />
      <GearBox
        gear={activeCarStore.gear}
        shiftGear={(g) => activeCarStore.shiftGear(g)}
      />

      <img
        // Добавляем динамический класс pressed, если педаль зажата
        className={`gas_pedal ${activeCarStore.isGasPressed ? "pressed" : ""}`}
        alt="Педаль газа"
        src={gasPedal}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={() => activeCarStore.pressGas()}
        onMouseUp={() => activeCarStore.releaseGas()}
        onMouseLeave={() => activeCarStore.releaseGas()} // Чтобы педаль отжималась, если мышка ушла
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
        alt="Сирена"
        src={sirenaBtn}
        onClick={() => activeCarStore.toggleSirena()}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});
