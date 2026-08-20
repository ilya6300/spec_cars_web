import React, { useEffect, useRef, useState, useCallback } from "react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { Car } from "../car/Car";
import { Maps } from "../map/Maps";
import { Controllers } from "../controllers/Controllers";
import { PoliceQuestModal } from "./PoliceQuestModal";
import { PedestrianCrossingLayer } from "./PedestrianCrossingLayer";
import { ParkingZoneLayer } from "./ParkingZoneLayer";
import { RoadsideBreakdownLayer } from "./RoadsideBreakdownLayer";
import { Evacuator } from "../car/Evacuator";
import Cars from "../../state/cars";
import { QuestFinishOverlay } from "./QuestFinishOverlay";
import { QuestArrestModal } from "./QuestArrestModal";
import { QuestCar } from "./QuestCar";
import { SpeedDisplay } from "./SpeedDisplay";
import FullscreenButton from "./FullscreenButton";
import BackToMenuButton from "./BackToMenuButton";
import { TutorialOverlay } from "./TutorialOverlay";
import { AtmosphereOverlay } from "./AtmosphereOverlay";
import { RainLayer } from "./RainLayer";
import { ModeTimer, ModeChaseProgress } from "./ModeTimer";
import { ModeResultModal } from "./ModeResultModal";
import { RefuelModal } from "./RefuelModal";
import { QuestCtaButton } from "../ui/QuestCtaButton";
import { CoinFlyOverlay } from "./CoinFlyOverlay";
import Ratio from "../car/Ratio";
import { CollectibleCoinLayer } from "./CollectibleCoinLayer";
import { GlobalCoinsDisplay } from "../ui/GlobalCoinsDisplay";
import { OrientationDistanceHud } from "./OrientationDistanceHud";
import { useGameLoop } from "../../hooks/useGameLoop";
import { createGameStores } from "../../state/gameBootstrap";
import { TutorialStore } from "../../state/tutorialStore";
import { registerFuelSaveOnUnload } from "../../state/persistence";
import modeStore from "../../state/modeStore";
import atmosphereStore from "../../state/atmosphereStore";
import ratioStore from "../../state/ratioStore";
import recordsStore from "../../state/recordsStore";
import coinsStore from "../../state/coinsStore";
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
  const [showFreeModeRatio, setShowFreeModeRatio] = useState(
    gameMode === "free",
  );

  const handleFreeModeRatioDismiss = useCallback(() => {
    setShowFreeModeRatio(false);
  }, []);

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
    const sessionStartCoins = coinsStore.totalCoins;
    const chaseTimeRef = { current: null };
    let frameId;
    let running = true;

    const trackSession = () => {
      if (!running) return;

      const now = performance.now();
      const durationSec = (now - sessionStart) / 1000;
      const km = activeMapStore.offsetX / stateApp.distanceMetersFactor / 1000;
      const coinsEarned = coinsStore.totalCoins - sessionStartCoins;
      const score = calculateSessionScore(activeCarStore.helpCounts, gameMode);

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
        coinsEarned,
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
      ratioStore.dispose();
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
        setAtmosphere: (opts) => atmosphereStore.setAtmosphere(opts),
        stopFreeWeather: () => atmosphereStore.stopFreeWeather(),
        getAtmosphere: () => ({
          timeOfDay: atmosphereStore.timeOfDay,
          weather: atmosphereStore.weather,
        }),
        reinitFreeWeather: () => atmosphereStore.reinitFreeWeather(),
        advanceFreeWeather: (sec) =>
          atmosphereStore.tick(sec, modeStore.gameMode),
        setFreeWeatherRandomSequence: (values) =>
          atmosphereStore.setFreeWeatherRandomSequence(values),
        setFreeRainDurationSec: (sec) =>
          atmosphereStore.setTestRainDurationSec(sec),
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

  const parkingEvacuation = activeMapStore.parkingEvacuation;
  const evacuatorVisible =
    parkingEvacuation.phase === "approaching" ||
    parkingEvacuation.phase === "loading" ||
    parkingEvacuation.phase === "loaded" ||
    parkingEvacuation.phase === "departing";

  const visibleQuestCars = activeMapStore.getVisibleQuestCars(
    viewportWidthRef.current,
  );

  const showPlayerHeadlights =
    atmosphereStore.isNight && activeCarStore.isIgnitionOn;

  return (
    <div
      ref={gameViewportRef}
      className={`game-viewport${atmosphereStore.isNight ? " game-viewport--night" : ""}${atmosphereStore.isRainy ? " game-viewport--rain" : ""}`}
    >
      {!modeStore.isComplete && <BackToMenuButton />}
      {/* <FullscreenButton /> */}
      {showFreeModeRatio && (
        <Ratio
          message="Пшшш... Начинайте потрулирование"
          onDismiss={handleFreeModeRatioDismiss}
        />
      )}
      {ratioStore.message && (
        <Ratio
          key={ratioStore.sessionId}
          message={ratioStore.message}
          onDismiss={() => ratioStore.onRatioDismiss()}
          playSound={ratioStore.playSoundOnShow}
        />
      )}
      {gameMode === "free" && <CoinFlyOverlay mapStore={activeMapStore} />}
      {gameMode === "free" && (
        <div className="game-coins-hud">
          <GlobalCoinsDisplay />
        </div>
      )}
      <ModeTimer carStore={activeCarStore} />
      <ModeChaseProgress carStore={activeCarStore} />
      {(gameMode === "free" || gameMode === "timed") && (
        <OrientationDistanceHud mapStore={activeMapStore} />
      )}
      <Maps
        map={activeMapStore}
        carStore={activeCarStore}
        onClickObject={handleObjectClick}
      />
      <AtmosphereOverlay />
      {gameMode === "free" && (
        <CollectibleCoinLayer mapStore={activeMapStore} />
      )}
      {visibleQuestCars.map((questCar) => (
        <QuestCar
          key={questCar.uid}
          questCarStore={questCar}
          mapStore={activeMapStore}
          showHeadlights={atmosphereStore.isNight}
        />
      ))}
      <Car carStore={activeCarStore} showHeadlights={showPlayerHeadlights} />
      <RainLayer />
      <Controllers
        activeCarStore={activeCarStore}
        mapStore={activeMapStore}
        ratioStore={ratioStore}
        tutorialStore={gameMode === "free" ? tutorialStore : null}
        gameMode={gameMode}
        controlsBlocked={
          isRefuelModalOpen ||
          modeStore.isComplete ||
          activeMapStore.isPoliceQuestActive ||
          activeMapStore.isQuestArrestActive ||
          activeMapStore.isEvacuationInProgress()
        }
        onEmptyGasPress={handleEmptyGasPress}
      />

      {gameMode === "free" &&
        activeMapStore.isPedestrianCrossingQuestActive &&
        !activeMapStore.isPoliceQuestActive &&
        !activeMapStore.isQuestArrestActive &&
        activeMapStore.pedestrianCrossingTargetObject?.questCrossing
          ?.showFinishOverlay && (
          <QuestFinishOverlay
            variant="pedestrian"
            onDismiss={() => {
              activeMapStore.finishPedestrianCrossingQuest();
              runInAction(() => {
                activeCarStore.addHelp("pedestrianFine");
              });
            }}
          />
        )}

      {gameMode === "free" && <TutorialOverlay tutorialStore={tutorialStore} />}

      <PoliceQuestModal mapStore={activeMapStore} carStore={activeCarStore} />

      {gameMode === "free" && (
        <PedestrianCrossingLayer
          mapStore={activeMapStore}
          carStore={activeCarStore}
        />
      )}

      {(gameMode === "free" || gameMode === "timed") && (
        <ParkingZoneLayer
          mapStore={activeMapStore}
          tutorialStore={gameMode === "free" ? tutorialStore : null}
        />
      )}

      {(gameMode === "free" || gameMode === "timed") && (
        <RoadsideBreakdownLayer
          mapStore={activeMapStore}
          tutorialStore={gameMode === "free" ? tutorialStore : null}
        />
      )}

      {evacuatorVisible && (
        <Evacuator
          evacuatorData={Cars.evacuator}
          positionX={activeMapStore.parkingEvacuation.positionX}
          wheelRotation={activeMapStore.parkingEvacuation.wheelRotation}
          loadedCarStore={activeMapStore.getParkingEvacuationLoadedCar()}
          carOnPlatform={activeMapStore.parkingEvacuation.carOnPlatform}
        />
      )}

      {activeMapStore.isQuestArrestActive && (
        <QuestArrestModal mapStore={activeMapStore} carStore={activeCarStore} />
      )}

      {visibleQuestCars.length > 0 && (
        <SpeedDisplay
          currentSpeed={Math.max(
            ...visibleQuestCars.map((car) => car.currentSpeed),
          )}
        />
      )}

      {activeMapStore.questCarForArrest &&
        !activeMapStore.isPedestrianCrossingQuestActive &&
        !activeMapStore.isParkingFineActive() &&
        !activeMapStore.isPoliceQuestActive &&
        !activeMapStore.isQuestArrestActive &&
        !modeStore.isPaused && (
          <QuestCtaButton
            role="mission"
            className="quest-cta--map"
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
          </QuestCtaButton>
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
