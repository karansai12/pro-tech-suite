import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./login";

describe("Login Component", () => {
  it("renders the login form", () => {
    render(<Login />);

    // Check if form elements are present
    expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders the form within a centered container", () => {
    render(<Login />);

    const container = screen
      .getByPlaceholderText("username")
      .closest("form")?.parentElement;
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("items-center");
    expect(container).toHaveClass("justify-center");
    expect(container).toHaveClass("min-h-screen");
  });

  it("allows user to type in username field", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText("username");
    await user.type(usernameInput, "test@example.com");

    expect(usernameInput).toHaveValue("test@example.com");
  });

  it("allows user to type in password field", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText("password");
    await user.type(passwordInput, "mypassword123");

    expect(passwordInput).toHaveValue("mypassword123");
  });

  it("login button is clickable", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    expect(loginButton).not.toBeDisabled();
  });

  it("form has correct structure with flex column layout", () => {
    render(<Login />);

    const form = screen.getByPlaceholderText("username").closest("form");
    expect(form).toHaveClass("flex");
    expect(form).toHaveClass("flex-col");
    expect(form).toHaveClass("gap-4");
    expect(form).toHaveClass("w-125");
  });

  it("renders without crashing", () => {
    const { container } = render(<Login />);
    expect(container).toBeInTheDocument();
  });
});
