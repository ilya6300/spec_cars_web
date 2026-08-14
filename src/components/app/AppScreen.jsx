import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import { StartMenu } from "../menu/StartMenu";
import { Game } from "../game/Game";
import { QuestButtonsUiTest } from "../dev/QuestButtonsUiTest";

export const AppScreen = observer(() => {
  if (appStore.screen === "menu") {
    return <StartMenu />;
  }

  if (appStore.screen === "ui-test") {
    return <QuestButtonsUiTest />;
  }

  return (
    <Game
      key={appStore.gameSessionKey}
      gameMode={appStore.selectedMode}
    />
  );
});
