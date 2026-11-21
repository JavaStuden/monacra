# Stripe Checkout

The mobile/web client creates an unpaid order using server catalogue prices, then opens Stripe-hosted Checkout. Card data is entered only on Stripe. The server confirms payment from a verified webhook; the success redirect alone never marks an order paid.

The catalogue and order totals use USD. The current web checkout displays the AED amount and requests an AED Checkout Session at the business-approved fixed rate of `1 USD = 3.67 AED`, rounded to two decimal places using half-up rounding. Older clients that omit `chargeCurrency` continue to use USD. The order stores its USD total separately from `chargeCurrency`, `chargeAmount`, and `exchangeRate`; payment confirmation checks the session's expected amount and currency before marking the order paid.

Stripe's charge currency and the payout bank's settlement currency are separate settings. Confirm AED payouts, conversion fees, and the supported bank account in the Dashboard. Existing Checkout Sessions have Adaptive Pricing enabled, so Stripe may also offer a localized currency such as CNY. This code does not explicitly disable Adaptive Pricing or provide a customer-facing USD/AED selector.

## Verification status

As of 21 November 2026, a live USD payment has been checked against Stripe and the website: the PaymentIntent succeeded and the website order is `paid` / `placed`. A live payment through the updated AED flow, including webhook confirmation and recovery in a browser without local order data, still needs end-to-end verification. The previous APK/IPA releases have not been rebuilt for this change; the repository's mobile build workflow runs when code is pushed to `main` or `master`.

The anonymous order-list endpoint returns HTTP 401 until verified customer authentication is implemented. Single-order summaries omit the recipient's name, phone number, and detailed address.

## UAE account onboarding

1. Sign in to the company's Stripe account with the invited developer account. The account owner or an authorized representative must complete business verification and any payout-bank setup.
2. Use the legal entity name `FORT ME GENERAL TRADING L.L.C` and the exact business details from the current Dubai trade licence. The licence identifies the entity as a single-owner LLC and its activity as General Trading. Select the matching Company/LLC type; the licence is issued by Dubai's Department of Economic Development, so select non-free-zone/mainland if Stripe asks, after confirming the registration with the account owner.
3. Upload the current UAE trade licence, the memorandum of association showing the owners and ownership split, and proof of an active company bank account. Stripe may also require identity verification for the account representative and beneficial owners, and a power of attorney if the representative is not listed on the licence or company documents. Upload documents only in the Stripe Dashboard, never to Git or the website.
4. In test mode, copy the secret API key and create a webhook endpoint for the events below. Put the test key and the endpoint's signing secret in the Spring Boot server environment. Do not paste secrets into chat, frontend code, or this file.
5. Run a test card checkout and confirm the order changes to paid only after the webhook reaches the server. Complete a test refund from the Stripe Dashboard before enabling live mode.

## Server settings

Set these environment variables on the Spring Boot server. Use test-mode values first and keep them out of Git, frontend files, and logs.

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONARCA_PUBLIC_BASE_URL=https://itsmonarca.com
```

Register a Stripe webhook at `https://itsmonarca.com/api/v1/payments/stripe/webhook` for `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.

For local webhook testing, use the Stripe CLI to forward events to `http://localhost:8080/api/v1/payments/stripe/webhook`, then put the CLI's temporary signing secret in `STRIPE_WEBHOOK_SECRET`.

Before enabling live payments, finish Stripe's UAE business verification, confirm card acceptance and settlement currency in the account, configure the live webhook secret, and test a small payment and refund through the merchant dashboard.
