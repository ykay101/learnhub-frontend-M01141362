export function money(pence) {
  let amount = Math.round(pence) / 100;
  return "£" + (Number.isInteger(amount) ? amount : amount.toFixed(2));
}

export function pounds(value) {
  return money(Math.round(value * 100));
}
