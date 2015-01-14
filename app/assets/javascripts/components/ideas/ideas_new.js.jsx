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

  render() {
    return (
      <IdeaContainer navigate={this.props.navigate}>
        <div className="clearfix py2">
          <div className="left px2">
            <h4 className="mb0 mt0">What's your app idea?</h4>
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

        <NewIdeaForm />
      </IdeaContainer>
    );
  }
});

module.exports = IdeasNew;
