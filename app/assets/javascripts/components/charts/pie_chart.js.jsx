/** @jsx React.DOM */

// based on https://github.com/MateusZitelli/react-pie

(function() {
  var d3 = require('d3');

  var PieChart = React.createClass({
    propTypes: {
      data: React.PropTypes.array.isRequired
    },

    getInitialState: function() {
      return {
        data: this.props.data,
        arcRadius: Math.min(this.props.width, this.props.height) / 2,
      };
    },

    _me: null,

    _color: d3.scale.category20c(),

    _arc: function() {
      return d3.svg.arc()
        .outerRadius(this.state.arcRadius - 10)
        .innerRadius(0);
    },

    _pie: function(data) {
      return d3.layout.pie()
        .sort(function(a, b) {
          return a.quantity > b.quantity ? 1 : a.quantity < b.quantity ? -1 : 0;
        })
        .value(function(d) { return d.quantity; }).call(null, data);
    },

    _renderGraph: function() {
      var _this = this;

      // Based on http://bl.ocks.org/mbostock/3887235
      if(!this._me){
        this._me = d3.select(this.getDOMNode()).append('g')
        .attr(
          "transform",
          "translate(" +
            this.props.width / 2 + "," +
            this.props.height / 2 +
          ")"
        );
      }

      var g = this._me.selectAll(".arc")
        .data(this._pie(this.state.data))
        .enter().append("g")
        .attr("class", "arc");

      var dataLength = this.props.data.length;
      console.log(this.state.data);
      g.append("path")
        .attr("d", this._arc())
        .style("fill", function(d, i) {
          return _this._color(d.data.quantity);
        });

      // FIXME: The labels should show up as tooltips at the very least
      //        See: http://jsfiddle.net/thudfactor/HdwTH/
      g.append("text")
        .attr("transform", function(d) {
          return "translate(" + _this._arc().centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d.data.text; });
    },

    componentDidMount: function() {
      this._renderGraph();
    },

    shouldComponentUpdate: function(nextProps) {
      this._renderGraph();
      return false;
    },

    render: function() {
      return (
        <svg width="100%" height={this.props.height}></svg>
      );
    }
  });

  if (typeof module.exports !== 'undefined') {
    module.exports = PieChart;
  }
})();
