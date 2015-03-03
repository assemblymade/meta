'use strict';

const Drawer = require('../ui/drawer.js.jsx');
const IdeaForm = require('./idea_form.js.jsx');
const IdeaContainer = require('./idea_container.js.jsx');
const IdeaHowItWorks = require('./idea_how_it_works.js.jsx');
const IdeaStore = require('../../stores/idea_store');
const Tile = require('../ui/tile.js.jsx');

let IdeaEdit = React.createClass({
  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    IdeaStore.addChangeListener(this.onIdeaChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      isDrawerOpen: false
    };
  },

  handleHowItWorksClick() {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  onIdeaChange() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  render() {
    return (
      <IdeaContainer showRelatedIdeas={false}>
        <Tile>
          <div className="p4">
            <div className="mb4 h1 yellow center">
              <Icon icon="lightbulb-o" />
            </div>

            <IdeaForm initialIdea={this.state.idea} />
          </div>
        </Tile>
      </IdeaContainer>
    );
  }
});

module.exports = IdeaEdit;
