/** Реестр квестов по службе — source of truth для привязки к helpType */
export const questsByService = {
  police: [
    {
      id: "police-arrest",
      trigger: "onClick",
      objectTypes: ["human_aggr1", "human_aggr2", "human_aggr3"],
      helpType: "criminalArrest",
    },
    {
      id: "pedestrian-fine",
      trigger: "trafficLight",
      helpType: "pedestrianFine",
    },
    {
      id: "enemy-chase",
      trigger: "questCar",
      helpType: "enemyChase",
    },
  ],
};

export function getQuestsForService(service) {
  return questsByService[service] ?? [];
}

export function getHelpTypeForPoliceObject(typeId) {
  const quest = questsByService.police.find((q) =>
    q.objectTypes?.includes(typeId),
  );
  return quest?.helpType ?? null;
}
