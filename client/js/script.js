const BASE_URL = 'bitcoin-app-sigma.vercel.app';

let inputBid;
let inputAsk;
let lastInput;
let today = new Date();
today.setDate(new Date().getDate() - 1);
let currentDate = today.toISOString().split('T')[0];
let bitcoinData;
let missingData = false;
let bitcoinChart;
let tabs = { active: 'tab-1', inactive: 'tab-2' };
let currentBitcoin;
let exRate = { mid: 0, bid: 0, ask: 0 };
let haveCurrency = 'BTC';
let wantCurrency = 'USD';
let historicalRates = { rates: [], isDefaultRate: [] };
let canvasFullscreen = false;

/**
 * Resets the input fields for being empty on page-loading.
 */
function resetInputFields() {
  document.getElementById('to-top').classList.add('d-none');
  setCalculatorFields('input-bid', '1');
  setDatePicker();
}

/**
 * Resets the calculator input fields in section one.
 */
function setCalculatorFields(field, value) {
  document.getElementById(field).value = value;
  convertCurrency(field);
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
  setCalculatorFields('input-bid', '1');
  await getRefreshedAt();
  renderRefreshedAt();
}

/**
 * Gets the biscoin data from the API from start date to end date
 * @param {string} startdate - The start date for loading the bitcoin data
 * @param {string} enddate - The end date for loading the bitcoin data
 */
async function getBitcoinData(startdate, enddate) {
  showLoadingAnimation();
  const dateFilter = startdate === enddate ? `date=${startdate}` : `date.gt=${startdate}&date.lt=${enddate}`;
  const columnFilter = 'qopts.columns=code,date,mid,bid,ask';
  const url = `${BASE_URL}?code=BTCUSD&${dateFilter}&${columnFilter}`;
  const response = await fetch(url);
  const responseJSON = await response.json();
  bitcoinData = responseJSON['data'];
  hideLoadingAnimation();
}

async function getRefreshedAt() {
  const url = `${BASE_URL}/metadata`;
  const response = await fetch(url);
  const responseJSON = await response.json();
  bitcoinData['refreshed_at'] = responseJSON['status']['refreshed_at'];
}

/**
 * Sets the current bitcoin exchange rate
 */
function setCurrentBitcoin() {
  currentBitcoin = bitcoinData;
  exRate['mid'] = currentBitcoin[0][2];
  exRate['bid'] = currentBitcoin[0][3];
  exRate['ask'] = currentBitcoin[0][4];
}

/**
 * Renders the current exchange rate in the table in section one.
 */
function renderExchangeRate() {
  document.getElementById('current-date').innerHTML = currentDate;
  document.getElementById('mid').innerHTML = exRate['mid'].toFixed(2) + ' USD';
  document.getElementById('bid').innerHTML = exRate['bid'].toFixed(2) + ' USD';
  document.getElementById('ask').innerHTML = exRate['ask'].toFixed(2) + ' USD';
}

/**
 * Renders the refreshed-at fields at the end of both sections
 */
function renderRefreshedAt() {
  const date = new Date(bitcoinData['refreshed_at']).toLocaleDateString('en-GB');
  const time = new Date(bitcoinData['refreshed_at']).toTimeString().split(' ')[0];
  let refreshedAt = date + ' ' + time;
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
