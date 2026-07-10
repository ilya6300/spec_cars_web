import { useEffect, useState } from "react";
import { Game } from "./components/game/Game";

const App = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFirstTap = async () => {
      // Проверяем, поддерживает ли браузер Fullscreen API (в iOS Safari его нет)
      if (document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.warn("Браузер заблокировал переход в Fullscreen:", err);
        }
      } else {
        console.log("Этот браузер/устройство не поддерживает Fullscreen API (например, iOS Safari)");
      }
    };

    // Слушатели с флагом once: true автоматически удалятся после первого срабатывания
    document.addEventListener("touchstart", onFirstTap, { once: true });
    document.addEventListener("click", onFirstTap, { once: true });

    // Очистка на случай размонтирования компонента
    return () => {
      document.removeEventListener("touchstart", onFirstTap);
      document.removeEventListener("click", onFirstTap);
    };
  }, []);

  return (
    // Заменили 100vh на 100dvh для идеального отображения на мобильных
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden", backgroundColor: "#000" }}>
      <Game />
    </div>
  );
};

export default App;
