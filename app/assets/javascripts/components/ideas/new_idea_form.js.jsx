var FormGroup = require('../form_group.js.jsx');
var NewComment = require('../news_feed/new_comment.js.jsx');

var NewIdeaForm = React.createClass({
  displayName: 'NewIdeaForm',

  onPreviewClick: function() {

  },

  render: function() {
    return (
      <form>
        <div className="px4 form-group">
          <label>What's the elevator pitch?</label>
          <input type="text" className="form-control" limit={60} />
        </div>

        <hr style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <div className="px4 form-group">
          <label>Describe it in more detail</label>
          <NewComment canContainWork={false}
              hideAvatar={true}
              hideButtons={true}
              placeholder={''}
              thread="new-idea"
              url="/ideas" />
        </div>

        <hr style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <div className="px4 form-group">
          <fieldset>
            <label>What do you want to do with this idea?</label>
            <div className="radio">
              <label key="founder-option">
                <input type="radio" ref="founder" />
                I want to be the founder.
                <p className="gray-2">
                  As a founder, you determine the course of the app. If you
                  decide Assembly is not for you, you can remove the idea before
                  you start building it here.
                </p>
              </label>

              <label key="non-founder-option">
                <input type="radio" ref="non-founder" />
                I just want to share the idea and let someone else be a founder.
                <p className="gray-2">
                  You don't have to be a founder of the app, you can just drop
                  it off, or even work on it but leave the founding role to
                  someone else.
                </p>
              </label>
            </div>
          </fieldset>
        </div>

        <hr className="py0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <div className="clearfix px4 mb3">
          <div className="left">
            <small>
              <a href="#" className="gray-2" style={{ textDecoration: 'underline' }}>
                Already have a product started?
              </a>
            </small>
          </div>

          <div className="right">
            <button type="button" className="_button pill theme-green shadow text-shadow border" onClick={this.onPreviewClick}>
              <span className="title">Preview your idea</span>
            </button>
          </div>
        </div>
      </form>
    );
  }
});

module.exports = NewIdeaForm;
