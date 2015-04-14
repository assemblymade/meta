'use strict';

const Sheet = require('../ui/sheet.js.jsx');
const Drawer = require('../ui/drawer.js.jsx');
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
      <Sheet>
        <header className="center mb3">
          <Icon icon="lightbulb-o" extraClasses="mb3 h1 yellow" />

          <h3 className="mt0 mb1">Turn your idea into a great product</h3>
          <h4 className="mt0 mb0 regular gray-2">If your idea gets enough hearts, the community will help you build it.</h4>
        </header>

        <IdeaForm />
      </Sheet>
    );
  }
});

module.exports = IdeasNew;
