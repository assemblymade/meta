/** @jsx React.DOM */

(function(){
  var Lightbox = require('./lightbox.js.jsx')

  var CreateBounty = React.createClass({
    getDefaultProps: function() {
      return {
        csrf: document.getElementsByName('csrf-token')[0].content
      };
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
              <input autofocus="autofocus" defaultValue={this.props.title} className="form-control" data-validate-length="2" id="task_title" name="task[title]" type="text" onChange={this.handleChange} />
            </div>

            <div className="form-group">
              <label className="control-label">
                Description
              </label>
              <MarkdownEditor name="task[description]" required="true" />
            </div>

            <div className="form-group">
              <div className="btn-group pull-right">
                <a className="btn btn-default btn-sm active" href="#">
                  Simple
                </a>
                <a className="btn btn-default btn-sm" href="#">
                  Advanced
                </a>
              </div>

              <label className="control-label">
                Initial Value
              </label>

              <div className="btn-group btn-group-justified py4">
                {[1000, 5000, 10000].map(function(i) {
                  return (
                    <a className="btn btn-default" href="#">
                      <div className="text-coins bold h4 align-center">
                        <span className="icon icon-app-coin"></span>
                        {' '}
                        {numeral(i).format('0,0')}
                      </div>

                      <ul className="gray h6 align-left">
                        <li className="align-left">Bug fixes</li>
                        <li className="align-left">Admin work</li>
                        <li className="align-left">Feedback</li>
                      </ul>
                    </a>
                  )
                })}
              </div>

              <p>Mockup single view, Develop an average feature, Write the homepage copy</p>

              <div className="px4 py3">
                <ul className="list-unstyled mxn4">
                  {[1000, 5000, 10000].map(function(i) {
                    return (
                      <li className="left center" style={{ width: '20%' }}>
                        <div className="text-coins bold h4 align-center">
                          <span className="icon icon-app-coin"></span>
                          {' '}
                          {numeral(i).format('0,0')}
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <input type="range" min="1" max="5" step="1" list="suggestions" />
                <datalist id="suggestions">
                  <option value="1"></option>
                  <option value="2"></option>
                  <option value="3"></option>
                  <option value="4"></option>
                  <option value="5"></option>
                </datalist>

                <ul className="list-unstyled mxn4 align-left h6">
                  <li className="left gray" style={{ width: '25%' }}>
                    <ul>
                      <li>Typos</li>
                      <li>Tweeting</li>
                      <li>Admin work</li>
                    </ul>
                  </li>
                  <li className="left gray" style={{ width: '25%' }}>
                    <ul>
                      <li>Bug fixes</li>
                      <li>Good feedback</li>
                      <li>Design tweaks</li>
                    </ul>
                  </li>
                  <li className="left gray" style={{ width: '25%' }}>
                    <ul>
                      <li>Single mockup</li>
                      <li>Feature development</li>
                      <li>Homepage copy</li>
                    </ul>
                  </li>
                  <li className="left gray" style={{ width: '25%' }}>
                    <ul>
                      <li>Entire mobile app</li>
                      <li>Signup customers</li>
                      <li>Redesign site</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="text-coins bold h1 mt1 mb1">
                <span className="icon icon-app-coin"></span>
                {' '}
                4000
              </div>
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
      var modal = $(this.getDOMNode()).modal({ show: true })
      modal.on('hide.bs.modal', this.confirmHide)
      modal.on('hidden.bs.modal', this.props.onHidden)
    },

    confirmHide: function() {
      if(this.state.changed) {
        return confirm('Are you sure you want to discard this unsaved bounty?');
      }
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = CreateBounty
  }

  window.CreateBounty = CreateBounty
})()
