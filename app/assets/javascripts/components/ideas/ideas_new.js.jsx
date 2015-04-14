'use strict';

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
      <article className="sm-col-11 md-col-6 mx-auto mt3 p4 bg-white rounded shadow">
        <div className="center mb3">
          <div className="mb3 h1 yellow">
            <Icon icon="lightbulb-o" />
          </div>

          <h3 className="mt0 mb1">Turn your idea into a great product</h3>
          <h4 className="mt0 mb0 regular gray-2">If your idea gets enough hearts, the community will help you build it.</h4>

        <IdeaForm />
      </article>
    );
  }
});

module.exports = IdeasNew;
