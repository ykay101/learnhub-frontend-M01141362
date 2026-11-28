import { getJSON, sendJSON } from "./api.js";

let stripe = null;
let elements = null;

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#4338ca",
    colorText: "#1c1917",
    borderRadius: "12px",
    fontFamily: "Inter, system-ui, sans-serif"
  }
};

export async function setupPayments() {
  try {
    if (typeof Stripe == "undefined") return false;
    let config = await getJSON("/payments/config");
    if (!config.enabled) return false;
    stripe = Stripe(config.publishableKey);
    return true;
  } catch (error) {
    return false;
  }
}

export function mountCardForm(element, amountPence) {
  elements = stripe.elements({
    mode: "payment",
    amount: amountPence,
    currency: "gbp",
    appearance: appearance,
    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }]
  });
  let paymentElement = elements.create("payment", {
    layout: "tabs",
    wallets: { link: "never" }
  });
  paymentElement.mount(element);
}

export function updateAmount(amountPence) {
  if (elements && amountPence > 0) {
    elements.update({ amount: amountPence });
  }
}

export async function payForCart(lessonIDs, spaces, expectedPence) {
  let submitted = await elements.submit();
  if (submitted.error) {
    throw new Error(submitted.error.message);
  }

  let intent = await sendJSON("POST", "/payments/intent", { lessonIDs: lessonIDs, spaces: spaces });
  if (intent.amount != expectedPence) {
    elements.update({ amount: intent.amount });
    let error = new Error("Prices changed");
    error.newAmount = intent.amount;
    throw error;
  }

  let result = await stripe.confirmPayment({
    elements: elements,
    clientSecret: intent.clientSecret,
    confirmParams: { return_url: location.href },
    redirect: "if_required"
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.paymentIntent.id;
}
