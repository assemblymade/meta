var Drawer = require('../ui/drawer.js.jsx');
var IdeaContainer = require('./idea_container.js.jsx');
var NewIdeaForm = require('./new_idea_form.js.jsx');

var IdeasNew = React.createClass({
  displayName: 'IdeasNew',

  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
      ]),
    query: React.PropTypes.object
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
      <IdeaContainer navigate={this.props.navigate} showRelatedIdeas={false}>
        <div className="clearfix py2">
          <div className="left px4">
            <h4 className="mb0 mt0">What's your big idea?</h4>
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
          <div className="px3 gray-1">
            <p className="px3">
              After you submit your idea, you'll hash out the specifics of your
              project with the Assembly community. Gain enough traction (through
              hearts on your idea), and you'll be ready to launch!
            </p>
          </div>
        </Drawer>

        <hr className="mt0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <NewIdeaForm />
      </IdeaContainer>
    );
  }
});

module.exports = IdeasNew;
