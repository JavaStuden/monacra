# Stripe webhook audit and mode isolation · 2026-11-22

The public endpoint is `POST https://itsmonarca.com/api/v1/payments/stripe/webhook`.
It requires a valid `Stripe-Signature`; an unsigned POST returns 400 and GET returns
405. These responses are expected and must not be changed to unconditional 200.

## Cause and fix

The test destination `Monarca test payments` reported 21 historical HTTP 400
deliveries, with response `Invalid Stripe webhook`. Its signing secret differed
from the server's configured secret. The server was using a live API key and the
correct signing secret for the separate live destination `Monarca`.

The server now accepts the two existing destinations at the same URL:

- `STRIPE_WEBHOOK_SECRET`: the primary signing secret matching the backend API
  mode; in production this is the live destination's secret.
- `STRIPE_TEST_WEBHOOK_SECRET`: the additional test destination signing secret.
  A signature verified only with this secret cannot authenticate an event claiming
  `livemode=true`.
- `STRIPE_SECRET_KEY`: determines whether this backend processes live or test
  payment events. Events from the other mode are verified and acknowledged with
  200, but do not update orders or release/reserve inventory.

No secret values are stored in this repository. Both signing secrets and the live
API key remain in root-only `/etc/monarca-stripe.env`, loaded by systemd.

`checkout.session.completed` with `payment_status=paid` confirms a matching order
session after the currency and amount checks. `checkout.session.async_payment_succeeded`
also confirms payment. Duplicate deliveries do not confirm twice. Expired or failed
sessions release inventory only in the matching backend mode. For an end-to-end
test-order exercise, use a separate backend/database configured with a test API key;
test events reaching the production URL intentionally do not mark live orders paid.

## Verified outcome

- Dashboard comparison: test secret differed from the old server configuration;
  live secret matched. The live destination was already enabled with 18 successful
  deliveries and no failures in the displayed period, including a real completed
  Checkout event. Its existing Monarca order was `placed` / `paid` for USD 190.
- After deployment, Stripe Dashboard resends of `checkout.session.expired` and
  `checkout.session.completed` showed HTTP 200 / `ok` at 20:48:06 and 20:50:47
  Beijing time on 2026-11-22. Stripe displayed these times as 16:48:06 and 16:50:47
  in its +04 timezone. Historical failed attempts remain in the delivery history.
- Signed no-order connectivity diagnostics returned 200 in 80 ms (test) and 153 ms
  (live) from the server. These diagnostics alone are not proof of Stripe delivery;
  the Dashboard resends above provide that proof.
- Existing orders and product data, including stock, matched before and after the
  test replays. Live credentials were compared privately and preserved.
- Release tests: 23 passed, including 11 webhook cases for signatures, replay,
  order confirmation, delayed payment, amount/currency/session mismatch and mode
  isolation. No new payment or charge was created during this audit.

## Deployment and rollback

Only `StripePaymentService.class` and `application.yml` changed in the deployed
JAR. The frontend, order service, product functions and shipping logic were kept
at their deployed versions. `main` still contains other pending development
changes; do not use it as an unreviewed production replacement.

- Production source tag: `prod-20261122-webhook-modes`.
- Service: `monarca-server.service`, `/opt/monarca-server/monarca-server-4.7.0.jar`.
- Backup: `/opt/monarca-server/backups/webhook-modes-20261122-124709` contains the
  previous JAR, environment file and stopped-service database copy.
- Local delivery folder beside the repository: `交付/StripeWebhook-20261122`.
  It contains the exact production build source, tests, manifest, deployment
  script and successful-delivery screenshots, with no plaintext signing secret.

Rollback the JAR and environment together if required; preserve the current
database if any new orders have arrived. The website release directory is unchanged.
