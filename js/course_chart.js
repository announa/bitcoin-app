/* -------------  COURSE CHART  ------------- */

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