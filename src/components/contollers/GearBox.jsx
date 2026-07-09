import { observer } from "mobx-lite";

export const GearBox = observer(({ gear, shiftGear }) => {
  const gears = ["N", "1", "2", "3", "4"];

  return (
    <div className="gearbox-container">
      <p>МКПП</p>
      <div className="gearbox-buttons">
        {gears.map((g) => (
          <button
            key={g}
            className={gear === g ? "active" : ""}
            onClick={() => shiftGear(g)}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
});
