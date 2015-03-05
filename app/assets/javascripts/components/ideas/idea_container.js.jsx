'use strict';

const Icon = require('../ui/icon.js.jsx');
const Tile = require('../ui/tile.js.jsx');

let IdeaContainer = React.createClass({
  propTypes: {
    showRelatedIdeas: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      showRelatedIdeas: true
    }
  },

  render() {
    let showRelatedIdeas = this.props.showRelatedIdeas;
    let leftColumnClasses = React.addons.classSet({
      col: showRelatedIdeas,
      'col-8': true,
      'mx-auto': !showRelatedIdeas,
      'px2': true
    });

    let rightColumnClasses = React.addons.classSet({
      'display-none': !showRelatedIdeas,
      col: showRelatedIdeas,
      'col-4': showRelatedIdeas,
      'px2': showRelatedIdeas
    });

    return (
      <div className="container">
        <div className="clearfix mxn2 py3">
          <div className={leftColumnClasses}>
            <a href="/ideas" className="h6 bold gray-2">
              <Icon icon="chevron-left" /> All ideas
            </a>
          </div>

          <div className={rightColumnClasses}>
            <h5 className="mt2 mb2">Other product ideas</h5>
          </div>
        </div>

        <div className="clearfix mxn2">
          <div className={leftColumnClasses}>
            <Tile>
              {this.props.children}
            </Tile>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeaContainer;
