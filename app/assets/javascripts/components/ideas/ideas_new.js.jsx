'use strict';

const Drawer = require('../ui/drawer.js.jsx');
const Tile = require('../ui/tile.js.jsx')
const IdeaForm = require('./idea_form.js.jsx');
const Icon = require('../ui/icon.js.jsx')

let IdeasNew = React.createClass({
  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = 'Ideas · New';
  },

  getInitialState() {
    return {
      isDrawerOpen: false
    };
  },

  handleHowItWorksClick(e) {
    e.preventDefault();

    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  render() {
    return (
      <div className="container">
        <div className="clearfix mt4 mb4">
          <div className="col-8 mx-auto">
            <Tile>
              <div className="p4">
                <div className="mb4 h1 yellow center">
                  <Icon icon="lightbulb-o" />
                </div>

                <IdeaForm />
              </div>
            </Tile>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeasNew;
