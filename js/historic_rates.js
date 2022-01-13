/* ------------  HISTORIC EXCHANGE RATE  ------------- */

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
