var Lightbox = require('./lightbox.js.jsx')
var NewComment = require('./news_feed/new_comment.js.jsx');
var qs = require('qs');
var url = require('url');
var UserStore = require('../stores/user_store');

var CreateBounty = React.createClass({
  propTypes: {
    onHidden: React.PropTypes.func.isRequired,
    title: React.PropTypes.string,
    url: React.PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    var csrfTokenElement = document.getElementsByName('csrf-token')[0];

    if (csrfTokenElement) {
      return {
        csrf: csrfTokenElement.content
      };
    }
  },

  getInitialState: function() {
    return {
      changed: false
    };
  },

  handleChange: function() {
    this.setState({
      changed: true
    });
  },

  renderBountyOffer: function() {
    var currentUser = UserStore.getUser();

    if (currentUser.is_core) {
      return <CreateBountyOffer {...this.props} />
    }
  },

  render: function() {
    return (
      <Lightbox title="Create a bounty" id={this.props.id}>
        <form acceptCharset="UTF-8"
            action={this.props.url}
            className="new_task"
            id="new_task"
            name="task[title]"
            type="text"
            method="post">
          <div className="modal-body">
            <div className="hide">
              <input name="authenticity_token" type="hidden" value={this.props.csrf} />
              <select type="hidden" id="tag-list-hack" name="task[tag_list][]" multiple="true"></select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <TypeaheadUserInput autofocus="autofocus"
                     defaultValue={this.props.title}
                     className="form-control"
                     data-validate-length="2"
                     id="task_title"
                     name="task[title]"
                     type="text"
                     required="true"
                     onTextChange={this.handleChange} />
            </div>

            <div className="form-group">
              <label className="control-label">
                Description
              </label>
              <NewComment
                  name="task[description]"
                  thread="task_description"
                  hideButtons={true} url="#"
                  user={UserStore.getUser()}
                  initialRows={4}
                  hideAvatar={true} />
            </div>

            <div className="form-group mb2">
              {this.renderBountyOffer()}
            </div>

            <h6>Tags</h6>
            <TagList destination={true} newBounty={true} tags={this.prefilledTags()} />

            <TextInput width="125px" size="small" label="Add tag" prepend="#" prompt="Add" />

            <h6>Suggested tags</h6>
            <TagList tags={window.app.suggestedTags()} destination={false} />

          </div>
          <div className="modal-footer form-actions">
            <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
            <button className="btn btn-primary" name="button" type="submit">Create bounty</button>
          </div>
        </form>
      </Lightbox>
    );
  },

  componentDidMount: function() {
    var modal = $(this.getDOMNode()).modal({ show: true })

    modal.on('hide.bs.modal', this.confirmHide)
    modal.on('hidden.bs.modal', this.props.onHidden)
  },

  confirmHide: function() {
    if (this.state.changed) {
      return confirm('Are you sure you want to discard this unsaved bounty?');
    }
  },

  prefilledTags: function() {
    var tags = (qs.parse(
      url.parse(
        window.location.toString()
      ).query
    ) || {}).tags;

    if (tags) {
      return tags.split(',');
    }
  }
})

module.exports = window.CreateBounty = CreateBounty;
