import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const results = [];

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? " :: " + detail : ""}`);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (err) => log("console pageerror", false, err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") log("console error", false, msg.text());
});

try {
  // 1. Home page loads with seeded products
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const title = await page.title();
  log("home page loads", title.length > 0, title);
  const productCount = await page.locator("a[href^='/products/']").count();
  log("home page shows products", productCount > 0, `${productCount} product links`);

  // 2. Go to a product page and add to cart
  await page.locator("a[href^='/products/']").first().click();
  await page.waitForURL("**/products/**", { timeout: 10000 });
  await page.waitForLoadState("networkidle");
  const productName = await page.locator("h1").first().textContent();
  log("product detail page loads", !!productName, productName ?? "");

  await page.getByRole("button", { name: /add to cart/i }).click();
  await page.waitForURL("**/cart", { timeout: 10000 });
  log("add to cart redirects to /cart", page.url().endsWith("/cart"));

  const cartLine = await page.locator("text=" + (productName ?? "")).count();
  log("cart shows added product", cartLine > 0);

  // 3. Proceed to checkout, place a Cash on Delivery order
  await page.getByRole("link", { name: /proceed to checkout/i }).click();
  await page.waitForURL("**/checkout", { timeout: 10000 });

  await page.fill("input[name=customerName]", "Test Buyer");
  await page.fill("input[name=customerPhone]", "0712345678");
  await page.selectOption("select[name=county]", "Nairobi");
  await page.fill("input[name=town]", "Westlands");
  await page.fill("textarea[name=streetAddress]", "123 Test Street");
  await page.check("input[name=paymentMethod][value=cash_on_delivery]");

  await page.getByRole("button", { name: /place order/i }).click();
  await page.waitForURL(/\/checkout\/[a-f0-9-]+$/, { timeout: 15000 });
  log("checkout creates order and redirects to confirmation", true, page.url());

  const confirmationText = await page.locator("body").textContent();
  log("confirmation page shows order placed", /confirmed|Thanks/i.test(confirmationText ?? ""));

  // 4. Verify cart is now empty (cleared after checkout)
  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  const emptyCartText = await page.locator("text=Your cart is empty").count();
  log("cart cleared after checkout", emptyCartText > 0);

  // 5. Admin login and product creation
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("input[name=email]", "admin@milimaniwellness.co.ke");
  await page.fill("input[name=password]", "ChangeMe123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/admin", { timeout: 10000 });
  log("admin login redirects to /admin", page.url().endsWith("/admin"));

  await page.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle" });
  const orderRow = await page.locator("text=Test Buyer").count();
  log("admin orders list shows the new order", orderRow > 0);

  await page.goto(`${BASE}/admin/products/new`, { waitUntil: "networkidle" });
  await page.fill("input[name=name]", "Smoke Test Product");
  await page.fill("textarea[name=description]", "Created by automated smoke test");
  await page.fill("input[name=price]", "1234");
  await page.fill("input[name=stockQuantity]", "10");
  await page.getByRole("button", { name: /create product/i }).click();
  await page.waitForURL("**/admin/products", { timeout: 10000 });
  const newProductRow = await page.locator("text=Smoke Test Product").count();
  log("new product appears in admin product list", newProductRow > 0);

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const onStorefront = await page.locator("text=Smoke Test Product").count();
  log("new product visible on storefront", onStorefront > 0);
} catch (err) {
  log("unexpected error", false, err.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  console.log("Failures:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
