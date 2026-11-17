import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import SriLankaMap from "./SriLankaMap";

test("clicking a marker selects it without rendering a destination details box", () => {
  render(<SriLankaMap />);
  fireEvent.click(screen.getByRole("button", { name: "Explore Galle" }));
  expect(screen.getByRole("button", { name: "Explore Galle" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Explore Sigiriya" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.queryByRole("figure")).not.toBeInTheDocument();
});

test("categories filter markers and keep selection within the active category", () => {
  render(<SriLankaMap />);
  const map = screen.getByRole("group", { name: "Interactive map of famous places in Sri Lanka" });
  fireEvent.click(screen.getByRole("button", { name: /^Popular Beaches/ }));
  expect(within(map).getAllByRole("button")).toHaveLength(3);
  expect(within(map).queryByRole("button", { name: "Explore Sigiriya" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Explore Trincomalee" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: /^Wildlife & Nature/ }));
  expect(within(map).getAllByRole("button")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "Explore Yala" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: /^Wildlife & Nature/ }));
  expect(within(map).getAllByRole("button")).toHaveLength(10);
});
