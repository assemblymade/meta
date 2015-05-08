'use strict';

const Drawer = require('../ui/drawer.js.jsx');
const IdeaForm = require('./idea_form.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const Tile = require('../ui/tile.js.jsx');

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
      <div className="sm-col-11 md-col-8 mx-auto mt3 mb4">
        <Tile>
          <div className="mt3 mb4 px4">
            <img className="mx-auto block" src="https://d1015h9unskp4y.cloudfront.net/attachments/da827015-7f37-4fdb-80d0-b8d68ae71f32/asm_mountain_360.png" />

            <h3 className="mb1 center">Turn your idea into a great product</h3>
            <h4 className="mt0 mb3 regular gray-2 center">The community collaborates to build the best ideas into products.</h4>

            <IdeaForm />
          </div>
        </Tile>
      </div>
    );
  }
});

module.exports = IdeasNew;
