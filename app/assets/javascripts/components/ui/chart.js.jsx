var Chart = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    options: React.PropTypes.object.isRequired
  },

  render() {
    return <div id={this.props.id} />
  },

  componentDidMount() {
    this.createChart()
  },

  createChart() {
    c3.generate(this.props.options)
  }
})

module.exports = Chart
