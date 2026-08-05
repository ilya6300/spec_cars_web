import { observer } from "mobx-react-lite";
import enemyIcon from "../../assets/ui/help-badge-enemy.svg";
import criminalIcon from "../../assets/ui/help-badge-criminal.svg";
import pedestrianIcon from "../../assets/ui/help-badge-pedestrian.svg";

const BADGES = [
  {
    key: "enemyChase",
    label: "Погоня",
    dataType: "help-badge-enemy",
    icon: enemyIcon,
  },
  {
    key: "criminalArrest",
    label: "Арест",
    dataType: "help-badge-criminal",
    icon: criminalIcon,
  },
  {
    key: "pedestrianFine",
    label: "Штраф",
    dataType: "help-badge-pedestrian",
    icon: pedestrianIcon,
  },
];

export const HelpBadges = observer(({ carStore }) => {
  const stars = carStore.sessionStars;

  return (
    <div className="help-badges" data-type="help-badges">
      <div
        className="help-stars"
        data-type="help-stars"
        aria-label={`Звёзды: ${stars}`}
      >
        {"★".repeat(stars)}
        {"☆".repeat(3 - stars)}
      </div>
      <div className="help-badges-row">
        {BADGES.map(({ key, label, dataType, icon }) => (
          <div
            key={key}
            className="help-badge"
            data-type={dataType}
            title={label}
          >
            <img
              src={icon}
              alt=""
              className="help-badge-icon"
              width={28}
              height={28}
            />
            <div className="help-badge-meta">
              <span
                key={carStore.helpCounts[key]}
                className="help-badge-count"
              >
                {carStore.helpCounts[key]}
              </span>
              <span className="help-badge-label">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
