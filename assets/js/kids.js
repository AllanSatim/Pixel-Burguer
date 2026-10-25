document.querySelectorAll(".kids-product .qty-selector").forEach((selector) => {
  const quantity = selector.querySelector(".qty-number");
  const buttons = selector.querySelectorAll(".qty-btn");

  buttons[0].addEventListener("click", () => {
    quantity.textContent = String(Math.max(1, Number(quantity.textContent) - 1));
  });

  buttons[1].addEventListener("click", () => {
    quantity.textContent = String(Number(quantity.textContent) + 1);
  });
});
