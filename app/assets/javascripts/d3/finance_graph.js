var c3 = require('c3');

var FinanceGraph = function FinanceGraph(data) {
  var graph = c3.generate({
      bindto: '#chart_div',
      data: {
          x: 'Dates',
          columns: data,
          types: {
            Profits: 'area-spline',
            Expenses: 'area-spline',
            PlatformCosts: 'area-spline'
          },
          groups: [['Profits', 'Expenses', 'PlatformCosts']]
      },
      axis : {
       x: {
           type : 'timeseries',
           tick: {
              format: '%b %y' // format string is also available for timeseries data
            },
            padding: {left: 0, right: 0}
       }
   }
  });
  return 0
}

window.FinanceGraph = FinanceGraph;
