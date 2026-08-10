import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CarStore from "../../state/carStore";
import { RefuelModal } from "./RefuelModal";

describe("RefuelModal", () => {
  it("renders modal with data-type and content", () => {
    const carStore = new CarStore({ id: "refuel-modal-test", maxFuel: 65000, fuel: 0 });

    render(<RefuelModal carStore={carStore} onWatchVideo={vi.fn()} />);

    expect(document.querySelector('[data-type="refuel-modal"]')).not.toBeNull();
    expect(screen.getByText("Бензин кончился!")).not.toBeNull();
    expect(screen.getByText("Посмотри видео — получишь 5 литров")).not.toBeNull();
  });

  it("shows empty canister with canister--low", () => {
    const carStore = new CarStore({ id: "refuel-canister-test", maxFuel: 65000, fuel: 0 });

    render(<RefuelModal carStore={carStore} onWatchVideo={vi.fn()} />);

    const wrapper = document.querySelector('[data-type="refuel-canister"]');
    expect(wrapper).not.toBeNull();

    const canister = wrapper.querySelector(".canister");
    expect(canister.classList.contains("canister--low")).toBe(true);
    expect(canister.getAttribute("data-fuel-percent")).toBe("0");
    expect(wrapper.querySelector(".fuel-text").textContent).toBe("0л");
    expect(wrapper.querySelector(".canister-warning-icon")).not.toBeNull();
  });

  it("calls onWatchVideo when CTA is clicked", () => {
    const carStore = new CarStore({ id: "refuel-cta-test", maxFuel: 65000, fuel: 0 });
    const onWatchVideo = vi.fn();

    render(<RefuelModal carStore={carStore} onWatchVideo={onWatchVideo} />);

    const cta = document.querySelector('[data-type="refuel-watch-video"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toBe("Смотреть видео");

    fireEvent.click(cta);
    expect(onWatchVideo).toHaveBeenCalledOnce();
  });

  it("exposes dialog accessibility attributes", () => {
    const carStore = new CarStore({ id: "refuel-a11y-test", maxFuel: 65000, fuel: 0 });

    render(<RefuelModal carStore={carStore} onWatchVideo={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("refuel-modal-title");
    expect(screen.getByRole("heading", { name: "Бензин кончился!" }).id).toBe(
      "refuel-modal-title",
    );
  });
});
