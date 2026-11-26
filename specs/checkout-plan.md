# Checkout — Test Plan

**Application:** Swag Labs demo store (`WEB_BASE_URL`)
**Seed:** `tests/web/seed.spec.ts` (authenticated, on the inventory page)
**Tags:** `@regression @web` (journeys also `@e2e`)
**Data:** `test-data/web.json` → `products`, `checkout`, `checkoutValidation`, `taxRate`

## Overview

A logged-in shopper adds products to the cart, enters shipping details, reviews the
order with item total, tax and total, and finishes the order.

### 1. Purchase journey

#### 1.1 Buy several products and verify totals
**Steps**
1. On the inventory page, add every product in `products.journey` to the cart.
2. Open the cart.
3. Click **Checkout**.
4. Fill first name, last name and postal code from `checkout`; click **Continue**.
5. On the overview, read item total, tax and total.
6. Click **Finish**.

**Expected**
- Cart badge equals the number of products added.
- Cart and overview list exactly the added products, in order.
- Item total = sum of product prices; tax = item total × `taxRate` (rounded to cents);
  total = item total + tax.
- Confirmation header reads "Thank you for your order!" and the cart badge is gone.

#### 1.2 Cancel from overview keeps the cart
**Steps**
1. Add `products.single` to the cart and go to the overview.
2. Click **Cancel**.

**Expected**
- User returns to the inventory page.
- Cart badge still shows 1.

### 2. Information form validation (data-driven)

#### 2.1 Required fields — one test per row in `checkoutValidation`
**Steps**
1. Add `products.single` to the cart and open checkout information.
2. Fill the fields from the row; click **Continue**.

**Expected**
- Error banner contains the row's `expectedError`.
- User stays on the checkout information page.
