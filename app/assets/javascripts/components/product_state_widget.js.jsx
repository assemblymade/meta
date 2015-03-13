'use strict';

const Button = require('./ui/button.js.jsx');
const Tile = require('./ui/tile.js.jsx');
const Checklist = require('./checklist.js.jsx');
const ProductStateIndicator = require('./product_state_indicator.js.jsx');

var ProductStateWidget = React.createClass({

  propTypes: {
    entity: React.PropTypes.object.isRequired,
    stages: React.PropTypes.array.isRequired,
    activeStage: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      stages: this.props.stages
    }
  },

  getDefaultProps: function() {
    return {}
  },

  render: function() {
    return (
      <Tile>
        <div className="p3">
          <ProductStateIndicator labeled={false} activeStage={1} />
          <Checklist entity_type={"Idea"} entity={this.props.entity} />
        </div>
      </Tile>
    )
  }
})

module.exports = ProductStateWidget

