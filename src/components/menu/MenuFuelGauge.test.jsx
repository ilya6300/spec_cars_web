import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const mockLoadFuel = vi.fn();

vi.mock("../../state/persistence", () => ({
  loadFuel: (...args) => mockLoadFuel(...args),
}));

import { MenuFuelGauge } from "./MenuFuelGauge";

const MAX_FUEL = 65000;
const CAR_ID = "police-0";

describe("MenuFuelGauge", () => {
  beforeEach(() => {
    mockLoadFuel.mockReset();
  });

  it("renders data-type menu-fuel-gauge", () => {
    mockLoadFuel.mockReturnValue(null);
    render(<MenuFuelGauge maxFuel={MAX_FUEL} carId={CAR_ID} />);
    expect(
      document.querySelector('[data-type="menu-fuel-gauge"]'),
    ).not.toBeNull();
  });

  it("shows full tank when loadFuel returns null", () => {
    mockLoadFuel.mockReturnValue(null);
    render(<MenuFuelGauge maxFuel={MAX_FUEL} carId={CAR_ID} />);
    expect(mockLoadFuel).toHaveBeenCalledWith(MAX_FUEL, CAR_ID);

    const canister = document.querySelector(".canister");
    expect(canister).not.toBeNull();
    expect(canister.classList.contains("canister--low")).toBe(false);
    expect(canister.classList.contains("canister--warning")).toBe(false);
    expect(canister.getAttribute("data-fuel-percent")).toBe("100");
    expect(document.querySelector(".fuel-text").textContent).toBe("65л");
  });

  it("shows saved fuel from loadFuel", () => {
    mockLoadFuel.mockReturnValue(50000);
    render(<MenuFuelGauge maxFuel={MAX_FUEL} carId={CAR_ID} />);
    expect(document.querySelector(".fuel-text").textContent).toBe("50л");
    expect(document.querySelector(".canister").getAttribute("data-fuel-percent")).toBe(
      "77",
    );
  });

  it("applies canister--low when fuel below 5%", () => {
    mockLoadFuel.mockReturnValue(2000);
    render(<MenuFuelGauge maxFuel={MAX_FUEL} carId={CAR_ID} />);

    const canister = document.querySelector(".canister");
    expect(canister.classList.contains("canister--low")).toBe(true);
    expect(document.querySelector(".canister-warning-icon")).not.toBeNull();
  });

  it("applies canister--warning when fuel below 25% but not low", () => {
    mockLoadFuel.mockReturnValue(13000);
    render(<MenuFuelGauge maxFuel={MAX_FUEL} carId={CAR_ID} />);

    const canister = document.querySelector(".canister");
    expect(canister.classList.contains("canister--warning")).toBe(true);
    expect(canister.classList.contains("canister--low")).toBe(false);
  });
});
