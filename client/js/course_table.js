/* ------------ COURSE TABLE  ------------ */

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
