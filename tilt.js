function move(event) {
  let el = event.currentTarget;
  let box = el.getBoundingClientRect();
  let x = (event.clientX - box.left) / box.width - 0.5;
  let y = (event.clientY - box.top) / box.height - 0.5;
  el.style.setProperty("--rx", (y * -8).toFixed(2) + "deg");
  el.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
  el.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
  el.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
}

function leave(event) {
  let el = event.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

export default {
  mounted(el) {
    if (window.matchMedia && window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
  },
  unmounted(el) {
    el.removeEventListener("mousemove", move);
    el.removeEventListener("mouseleave", leave);
  }
};
