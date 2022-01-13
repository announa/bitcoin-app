let API_KEY = 'zbXxFvqbtzpFrTdQPBAb';
let today = new Date();
today.setDate(new Date().getDate() - 1);
let currentDate = today.toISOString().split('T')[0];
let bitcoinData;
let missingData = false;
let bitcoinChart;
let tabs = { active: 'tab-1', inactive: 'tab-2' };
let currentBitcoin;
let exRate = { name: 'bid', rate: 0 };
let haveCurrency = 'BTC';
let wantCurrency = 'USD';
let lastInput;
let historicalRates = { rates: [], isDefaultRate: [] };
let canvasFullscreen = false;

/**
 * Resets the input fields for beeing empty on page-loading.
 */
function resetInputFields() {
  document.getElementById('to-top').classList.add('d-none');
  setCalculatorFields();
  setDatePicker();
}

/**
 * Resets the calculator input fields in section one.
 */
function setCalculatorFields() {
  document.getElementById('input-left').value = '';
  document.getElementById('input-right').value = '';
}

/** Resets the date-picker in section two. */
function setDatePicker() {
  ['start-date', 'end-date'].forEach((date) => {
    document.getElementById(date).setAttribute('max', currentDate);
    document.getElementById(date).value = currentDate;
  });
}

/**
 * Loads the exchange rate for the current date on page loading.
 */
async function loadCurrentExchangeRate() {
  await getBitcoinData(currentDate, currentDate);
  setCurrentBitcoin();
  renderExchangeRate();
  renderRefreshedAt();
}

/**
 * Gets the biscoin data from the API from start date to end date
 * @param {string} startdate - The start date for loading the bitcoin data
 * @param {string} enddate - The end date for loading the bitcoin data
 */
async function getBitcoinData(startdate, enddate) {
  showLoadingAnimation();
  let url = `https://data.nasdaq.com/api/v3/datasets/BITFINEX/BTCUSD?start_date=${startdate}&end_date=${enddate}&api_key=${API_KEY}`;
  let response = await fetch(url);
  let responseJSON = await response.json();
  bitcoinData = responseJSON['dataset'];
  hideLoadingAnimation();
}

/**
 * Sets the current bitcoin exchange rate
 */
function setCurrentBitcoin() {
  currentBitcoin = bitcoinData['data'];
  exRate['rate'] = currentBitcoin[0][5];
}

/**
 * Renders the current exchange rate in the table in section one.
 */
function renderExchangeRate() {
  document.getElementById('current-date').innerHTML = currentDate;
  document.getElementById('mid').innerHTML = currentBitcoin[0][3].toFixed(2) + ' USD';
  document.getElementById('bid').innerHTML = currentBitcoin[0][5].toFixed(2) + ' USD';
  document.getElementById('ask').innerHTML = currentBitcoin[0][6].toFixed(2) + ' USD';
}

/**
 * Renders the refreshed-at fields at the end of both sections
 */
function renderRefreshedAt() {
  let refreshedAt = bitcoinData['refreshed_at'].replace('T', ', ');
  [...document.getElementsByClassName('refreshed-at')].forEach(
    (container) => (container.innerHTML = `Data refreshed at <b>${refreshedAt}</b>`)
  );
}

/**
 * Shows the rotating-circle-animation for signalising that data is beeing loaded.
 */
function showLoadingAnimation() {
  document.getElementById('loading-anim-bg').classList.remove('d-none');
}

function hideLoadingAnimation() {
  document.getElementById('loading-anim-bg').classList.add('d-none');
}

/**
 * Scrolls to the top of the page.
 */
function toTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

/**
 * Activates the to-top-button after scrolling 100vh
 */
window.onscroll = () => {
  let canvas = document.getElementById('canvas-container');

  if (window.scrollY > window.innerHeight && !canvas.classList.contains('canvas-container-fullscreen')) {
    document.getElementById('to-top').classList.remove('d-none');
  } else {
    document.getElementById('to-top').classList.add('d-none');
  }
};