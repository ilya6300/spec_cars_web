import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Car } from "../car/Car";
import { Maps } from "../map/Maps";
import { Controllers } from "../controllers/Controllers";
import { PoliceQuestModal } from "./PoliceQuestModal";
import { PedestrianCrossingModal } from "./PedestrianCrossingModal";
import { QuestArrestModal } from "./QuestArrestModal";
import { QuestCar } from "./QuestCar";
import { SpeedDisplay } from "./SpeedDisplay";
import FullscreenButton from "./FullscreenButton";
import { TutorialOverlay } from "./TutorialOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import { ModeTimer, ModeChaseProgress } from "./ModeTimer";
import { ModeResultModal } from "./ModeResultModal";
import { GlobalStarsDisplay } from "../ui/GlobalStarsDisplay";
import { useGameLoop } from "../../hooks/useGameLoop";
import { createGameStores } from "../../state/gameBootstrap";
import { TutorialStore } from "../../state/tutorialStore";
import { registerFuelSaveOnUnload } from "../../state/persistence";
import modeStore from "../../state/modeStore";
import atmosphereStore from "../../state/atmosphereStore";

import "../../style/quest_arrest.css";

export const Game = observer(({ carId, mapId, gameMode = "free" }) => {
  const storesRef = useRef(null);
  const tutorialStoreRef = useRef(null);

  if (!storesRef.current) {
    storesRef.current = createGameStores({ carId, mapId, gameMode });
  }
  if (!tutorialStoreRef.current) {
    tutorialStoreRef.current = new TutorialStore();
  }

  const { carStore: activeCarStore, mapStore: activeMapStore } =
    storesRef.current;
  const tutorialStore = tutorialStoreRef.current;
  const viewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => {
      viewportWidthRef.current = window.innerWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useGameLoop(
    activeCarStore,
    activeMapStore,
    viewportWidthRef,
    gameMode === "free" ? tutorialStore : null,
    modeStore,
  );

  useEffect(() => {
    const stores = storesRef.current;
    if (!stores) return undefined;

    stores.carStore.reattach();
    stores.mapStore.startTrafficLightTimer();
    const unregisterFuelSave = registerFuelSaveOnUnload();

    return () => {
      unregisterFuelSave();
      stores.carStore.dispose();
      stores.mapStore.dispose();
    };
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && window.__PLAYWRIGHT__) {
      window.__TEST_STATE__ = {
        activeMapStore,
        activeCarStore,
        get distance() {
          return activeMapStore.offsetX;
        },
      };
    }
  }, [activeMapStore, activeCarStore]);

  const handleObjectClick = (obj, config, mapStore, carStore) => {
    if (obj.longPressTimeout) {
      clearTimeout(obj.longPressTimeout);
      obj.longPressTimeout = null;
    }

    config.onClick?.(obj, mapStore, carStore);
  };

  const visibleQuestCars = activeMapStore.getVisibleQuestCars(
    viewportWidthRef.current,
  );

  const showPlayerHeadlights =
    atmosphereStore.isNight && activeCarStore.isIgnitionOn;

  return (
    <div
      className={`game-viewport${atmosphereStore.isNight ? " game-viewport--night" : ""}`}
    >
      <FullscreenButton />
      <GlobalStarsDisplay className="game-global-stars" />
      <ModeTimer carStore={activeCarStore} />
      <ModeChaseProgress carStore={activeCarStore} />
      <Maps
        map={activeMapStore}
        carStore={activeCarStore}
        onClickObject={handleObjectClick}
      />
      <AtmosphereOverlay />
      <Car
        carStore={activeCarStore}
        showHeadlights={showPlayerHeadlights}
      />
      <Controllers activeCarStore={activeCarStore} />

      {gameMode === "free" && <TutorialOverlay tutorialStore={tutorialStore} />}

      <PoliceQuestModal mapStore={activeMapStore} carStore={activeCarStore} />

      <PedestrianCrossingModal
        mapStore={activeMapStore}
        carStore={activeCarStore}
      />

      {activeMapStore.isQuestArrestActive && (
        <QuestArrestModal mapStore={activeMapStore} carStore={activeCarStore} />
      )}

      {visibleQuestCars.map((questCar) => (
        <QuestCar
          key={questCar.id}
          questCarStore={questCar}
          mapStore={activeMapStore}
          showHeadlights={atmosphereStore.isNight}
        />
      ))}

      {visibleQuestCars.length > 0 && (
        <SpeedDisplay
          currentSpeed={Math.max(
            ...visibleQuestCars.map((car) => car.currentSpeed),
          )}
        />
      )}

      {activeMapStore.questCarForArrest &&
        !activeMapStore.isPedestrianCrossingQuestActive &&
        !activeMapStore.isPoliceQuestActive &&
        !activeMapStore.isQuestArrestActive &&
        !modeStore.isPaused && (
          <button
            className="arrest-button-quest-car-map"
            data-type="arrest-button"
            onClick={() => {
              if (activeMapStore.questCarForArrest) {
                const index = activeMapStore.questCars.indexOf(
                  activeMapStore.questCarForArrest,
                );
                if (index !== -1) {
                  activeCarStore.toggleSirena();
                  activeMapStore.startQuestArrest();
                  activeMapStore.removeQuestCarByIndex(index);
                }
              }
            }}
          >
            Блокировать
          </button>
        )}

      <ModeResultModal carStore={activeCarStore} />
    </div>
  );
});
