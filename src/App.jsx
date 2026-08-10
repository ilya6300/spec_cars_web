import { AppScreen } from "./components/app/AppScreen";
import FullscreenButton from "./components/game/FullscreenButton";

const App = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <FullscreenButton />
      <AppScreen />
    </div>
  );
};

export default App;
