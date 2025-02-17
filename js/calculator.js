/* -----------  CALCULATOR  ------------- */

/**
 * Converts the calculator-input to the target-currency depending on the current rate (bid or ask) and the input field (have = left or want = rigth).
 * @param {string} inputField - The ID of the input field
 */
function convertCurrency(inputField) {
  const input = replaceComma(inputField);

  if (inputField === 'input-bid' && haveCurrency === 'BTC') {
    getCalcOutput(input, 'bid', 'multiply');
  }
  if (inputField === 'input-ask' && haveCurrency === 'BTC') {
    getCalcOutput(input, 'ask', 'divide');
  }
  if (inputField === 'input-bid' && haveCurrency === 'USD') {
    getCalcOutput(input, 'bid', 'divide');
  }
  if (inputField === 'input-ask' && haveCurrency === 'USD') {
    getCalcOutput(input, 'ask', 'multiply');
  }
}

/**
 * Shows the output of the currency conversion
 * @param {string} input - The input value
 * @param {string} action - The exchange action (bid or ask)
 * @param {string} operation - The mathematical operation to be executed
 */
function getCalcOutput(input, action, operation) {
  const output = document.getElementById(`input-${action === 'bid' ? 'ask' : 'bid'}`);

  if (!isNaN(input)) {
    const result = operation === 'multiply' ? input * exRate[action] : input / exRate[action];
    output.style.fontSize = '';
    output.value = result.toLocaleString(undefined, { maximumFractionDigits: 7 });
  } else {
    output.style.fontSize = '.9rem';
    output.value = 'This is not a valid number';
  }
}

/**
 * Replaces possible comma with dot. For local comma as decimal separator.
 * @param {string} inputfield - The field in which the user types the amount he wants to convert
 * @returns {string} - The number with comma replaced with dot
 */
function replaceComma(inputfield) {
  let input = document.getElementById(inputfield);
  input.value = input.value.replace(',', '.');
  return input.value.replace(',', '.');
}

/**
 * Inverts the currencies of the calculator
 */
function invertCurrencies() {
  invertExchangeRates();
  changeLabels();
  convertCurrency('input-bid');
}

function invertExchangeRates() {
  if (haveCurrency === 'BTC') {
    haveCurrency = 'USD';
    wantCurrency = 'BTC';
  } else {
    haveCurrency = 'BTC';
    wantCurrency = 'USD';
  }
}

/**
 * Renders the placeholder inside the input fields
 */
function changeLabels() {
  ['placeholder-left', 'have-currency'].forEach((e) => (document.getElementById(e).innerHTML = haveCurrency));
  ['placeholder-right', 'want-currency'].forEach(
    (e) => (document.getElementById(e).innerHTML = wantCurrency)
  );
}
