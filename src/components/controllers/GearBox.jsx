// Старая версия
// import { observer } from "mobx-lite";

// export const GearBox = observer(({ gear, shiftGear }) => {
//   const gears = ["N", "1", "2", "3", "4"];

//   return (
//     <div className="gearbox-buttons">
//       <p>МКПП</p>
//       {gears
//         .filter((g) => g === "N")
//         .map((g) => (
//           <button
//             key={g}
//             className={gear === g ? "active" : ""}
//             onClick={() => shiftGear(g)}
//           >
//             {g}
//           </button>
//         ))}
//       <div className="gearbox-buttons-container">
//         {gears
//           .filter((g) => g !== "N")
//           .map((g) => (
//             <button
//               key={g}
//               className={gear === g ? "active" : ""}
//               onClick={() => shiftGear(g)}
//             >
//               {g}
//             </button>
//           ))}
//       </div>
//     </div>
//   );
// });

// Версия гугла
import { observer } from "mobx-lite";

export const GearBox = observer(({ gear, shiftGear }) => {
  const gears = ["N", "1", "2", "3", "4"];

  return (
    <>
      <div className="gearbox-buttons">
        <span className="gearbox-title">МКПП</span>
        {gears
          .filter((g) => g === "N")
          .map((g) => (
            <button
              key={g}
              className={`gear-btn neutral ${gear === g ? "active" : ""}`}
              onClick={() => shiftGear(g)}
            >
              {g}
            </button>
          ))}
      </div>
      <div className="gearbox-buttons-container">
        {gears
          .filter((g) => g !== "N")
          .map((g) => (
            <button
              key={g}
              data-type={`gear-${g}`}
              className={`gear-btn ${gear === g ? "active" : ""}`}
              onClick={() => shiftGear(g)}
            >
              {g}
            </button>
          ))}
      </div>
    </>
  );
});
