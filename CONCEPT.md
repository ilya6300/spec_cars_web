В @Game.jsx есть блок
      {activeMapStore.questCarForArrest && activeMapStore.isPedestrianCrossingQuestActive && (
        <button
          className="arrest-button-quest-car-map"
          onClick={() => {
            if (activeMapStore.questCarForArrest) {
              const index = activeMapStore.questCars.indexOf(activeMapStore.questCarForArrest);
              if (index !== -1) {
                runInAction(() => {
                  activeCarStore.countHelp += 1;
                  activeMapStore.questCarForArrest = null;
                });
                activeMapStore.removeQuestCarByIndex(index);
                if (activeCarStore.sirena) {
                  activeCarStore.toggleSirena();
                }
              }
            }
          }}
        >
          Арестовать
        </button>
      )}
      Он должен появлятся тогда, когда enemy = true машина сравняется по x координатам + 250 px, сечас эта кнопка не появлятся. 
      1) проверь условие
      2) проверь стили