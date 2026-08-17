import { useEffect, useRef } from "react";
import { reaction } from "mobx";

export function useMapScrollSync(mapStore) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const dispose = reaction(
      () => mapStore.offsetX,
      (x) => {
        scrollRef.current?.style.setProperty("--map-scroll-x", `${x}px`);
      },
      { fireImmediately: true },
    );

    return dispose;
  }, [mapStore]);

  return scrollRef;
}
