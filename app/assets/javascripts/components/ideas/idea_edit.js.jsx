var EditIdeaForm = require('./edit_idea_form.js.jsx');
var IdeaContainer = require('./idea_container.js.jsx');
var IdeaStore = require('../../stores/idea_store');

var IdeaEdit = React.createClass({
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
      };
    },

    onIdeaChange() {
      this.setState(this.getInitialState());
    },

    render() {
      return (
        <IdeaContainer navigate={this.props.navigate} showRelatedIdeas={false}>
          <div className="clearfix py2">
            <div className="left px2">
              <h4 className="mb0 mt0">Edit your idea</h4>
            </div>

            <div className="right px2">
              <small className="mt2">
                <a href="#">
                  How it works{' '}
                  <span style={{ color: '#fe8100' }}>
                    <Icon icon="question-circle" />
                  </span>
                </a>
              </small>
            </div>
          </div>

          <hr className="mt0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

          <EditIdeaForm idea={this.state.idea} />
        </IdeaContainer>
      );
    }
  });

  module.exports = IdeaEdit;
