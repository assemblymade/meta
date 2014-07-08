/** @jsx React.DOM */

var InviteBountyForm = React.createClass({
  getDefaultProps: function() {
    return { model: 'invite' }
  },
  getInitialState: function() {
    return { errors: {} }
  },

  render: function() {
    return (
      <form style={{width:300}} onSubmit={this.handleSubmit}>
        {this.props.children}
        <hr/>
        <FormGroup error={this.state.errors.username_or_email}>
          <label className="control-label">Username or email address</label>
          <input name="invite[username_or_email]" type="text" placeholder="friend@example.com" className="form-control" />
        </FormGroup>
        <FormGroup error={this.state.errors.note}>
          <label>Personal note</label>
          <textarea name="invite[note]" placeholder={this.props.notePlaceholder} className="form-control" />
        </FormGroup>
        <FormGroup error={this.state.errors.tip_cents}>
          <label>Leave a tip</label>
          <p className="text-muted">Start off on the right foot; generosity always pays off.</p>

          <div className="btn-group text-center" data-toggle="buttons" style={{width:'100%'}}>
            <label className="btn btn-default active" style={{width:'34%'}}>
              <input type="radio" name="invite[tip_cents]" value="1000" defaultChecked={true} /> <span className="icon icon-app-coin">10</span>
            </label>
            <label className="btn btn-default" style={{width:'33%'}}>
              <input type="radio" name="invite[tip_cents]" value="10000"/> <span className="icon icon-app-coin">100</span>
            </label>
            <label className="btn btn-default" style={{width:'33%'}}>
              <input type="radio" name="invite[tip_cents]" value="50000"/> <span className="icon icon-app-coin">500</span>
            </label>
          </div>
        </FormGroup>
        <hr/>
        <input type="hidden" name="invite[via_type]" value={this.props.via_type} />
        <input type="hidden" name="invite[via_id]" value={this.props.via_id} />
        <button className="btn btn-primary btn-block" style={{"margin-bottom":20}}>Send message</button>
      </form>
    )
  },

  handleSubmit: function(e) {
    e.preventDefault()
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: $(e.target).serialize(),
      success: function(data) {
        this.props.onSubmit(data)
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.responseJSON && xhr.responseJSON.errors) {
          this.handleErrors(xhr.responseJSON.errors)
        }
      }.bind(this)
    });
  },

  handleErrors: function(errors) {
    this.setState({errors: errors})
  }
})
