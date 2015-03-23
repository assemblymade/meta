var FinanceGraph = function FinanceGraph(data, x_tick_format) {
  var format = x_tick_format == undefined ? '%b %y' : x_tick_format
  var graph = c3.generate({
      bindto: '#chart_div',
      data: {
          x: 'Dates',
          columns: data,
          type: 'area-spline',
          groups: [data.filter(function(x){return x[0] != 'Dates'}).map(function(a){return a[0]})]
      },
      axis : {
       x: {
           type : 'timeseries',
           tick: {
              format: format // format string is also available for timeseries data
            },
            padding: {left: 0, right: 0}
       }
   }
  });
};

window.FinanceGraph = FinanceGraph;
