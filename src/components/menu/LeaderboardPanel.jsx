import { observer } from "mobx-react-lite";
import recordsStore from "../../state/recordsStore";
import { GAME_MODES } from "../../state/modeScoring";
import { formatDuration, formatKm, formatScore } from "./LeaderboardPanel.format";

const EMPTY_TEXT = "Пока нет рекордов";

function renderRecord(mode, record) {
  if (mode === GAME_MODES.FREE) {
    return (
      <>
        <span className="leaderboard-panel__value">{formatDuration(record.timeSec)}</span>
        <span className="leaderboard-panel__sep">·</span>
        <span className="leaderboard-panel__value">{formatKm(record.km)}</span>
        <span className="leaderboard-panel__sep">·</span>
        <span className="leaderboard-panel__value">★ {record.stars}</span>
      </>
    );
  }

  if (mode === GAME_MODES.TIMED) {
    return (
      <span className="leaderboard-panel__value">
        {formatScore(record.score)} очков
      </span>
    );
  }

  if (mode === GAME_MODES.CHASE) {
    return (
      <>
        <span className="leaderboard-panel__value">{formatDuration(record.timeSec)}</span>
        <span className="leaderboard-panel__hint">3 поимки</span>
      </>
    );
  }

  return null;
}

export const LeaderboardPanel = observer(({ mode }) => {
  const records = recordsStore.getRecords(mode);

  return (
    <div className="leaderboard-panel" data-type={`leaderboard-${mode}`}>
      {records.length === 0 ? (
        <p className="leaderboard-panel__empty">{EMPTY_TEXT}</p>
      ) : (
        <ul className="leaderboard-panel__list">
          {records.map((record, index) => (
            <li
              key={`${mode}-${index}-${JSON.stringify(record)}`}
              className="leaderboard-panel__row"
              data-type="leaderboard-row"
              data-rank={String(index + 1)}
            >
              {renderRecord(mode, record)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
