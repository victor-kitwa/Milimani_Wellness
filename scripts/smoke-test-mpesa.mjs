import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", headless: true });
const page = await browser.newPage();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.locator("a[href^='/products/']").nth(1).click();
await page.waitForLoadState("networkidle");
await page.getByRole("button", { name: /add to cart/i }).click();
await page.waitForURL("**/cart");
await page.getByRole("link", { name: /proceed to checkout/i }).click();
await page.waitForURL("**/checkout");

await page.fill("input[name=customerName]", "Mpesa Buyer");
await page.fill("input[name=customerPhone]", "0712345678");
await page.selectOption("select[name=county]", "Nairobi");
await page.fill("input[name=town]", "CBD");
await page.fill("textarea[name=streetAddress]", "456 Test Ave");
// mpesa is checked by default

await page.getByRole("button", { name: /place order/i }).click();
await page.waitForURL(/\/checkout\/[a-f0-9-]+$/, { timeout: 15000 });
console.log("Order URL:", page.url());

// Wait for the poller to run at least once (it fires immediately on mount)
await page.waitForTimeout(3000);
const bodyText = await page.locator("body").textContent();
const hasWaitingOrFailed = /Check your phone|did not go through/i.test(bodyText ?? "");
console.log(hasWaitingOrFailed ? "PASS - shows a sensible payment state" : "FAIL - unexpected content");
console.log("Snippet:", (bodyText ?? "").replace(/\s+/g, " ").slice(0, 400));

await browser.close();
