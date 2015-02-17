'use strict';

const Drawer = require('../ui/drawer.js.jsx');
const EditIdeaForm = require('./edit_idea_form.js.jsx');
const IdeaContainer = require('./idea_container.js.jsx');
const IdeaHowItWorks = require('./idea_how_it_works.js.jsx');
const IdeaStore = require('../../stores/idea_store');

let IdeaEdit = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
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
        <div className="clearfix py2">
          <div className="left px4">
            <h5 className="mb0 mt0">Edit your idea</h5>
          </div>

          <div className="right px4">
            <small className="mt2">
              <a href="javascript:void(0);" onClick={this.handleHowItWorksClick}>
                How it works{' '}
                <span style={{ color: '#fe8100' }}>
                  <Icon icon="question-circle" />
                </span>
              </a>
            </small>
          </div>
        </div>

        <Drawer open={this.state.isDrawerOpen}>
          <IdeaHowItWorks />
        </Drawer>

        <EditIdeaForm idea={this.state.idea} />
      </IdeaContainer>
    );
  }
});

module.exports = IdeaEdit;
