import road1 from "../assets/maps/road_1.png";

const maps = [
  {
    id: 0,
    name: "Лето",
    url: road1,
    isDefault: true,
  },
];

export function getDefaultMap() {
  return maps.find((map) => map.isDefault) ?? maps[0];
}

export function getMapById(mapId) {
  const found = maps.find(
    (map) => map.id === mapId || String(map.id) === String(mapId),
  );
  return found ?? getDefaultMap();
}

class MapsStore {
  maps = maps;
}

export default new MapsStore();
