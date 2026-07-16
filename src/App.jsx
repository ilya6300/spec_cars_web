import { useEffect, useState } from "react";
import { Game } from "./components/game/Game";

const App = () => {
  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden", backgroundColor: "#000" }}>
      <Game />
    </div>
  );
};

export default App;
