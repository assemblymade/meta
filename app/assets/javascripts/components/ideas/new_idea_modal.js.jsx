var Icon = require('../ui/icon.js.jsx');
var Lightbox = require('../lightbox.js.jsx');
var NewIdeaForm = require('./new_idea_form.js.jsx');

var NewIdeaModal = React.createClass({
  displayName: 'NewIdeaModal',

  propTypes: {
    modalShown: React.PropTypes.bool.isRequired,
    onHidden: React.PropTypes.func.isRequired
  },

  render: function() {
    if (this.props.modalShown) {
      var title = (
        <div className="clearfix mb2">
          <div className="left px2">
            <h4 className="mb0 mt0">What's your big idea?</h4>
          </div>

          <div className="right px2">
            <small>
              <a href="#">
                How it works{' '}
                <span style={{ color: '#fe8100' }}>
                  <Icon icon="question-circle" />
                </span>
              </a>
            </small>
          </div>
        </div>
      );

      return (
        <Lightbox onHidden={this.props.onHidden} title={title}>
          <NewIdeaForm />
        </Lightbox>
      );
    }

    return null;
  }
});

module.exports = NewIdeaModal;
