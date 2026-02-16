import { expect, test } from "@playwright/test";

test("calculator supports click and keyboard input", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "9" }).click();
  await page.getByRole("button", { name: "+", exact: true }).click();
  await page.getByRole("button", { name: "1" }).click();
  await page.getByRole("button", { name: "=" }).click();

  await expect(page.getByTestId("display")).toHaveText("10");

  await page.keyboard.type("7*6");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("display")).toHaveText("42");
});
