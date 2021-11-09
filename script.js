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
 * Renders the placeholder inside the input fields
 */
function changeLabels() {
  ['placeholder-left', 'have-currency'].forEach((e) => (document.getElementById(e).innerHTML = haveCurrency));
  ['placeholder-right', 'want-currency'].forEach((e) => (document.getElementById(e).innerHTML = wantCurrency));
}

/**
 * Loads the Bitcoin cours for the selected dates, gets the relevant historical rates and calls showBitcoinCourse().
 */
async function loadCourse() {
  missingData = false;
  let selectedDates = getSelectedDates();
  await getBitcoinData(selectedDates[0], selectedDates[1]);
  getHistoricalRates();
  document.getElementById('section2-table-chart-container').classList.remove('d-none');
  showBitcoinCourse();
}

/**
 * Gets the selected dates from the date input-fields.
 * @returns {array} - Array with the values from the date input-fields = selected dates.
 */
function getSelectedDates() {
  return [document.getElementById('start-date').value, document.getElementById('end-date').value];
}

/**
 * Creates an object "historicalRates" with the historical exchange mid-, bid- and ask-rates and checks if missing data has to be replaced.
 */
function getHistoricalRates() {
  historicalRates = { rates: [], isDefaultRate: [] };

  bitcoinData['data'].forEach((btcDataSet, dataSetIndex) => {
    historicalRates['rates'].push([btcDataSet[0], btcDataSet[3], btcDataSet[5], btcDataSet[6]]); // values = date, mid, bid, aks
    historicalRates['isDefaultRate'].push([btcDataSet[0], false, false, false]); // false = default-value, might be changed in replaceMissingData().
    replaceMissingData(btcDataSet, dataSetIndex);
  });
}

/**
 * Checks if mid-, bid- or ask-rate exists and calls getDefaultRate() for replaces missing rates. Transfers the index of the default-rate in btcDataSet to historicalRates.
 * @param {array} btcDataSet - The current dataset from which missing data is beeing replaced.
 * @param {number} dataSetIndex - The current index of the dataset from which missing data is beeing replaced.
 */
function replaceMissingData(btcDataSet, dataSetIndex) {
  historicalRates['rates'][dataSetIndex].forEach((rate, index, array) => {
    if (!rate) {
      let defaultRate = getDefaultRate(btcDataSet);
      array[index] = defaultRate[0];
      historicalRates['isDefaultRate'][dataSetIndex][index] = defaultRate[1];
    }
    if (index > 0) {
      array[index] = array[index].toFixed(2);
    }
  });
}

/**
 * Gets default exchange rates for missing mid-, bid- or ask-rates and replaces it by the first rate it can find in btcDataSet loaded from the API.
 * @param {array} btcDataSet - The current dataset from which missing data is beeing replaced.
 * @returns {array} - Array containing the default-rate and its index in btcDataSet.
 */
function getDefaultRate(btcDataSet) {
  missingData = true;
  let defaultIndex = btcDataSet.findIndex((data, index) => index > 0 && data);
  return [btcDataSet[defaultIndex], defaultIndex];
}

/**
 * Shows the Bitcoin course for the selected dates. Calls the functions for rendering the table or the chart, depending on the active tab.
 */
function showBitcoinCourse() {
  showLoadingAnimation();
  if (tabs['active'] === 'tab-1') {
    showChart();
  } else {
    showCourseTable();
  }
  hideLoadingAnimation();
}

/**
 * Shows the course-table in section two.
 */
function showCourseTable() {
  document.getElementById('chart-canvas').classList.add('d-none');
  document.getElementById('chart-hint').classList.add('d-none');
  document.getElementById('course-table').classList.remove('d-none');
  renderTableContent();
}

/**
 * Renders the course-table in section two.
 */
function renderTableContent() {
  document.getElementById('course-table-content').innerHTML = '';

  historicalRates['rates'].forEach((histDataSet, index, array) => {
    let renderData = JSON.parse(JSON.stringify(histDataSet));
    renderData = addDefaultDataHint(historicalRates['isDefaultRate'][index], renderData);
    let increase = showIncrease(histDataSet, array[index + 1]);
    renderTableCells(renderData, increase);
  });
}

/**
 * Adds mouse-events for showing the data-info-tooltip to replaced exchange-rates.
 * @param {array} defaultData - Array containing information about replaced exchange-rates in renderData.
 * @param {array} renderData - Array containing exchange-rates to be potentially highlighted.
 * @returns {array} - Array with the modified exchange-rates to be rendered in the current table row.
 */
function addDefaultDataHint(defaultData, renderData) {
  for (let i = 1; i <= defaultData.length; i++) {
    if (defaultData[i]) {
      renderData[i] = `<span class="data-info-span" onmouseover="showDataInfo(${defaultData[i]})" 
    onclick="showDataInfo(${defaultData[i]})" onmouseout="hideDataInfo()">${renderData[i]}</span>`;
    }
  }
  return renderData;
}

/**
 * Gets the increase for the exchange rate at each date.
 * @param {object} currentRates - The exchange rates of the table row to be rendered.
 * @param {*} previousRates - The exchange rates of the table row that is going to be renderen next (but has previous date).
 * @returns {object}
 */
function showIncrease(currentRates, previousRates) {
  let increase = { percentage: [], color: [], arrow: [] };
  let [currDate, ...currRates] = currentRates;
  if (previousRates) {
    let [prevDate, ...prevRates] = previousRates;
    for (i = 0; i < currRates.length; i++) {
      let difference = currRates[i] - prevRates[i];
      increase = setIncreaseValues(increase, prevRates, difference);
    }
  } else {
    increase = { percentage: ['', '', ''], color: ['', '', ''], arrow: ['', '', ''] };
  }
  return increase;
}

/**
 * Sets the values of increase
 * @param {object} increase - The increase-object
 * @param {array} prevRates - Contains the exchange rates of the previous date.
 * @param {number} difference - The difference between the current and the previous exchange rate.
 * @returns {object}
 */
function setIncreaseValues(increase, prevRates, difference) {
  increase.percentage.push(((difference * 100) / prevRates[i]).toFixed(2) + ' %');

  if (difference > 0) {
    increase.color.push('#33dd33');
    increase.arrow.push('&uarr;');
    /* increase.arrow.push('&#129045;'); */
  }
  if (difference < 0) {
    increase.color.push('#ff4444');
    increase.arrow.push('&darr;');
    /* increase.arrow.push('&#129047;'); */
  }
  if (difference == 0) {
    increase.color.push('white');
    increase.arrow.push('');
  }
  return increase;
}

/**
 * Renders the content of the course-table cells.
 * @param {object} renderData - The historic exchange rates.
 * @param {object} increase - Thie increase between the exchange rate at one date and at the previous one.
 */
function renderTableCells(renderData, increase) {
  // prettier-ignore
  document.getElementById('course-table-content').insertAdjacentHTML('beforeend',
  `<tr><td>${renderData[0]}</td>
  <td class="rate-td"><span class="rate-span">${renderData[1]}</span><span class ="increase-info-span" style="color: ${increase.color[0]};"><span class="increase-arrow">${increase['arrow'][0]}</span> ${increase['percentage'][0]}</span></td>
  <td class="rate-td"><span class="rate-span">${renderData[2]}</span><span class ="increase-info-span" style="color: ${increase.color[1]};"><span class="increase-arrow">${increase['arrow'][1]}</span> ${increase['percentage'][1]}</span></td>
  <td class="rate-td"><span class="rate-span">${renderData[3]}</span><span class ="increase-info-span" style="color: ${increase.color[2]};"><span class="increase-arrow">${increase['arrow'][2]}</span> ${increase['percentage'][2]}</span></td></tr>`);
}

/**
 * Shows the info-div for replaced missing data
 * @param {number} defaultIndex - Index of the default value in bitcoinData['column_names']
 */
function showDataInfo(defaultIndex) {
  document.getElementById('default-rate').innerHTML = `${bitcoinData['column_names'][defaultIndex]}-rate`;
  document.getElementById('data-info-tooltip').style.bottom = '0';
  document.getElementById('data-info-tooltip').classList.remove('d-none');
  document.addEventListener('scroll', hideDataInfo);
}

function hideDataInfo() {
  document.getElementById('data-info-tooltip').classList.add('d-none');
}

/**
 * Switches the active and inactive tab after clicking on a tab.
 * @param {string} id - The ID of the selected tab
 */
function changeTab(activeTab, inactiveTab) {
  tabs = { active: activeTab, inactive: inactiveTab };

  if (tabs['active'] === 'tab-1') {
    document.getElementById('tab-shadow-1').classList.remove('d-none');
    ['tab-shadow-2', 'resize-icon'].forEach((item) => document.getElementById(item).classList.remove('d-none'));
    document.getElementById('section2-content-container').setAttribute('style', '');
  } else {
    document.getElementById('tab-shadow-1').classList.add('d-none');
    ['tab-shadow-2', 'resize-icon'].forEach((item) => document.getElementById(item).classList.add('d-none'));
    document
      .getElementById('section2-content-container')
      .setAttribute('style', 'border-top-right-radius: 0; border-top-left-radius: 3px;');
  }
  document.getElementById(tabs['active']).classList.remove('tab-inactive');
  document.getElementById(tabs['inactive']).classList.add('tab-inactive');
}

/**
 * Shows the content of the chart-tab.
 */
function showChart() {
  document.getElementById('course-table').classList.add('d-none');
  document.getElementById('chart-canvas').classList.remove('d-none');
  if (missingData) {
    document.getElementById('chart-hint').classList.remove('d-none');
  } else {
    document.getElementById('chart-hint').classList.add('d-none');
  }
  renderChartContent();
}

/**
 * Renders the chart content.
 */
function renderChartContent() {
  if (bitcoinChart) {
    bitcoinChart.destroy();
  }
  Chart.defaults.color = '#fff';
  Chart.defaults.borderColor = '#444';

  bitcoinChart = new Chart(document.getElementById('chart-canvas'), setChartConfig());
}

/**
 * Defines config for the chart-configuration.
 * @returns {object} - The confg varable
 */
function setChartConfig() {
  const labels = setChartLabels();
  const data = setChartData();
  let scaleMin = Math.min(data['datasets'][0]['data']);
  let scaleMax = Math.max(data['datasets'][0]['data']);

  const config = {
    type: 'line',
    data: setChartData(), //or: data
    options: {
      elements: { point: { pointRadius: 1.5 }, line: { borderWidth: 1 } },
      scales: { x: { reverse: true }, y: { title: { display: true, text: 'USD' } } },
      layout: {
        padding: {
          left: 5,
          right: 30,
          top: 0,
          bottom: 0,
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'BTC / USD Exchange rates from ' + labels['labels_last'] + ' to ' + labels['labels'][0],
          font: { size: 16 },
        },
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
    },
  };
  return config;
}

/**
 * Defines the data-array for the chart.
 * @returns {array} - The data variable
 */
function setChartData() {
  const labels = setChartLabels();
  const data = {
    labels: labels['labels'], // or: labels
    datasets: [
      {
        label: 'Mid',
        backgroundColor: 'rgb(0, 173, 136)',
        borderColor: 'rgb(0, 173, 136)',
        pointHoverBackgroundColor: '#ff4444',
        data: [],
      },
      {
        label: 'Bid',
        backgroundColor: 'rgb(0, 162, 255)',
        borderColor: 'rgb(0, 162, 255)',
        pointHoverBackgroundColor: '#ff4444',
        data: [],
      },
      {
        label: 'Ask',
        backgroundColor: 'rgb(131, 238, 44)',
        borderColor: 'rgb(131, 238, 44)',
        pointHoverBackgroundColor: '#ff4444',
        data: [],
      },
    ],
  };

  historicalRates['rates'].forEach((rate) => {
    data['datasets'][0]['data'].push(rate[1]);
    data['datasets'][1]['data'].push(rate[2]);
    data['datasets'][2]['data'].push(rate[3]);
  });

  return data;
}

/**
 * Defines the labels for the chart and gets the last label for the chart-title. Checks if dataSet contains default-rates and indicates this (*)
 * @returns {object} - Object containing all the chart-labels and the last label.
 */
function setChartLabels() {
  const labels = [];
  historicalRates['isDefaultRate'].forEach((dataSet) => {
    if (dataSet.every((element) => element)) {
      labels.push(dataSet[0] + '*');
    } else {
      labels.push(dataSet[0]);
    }
  });

  let labels_last = labels[labels.length - 1];
  return { labels: labels, labels_last: labels_last };
}

/**
 * Resizes the chart-canvas when clicking on the fullscreen / compress-icon.
 */
function resizeCanvas() {
  if (canvasFullscreen === false) {
    openFullscreenChart();
    canvasFullscreen = true;
  } else {
    closeFullscreenChart();
    canvasFullscreen = false;
  }
}

function openFullscreenChart(){
  document.getElementById('canvas-container').classList.add('canvas-container-fullscreen');
  document.body.style.overflowY = 'hidden';
  document.getElementById('resize-icon').src = './img/compress.svg';
  document.getElementById('to-top').classList.add('d-none');
}

function closeFullscreenChart(){
  document.getElementById('canvas-container').classList.remove('canvas-container-fullscreen');
  document.body.style.overflowY = '';
  document.getElementById('resize-icon').src = './img/expand.svg';
  document.getElementById('to-top').classList.remove('d-none');
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