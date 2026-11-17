import React from "react";
import { render, screen, act, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import TravelStories from "./TravelStories";

beforeEach(() => {
  jest.useFakeTimers();
  window.matchMedia = jest.fn(() => ({ matches: false }));
});
afterEach(() => { jest.useRealTimers(); });

test("the feature changes image and details together after five seconds, then loops", () => {
  const { container } = render(<TravelStories />);
  const featured = () => within(container.querySelector(".travel-story--featured"));
  expect(featured().getByRole("heading", { name: "Discover Sri Lanka’s Cultural Triangle" })).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(4999); });
  expect(featured().getByRole("heading", { name: "Discover Sri Lanka’s Cultural Triangle" })).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(1); });
  expect(featured().getByRole("heading", { name: "Slow days on the east coast" })).toBeInTheDocument();
  expect(featured().getByRole("img", { name: "Coastal scenery in Trincomalee" })).toBeInTheDocument();
  expect(featured().getByText("Quiet bays, ocean breezes, and a gentler pace around Trincomalee.")).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(5);
  act(() => { jest.advanceTimersByTime(20000); });
  expect(featured().getByRole("heading", { name: "Discover Sri Lanka’s Cultural Triangle" })).toBeInTheDocument();
});

test("rotation pauses on hover and resumes after leaving", () => {
  const { container } = render(<TravelStories />);
  const section = screen.getByRole("region", { name: "Travel stories" });
  fireEvent.mouseEnter(section);
  act(() => { jest.advanceTimersByTime(10000); });
  expect(container.querySelector(".travel-story--featured h3")).toHaveTextContent("Discover Sri Lanka’s Cultural Triangle");
  fireEvent.mouseLeave(section);
  act(() => { jest.advanceTimersByTime(5000); });
  expect(container.querySelector(".travel-story--featured h3")).toHaveTextContent("Slow days on the east coast");
});
