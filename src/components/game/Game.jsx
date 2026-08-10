import React, { useEffect, useRef, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Car } from "../car/Car";
import { Maps } from "../map/Maps";
import { Controllers } from "../controllers/Controllers";
import { PoliceQuestModal } from "./PoliceQuestModal";
import { PedestrianCrossingLayer } from "./PedestrianCrossingLayer";
import { QuestArrestModal } from "./QuestArrestModal";
import { QuestCar } from "./QuestCar";
import { SpeedDisplay } from "./SpeedDisplay";
import FullscreenButton from "./FullscreenButton";
import BackToMenuButton from "./BackToMenuButton";
import { TutorialOverlay } from "./TutorialOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import { ModeTimer, ModeChaseProgress } from "./ModeTimer";
import { ModeResultModal } from "./ModeResultModal";
import { RefuelModal } from "./RefuelModal";
import { GlobalStarsDisplay } from "../ui/GlobalStarsDisplay";
import { StarFlyOverlay } from "./StarFlyOverlay";
import { CollectibleStarLayer } from "./CollectibleStarLayer";
import { useGameLoop } from "../../hooks/useGameLoop";
import { createGameStores } from "../../state/gameBootstrap";
import { TutorialStore } from "../../state/tutorialStore";
import { registerFuelSaveOnUnload } from "../../state/persistence";
import modeStore from "../../state/modeStore";
import atmosphereStore from "../../state/atmosphereStore";
import recordsStore from "../../state/recordsStore";
import starsStore from "../../state/starsStore";
import stateApp from "../../state/state_app";
import { calculateSessionScore } from "../../state/modeScoring";

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
  const gameViewportRef = useRef(null);
  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);

  useEffect(() => {
    const updateViewportWidth = () => {
      const measured =
        gameViewportRef.current?.clientWidth ?? window.innerWidth;
      viewportWidthRef.current = measured;
    };
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  useGameLoop(
    activeCarStore,
    activeMapStore,
    viewportWidthRef,
    gameMode === "free" ? tutorialStore : null,
    modeStore,
  );

  useEffect(() => {
    const sessionStart = performance.now();
    const sessionStartStars = starsStore.totalStars;
    const chaseTimeRef = { current: null };
    let frameId;
    let running = true;

    const trackSession = () => {
      if (!running) return;

      const now = performance.now();
      const durationSec = (now - sessionStart) / 1000;
      const km =
        activeMapStore.offsetX / stateApp.distanceMetersFactor / 1000;
      const starsEarned = starsStore.totalStars - sessionStartStars;
      const score = calculateSessionScore(
        activeCarStore.helpCounts,
        gameMode,
      );

      if (
        gameMode === "chase" &&
        chaseTimeRef.current === null &&
        activeCarStore.helpCounts.enemyChase >= 3
      ) {
        chaseTimeRef.current = durationSec;
      }

      recordsStore.setLiveSession({
        mode: gameMode,
        durationSec,
        km,
        starsEarned,
        score,
        chaseTimeSec: chaseTimeRef.current,
      });

      frameId = requestAnimationFrame(trackSession);
    };

    frameId = requestAnimationFrame(trackSession);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      recordsStore.clearLiveSession();
    };
  }, [activeCarStore, activeMapStore, gameMode]);

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
    if (activeCarStore.fuel <= 0 && activeCarStore.isIgnitionOn) {
      setIsRefuelModalOpen(true);
      activeCarStore.releaseGas();
    }
  }, [activeCarStore.fuel, activeCarStore.isIgnitionOn, activeCarStore]);

  useEffect(() => {
    if (!activeCarStore.isIgnitionOn) {
      setIsRefuelModalOpen(false);
    }
  }, [activeCarStore.isIgnitionOn]);

  const handleEmptyGasPress = useCallback(() => {
    if (activeCarStore.isIgnitionOn) {
      setIsRefuelModalOpen(true);
    }
  }, [activeCarStore.isIgnitionOn]);

  const handleRefuelWatchVideo = useCallback(() => {
    activeCarStore.refuel(5000);
    setIsRefuelModalOpen(false);
  }, [activeCarStore]);

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
      ref={gameViewportRef}
      className={`game-viewport${atmosphereStore.isNight ? " game-viewport--night" : ""}`}
    >
      {!modeStore.isComplete && <BackToMenuButton />}
      {/* <FullscreenButton /> */}
      <GlobalStarsDisplay className="game-global-stars" />
      {gameMode === "free" && (
        <StarFlyOverlay mapStore={activeMapStore} />
      )}
      <ModeTimer carStore={activeCarStore} />
      <ModeChaseProgress carStore={activeCarStore} />
      <Maps
        map={activeMapStore}
        carStore={activeCarStore}
        onClickObject={handleObjectClick}
      />
      <AtmosphereOverlay />
      {gameMode === "free" && (
        <CollectibleStarLayer mapStore={activeMapStore} />
      )}
      <Car
        carStore={activeCarStore}
        showHeadlights={showPlayerHeadlights}
      />
      <Controllers
        activeCarStore={activeCarStore}
        controlsBlocked={isRefuelModalOpen}
        onEmptyGasPress={handleEmptyGasPress}
      />

      {gameMode === "free" && <TutorialOverlay tutorialStore={tutorialStore} />}

      <PoliceQuestModal mapStore={activeMapStore} carStore={activeCarStore} />

      {gameMode === "free" && (
        <PedestrianCrossingLayer
          mapStore={activeMapStore}
          carStore={activeCarStore}
        />
      )}

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
            ╨С╨╗╨╛╨║╨╕╤А╨╛╨▓╨░╤В╤М
          </button>
        )}

      {isRefuelModalOpen && (
        <RefuelModal
          carStore={activeCarStore}
          onWatchVideo={handleRefuelWatchVideo}
        />
      )}

      <ModeResultModal carStore={activeCarStore} />
    </div>
  );
});
