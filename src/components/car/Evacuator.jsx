import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarModel } from "./CarModel";

export const Evacuator = observer(
  ({
    evacuatorData,
    positionX,
    wheelRotation,
    loadedCarStore,
    carOnPlatform,
  }) => {
    const [liftSettled, setLiftSettled] = useState(false);

    useEffect(() => {
      if (!carOnPlatform) {
        setLiftSettled(false);
        return undefined;
      }

      setLiftSettled(false);
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLiftSettled(true);
        });
      });

      return () => cancelAnimationFrame(frameId);
    }, [carOnPlatform, loadedCarStore?.urlBody]);

    if (!evacuatorData) return null;

    return (
      <div
        className="evacuator_conteiner"
        data-type="evacuator"
        style={{ left: `${positionX}px` }}
      >
        <img
          src={evacuatorData.urlBody}
          className="evacuator_body"
          alt="Эвакуатор"
          draggable={false}
        />
        <img
          src={evacuatorData.urlShell}
          className="evacuator_wheel_left"
          alt=""
          draggable={false}
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        />
        <img
          src={evacuatorData.urlShell}
          className="evacuator_wheel_right"
          alt=""
          draggable={false}
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        />
        {loadedCarStore && carOnPlatform && (
          <div
            className={`evacuator-loaded-car${
              liftSettled ? " evacuator-loaded-car--settled" : ""
            }`}
            data-type="evacuator-loaded-car"
          >
            <CarModel carStore={loadedCarStore} variant="traffic" nested />
          </div>
        )}
      </div>
    );
  },
);
