import React from "react";
import { expect, test } from "vitest";
import { render } from "@testing-library/react";
import { runInAction } from "mobx";
import MapStore from "../state/mapStore";
import { useMapScrollSync } from "./useMapScrollSync";

function ScrollSyncProbe({ mapStore }) {
  const scrollRef = useMapScrollSync(mapStore);
  return <div ref={scrollRef} data-testid="map-scroll" />;
}

test("useMapScrollSync sets --map-scroll-x when offsetX changes", () => {
  const mapStore = new MapStore({ id: 1, name: "Test", url: "test.png" });

  const { getByTestId } = render(<ScrollSyncProbe mapStore={mapStore} />);
  const scrollEl = getByTestId("map-scroll");

  expect(scrollEl.style.getPropertyValue("--map-scroll-x")).toBe("0px");

  runInAction(() => {
    mapStore.offsetX = 150;
  });

  expect(scrollEl.style.getPropertyValue("--map-scroll-x")).toBe("150px");

  runInAction(() => {
    mapStore.offsetX = 420.5;
  });

  expect(scrollEl.style.getPropertyValue("--map-scroll-x")).toBe("420.5px");
});
