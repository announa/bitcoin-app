/* -----------  CALCULATOR  ------------- */

/**
 * Converts the calculator-input to the target-currency depending on the current rate (bid or ask) and the input field (have = left or want = rigth).
 * @param {string} inputField - The ID of the input field
 */
 function convertCurrency(inputField) {
  lastInput = inputField;
  if (inputField === 'input-left' && exRate['name'] === 'bid') {
    getCalcOutput('input-left', 'input-right', 'multiply');
  }
  if (inputField === 'input-right' && exRate['name'] === 'bid') {
    getCalcOutput('input-right', 'input-left', 'divide');
  }
  if (inputField === 'input-left' && exRate['name'] === 'ask') {
    getCalcOutput('input-left', 'input-right', 'divide');
  }
  if (inputField === 'input-right' && exRate['name'] === 'ask') {
    getCalcOutput('input-right', 'input-left', 'multiply');
  }
}

/**
 * Shows the output of the currency converion
 * @param {string} inputfield - The ID of the input field
 * @param {string} outputfield - The ID of the output field
 * @param {string} operation - The mathematical operation to be used
 */
function getCalcOutput(inputfield, outputfield, operation) {
  let input = replaceComma(inputfield);
  let output = document.getElementById(outputfield);

  if (!isNaN(input)) {
    let result = calc(input, operation);
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

function calc(input, operation) {
  if (operation === 'multiply') {
    console.log(input * exRate['rate']);
    return input * exRate['rate'];
  } else {
    console.log(input / exRate['rate']);
    return input / exRate['rate'];
  }
}

/**
 * Inverts the currencies of the calculator
 */
function invertCurrencies() {
  invertExchangeRates();
  changeLabels();
  convertCurrency(lastInput);
}

function invertExchangeRates() {
  if (haveCurrency === 'BTC') {
    setCurrentExchangeRate('USD', 'BTC', 'ask', 6);
  } else {
    setCurrentExchangeRate('BTC', 'USD', 'bid', 5);
  }
}
/**
 * Sets current rate ( -> bid or ask) and have and want currency
 * @param {string} have - The new have-currency
 * @param {string} want - The new want-currency
 * @param {string} exRateName - The name of the new rate ('bid' or 'ask')
 * @param {number} exRateIndex - The index of the exchange rate in currentBitcoin[0]
 */
function setCurrentExchangeRate(have, want, exRateName, exRateIndex) {
  haveCurrency = have;
  wantCurrency = want;
  exRate['name'] = exRateName;
  exRate['rate'] = currentBitcoin[0][exRateIndex];
}

/**
 * Renders the placeholder inside the input fields
 */
function changeLabels() {
  ['placeholder-left', 'have-currency'].forEach((e) => (document.getElementById(e).innerHTML = haveCurrency));
  ['placeholder-right', 'want-currency'].forEach((e) => (document.getElementById(e).innerHTML = wantCurrency));
}
