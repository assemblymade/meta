var d3 = require('d3')

var Chart = React.createClass({
  render: function() {
    return (
      <svg width={this.props.width} height={this.props.height}>{this.props.children}</svg>
    )
  }
})

var Bar = React.createClass({
  getDefaultProps: function() {
    return {
      width: 0,
      height: 0,
      offset: 0
    }
  },

  render: function() {
    return (
      <rect fill={this.props.color}
            width={this.props.width} height={this.props.height}
            rx={this.props.width/2}
            x={this.props.offset} y={this.props.availableHeight - this.props.height} />
    );
  }
});

var DataSeries = React.createClass({
  getDefaultProps: function() {
    return {
      title: '',
      data: []
    }
  },

  render: function() {
    var props = this.props;

    var yScale = d3.scale.linear()
      .domain([0, Math.max(d3.max(this.props.data), 5)])
      .range([0, this.props.height]);

    var xScale = d3.scale.ordinal()
      .domain(d3.range(this.props.data.length))
      .rangeRoundBands([0, this.props.width], 0.05);

    var bars = _.map(this.props.data, function(point, i) {
      return (
        <Bar height={yScale(point)}
             width={4} // xScale.rangeBand()
             offset={xScale(i)}
             availableHeight={props.height}
             color={props.color}
             key={i} />
      )
    });

    return (
      <g>{bars}</g>
    );
  }
});

var ActivityGraph = React.createClass({
  propTypes: {
    data: React.PropTypes.array.isRequired
  },

  render: function() {
    return (
      <Chart width={this.props.width} height={this.props.height}>
        <DataSeries data={this.props.data}
                    width={this.props.width}
                    height={this.props.height}
                    color="#E7E8EB" />
      </Chart>
    );
  }
});

module.exports = ActivityGraph
