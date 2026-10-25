const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
const cashChangeOptions = document.querySelector("#cash-change-options");
const cashChangeChoiceInputs = document.querySelectorAll('input[name="needs-change"]');
const cashChangeAmountGroup = document.querySelector("#cash-change-amount-group");
const cashChangeAmountInput = document.querySelector("#cash-change-amount");

function updateCashChangeVisibility() {
  const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
  const cashSelected = selectedPaymentMethod && selectedPaymentMethod.value === "cash";
  cashChangeOptions.hidden = !cashSelected;

  if (!cashSelected) {
    cashChangeChoiceInputs.forEach((input) => {
      input.checked = false;
      input.required = false;
    });
    cashChangeAmountGroup.hidden = true;
    cashChangeAmountInput.required = false;
    cashChangeAmountInput.value = "";
    return;
  }

  cashChangeChoiceInputs.forEach((input) => {
    input.required = true;
  });

  const changeNeeded = document.querySelector('input[name="needs-change"]:checked');
  const showAmount = changeNeeded && changeNeeded.value === "yes";
  cashChangeAmountGroup.hidden = !showAmount;
  cashChangeAmountInput.required = Boolean(showAmount);

  if (!showAmount) {
    cashChangeAmountInput.value = "";
  }
}

paymentMethodInputs.forEach((input) => {
  input.addEventListener("change", updateCashChangeVisibility);
});

cashChangeChoiceInputs.forEach((input) => {
  input.addEventListener("change", updateCashChangeVisibility);
});

updateCashChangeVisibility();