import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import { StartMenu } from "../menu/StartMenu";
import { Game } from "../game/Game";

export const AppScreen = observer(() => {
  if (appStore.screen === "menu") {
    return <StartMenu />;
  }

  return (
    <Game
      key={appStore.gameSessionKey}
      gameMode={appStore.selectedMode}
    />
  );
});
