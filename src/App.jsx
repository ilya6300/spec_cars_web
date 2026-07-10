import { useEffect, useState } from "react";
import { Game } from "./components/game/Game";

const App = () => {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFirstTap = () => {
      try {
        document.documentElement.requestFullscreen();
        setFullscreen(true);
      } catch (err) {
        console.error("Fullscreen error:", err.message);
      }
      document.removeEventListener("touchstart", onFirstTap);
      document.removeEventListener("click", onFirstTap);
    };

    document.addEventListener("touchstart", onFirstTap, { once: true });
    document.addEventListener("click", onFirstTap, { once: true });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Game />
    </div>
  );
};

export default App;
