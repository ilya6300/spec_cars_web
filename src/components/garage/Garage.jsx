import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import garageStore from "../../state/garageStore";
import Cars, { getDefaultCar } from "../../state/cars";
import { CarModel } from "../car/CarModel";
import { GlobalCoinsDisplay } from "../ui/GlobalCoinsDisplay";
import garageBackground from "../../assets/background/car_box.png";
import "../../style/garage.css";

const TABS = [
  { id: "cars", label: "Автомобили", dataType: "garage-tab-cars" },
  { id: "wheels", label: "Колёса", dataType: "garage-tab-wheels" },
];

export const Garage = observer(() => {
  const [activeTab, setActiveTab] = useState("wheels");
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultCar = getDefaultCar();
  const previewCarStore = garageStore.getPreviewCarStore(
    viewportSize.width,
    viewportSize.height,
  );

  const renderWheelCards = () =>
    Cars.wheels.map((wheel) => {
      const isActive = garageStore.activeWheelId === wheel.id;
      return (
        <button
          key={wheel.id}
          type="button"
          className="garage-card"
          data-type="garage-card"
          data-id={wheel.id}
          data-active={isActive ? "true" : "false"}
          data-open={wheel.open ? "true" : "false"}
          disabled={!wheel.open}
          onClick={() => garageStore.selectWheel(wheel.id)}
        >
          <img src={wheel.src} alt="" className="garage-card__preview" />
          <span className="garage-card__label">{wheel.name}</span>
        </button>
      );
    });

  const renderSkinCards = () =>
    defaultCar.skins.map((skin) => {
      const isActive = garageStore.activeSkinId === skin.id;
      return (
        <button
          key={skin.id}
          type="button"
          className="garage-card"
          data-type="garage-card"
          data-id={skin.id}
          data-active={isActive ? "true" : "false"}
          data-open={skin.open ? "true" : "false"}
          disabled={!skin.open}
          onClick={() => garageStore.selectSkin(skin.id)}
        >
          <img src={skin.urlBody} alt="" className="garage-card__preview" />
          <span className="garage-card__label">{skin.id}</span>
        </button>
      );
    });

  return (
    <div className="garage-screen" data-type="garage-screen">
      <div
        className="garage-screen__bg"
        style={{ backgroundImage: `url(${garageBackground})` }}
        aria-hidden="true"
      />
      <div className="garage-hud" data-type="garage-hud">
        <GlobalCoinsDisplay />
        <button
          type="button"
          className="garage-back"
          data-type="garage-back"
          aria-label="В меню"
          onClick={() => appStore.backFromGarage()}
        >
          <svg
            className="garage-back__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
            <path d="M10 12H3" />
            <path d="M6 9l-3 3 3 3" />
          </svg>
        </button>
      </div>
      <div className="garage-screen__layout">
        <div className="garage-screen__preview">
          <CarModel
            carStore={previewCarStore}
            variant="player"
            nested
            layoutTokens={previewCarStore.layoutTokens}
          />
        </div>
        <div className="garage-screen__panel">
          <div className="garage-tabs" data-type="garage-tabs">
            {TABS.map(({ id, label, dataType }) => (
              <button
                key={id}
                type="button"
                className={`garage-tab${activeTab === id ? " garage-tab--active" : ""}`}
                data-type={dataType}
                aria-pressed={activeTab === id}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="garage-card-grid" data-type="garage-card-grid">
            {activeTab === "wheels" ? renderWheelCards() : renderSkinCards()}
          </div>
        </div>
      </div>
    </div>
  );
});
