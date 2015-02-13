'use strict';

const Drawer = require('../ui/drawer.js.jsx');
const EditIdeaForm = require('./edit_idea_form.js.jsx');
const IdeaContainer = require('./idea_container.js.jsx');
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
      this.setState(this.getInitialState());
    },

    render() {
      return (
        <IdeaContainer showRelatedIdeas={false}>
          <div className="clearfix py2 border-bottom border-gray">
            <div className="left px4">
              <h4 className="mb0 mt0">Edit your idea</h4>
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

          <div className="px4">
            <Drawer open={this.state.isDrawerOpen}>
              <div className="px3 mt2 gray-1">
                <p className="px3">
                  After you submit your idea, you'll hash out the specifics of your{' '}
                  project with the Assembly community. Gain enough traction (through{' '}
                  hearts on your idea), and you'll be ready to launch! Others{' '}
                  will jump in and help shape your idea &mdash; you'll be building{' '}
                  alongside an awesome community of talented folks from all over.
                </p>
              </div>
            </Drawer>
          </div>

          <EditIdeaForm idea={this.state.idea} />
        </IdeaContainer>
      );
    }
  });

  module.exports = IdeaEdit;
