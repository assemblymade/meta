const Tile = require('./ui/tile.js.jsx');
const Button = require('./ui/button.js.jsx');

var Checklist = React.createClass({

  propTypes: {
    checklistItems: React.PropTypes.array
  },

  renderChecklistItems: function() {
    return (
      _.map(this.props.checklistItems, function(checklistItem) {
        if (checklistItem.state === "passed") {
          return (
            <li>
              <span className="fa green fa-check-square-o" />
              <span className="ml2">{checklistItem.name}</span>
            </li>
          )
        }
        else {
          return (
            <li>
              <span><input type="checkbox"/></span>
              <span className="ml2">{checklistItem.name}</span>
              <small className="gray-4 ml2">{checklistItem.progressText}</small>
            </li>
          )
        }

      })
    )
  },

  render: function() {
    return (
      <Tile>
        <h4 className="center">Move Your Idea Forward</h4>
        <div className="p3">
           <ul style={{listStyle: 'none'}}>
            {this.renderChecklistItems()}
           </ul>
        </div>

        <div className="center mb2">
          <Button>Progress to Recruitment</Button>
        </div>

      </Tile>
    )
  }
})

module.exports = Checklist
