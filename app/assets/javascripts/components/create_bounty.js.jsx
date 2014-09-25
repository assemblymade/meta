/** @jsx React.DOM */

(function(){
  var Lightbox = require('./lightbox.js.jsx')

  var CreateBounty = React.createClass({
    getDefaultProps: function() {
      return {
        csrf: document.getElementsByName('csrf-token')[0].content
      };
    },

    render: function() {
      return <Lightbox title="Create a bounty">
        <form accept-charset="UTF-8" action={this.props.url} className="new_task" id="new_task" name="task[title]" type="text" method="post">
          <div className="modal-body">
            <div className="hide">
              <input name="authenticity_token" type="hidden" value={this.props.csrf} />
              <select type="hidden" id="tag-list-hack" name="task[tag_list][]" multiple="true"></select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input autofocus="autofocus" defaultValue={this.props.title} className="form-control" data-validate-length="2" id="task_title" name="task[title]" type="text" />
            </div>

            <div className="form-group">
              <label className="control-label">
                Description
              </label>
              <MarkdownEditor name="task[description]" required="true" />
            </div>

            <h6 className="omega">Initial Offer</h6>
            <div className="well">
              <InitialOffer product={this.props.product} maxOffer={this.props.maxOffer} averageBounty={this.props.averageBounty} />
            </div>

            <h6>Tags</h6>
            <TagList destination={true} newBounty={true}  />

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
    },

    componentDidMount: function() {
      $(this.getDOMNode()).modal({
        show: true
      }).on('hidden.bs.modal', this.props.onHidden)
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = CreateBounty
  }

  window.CreateBounty = CreateBounty
})()
