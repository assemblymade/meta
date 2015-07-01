

var FormGroup = require('./form_group.js.jsx');
(function() {
  var InviteBountyForm = React.createClass({
    getDefaultProps: function() {
      return { model: 'invite' };
    },

    getInitialState: function() {
      return {
        alertDisplay: 'none',
        errors: {},
        usernameOrEmail: ''
      };
    },

    handleInviteeChange: function(text) {
      this.setState({
        usernameOrEmail: text
      });
    },

    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <div className="p3">
            <h2 className="mt0">Ask a friend</h2>
            <p className="gray-2">Know somebody who could help with this? Anybody can help out, all you need to do is ask.</p>

            <div className="alert alert-info alert-dismissable" role="alert" style={{ display: this.state.alertDisplay }}>
              Sweet! We've invited {this.state.usernameOrEmail} to help out.
            </div>
          </div>

          <hr />

          <div className="p3">
            <FormGroup error={this.state.errors.username_or_email}>
              <label className="control-label">Assembly Username or email address</label>
              <TypeaheadUserInput name="invite[username_or_email]" type="text" placeholder="friend@example.com" className="form-control" onTextChange={this.handleInviteeChange} />
            </FormGroup>

            <FormGroup error={this.state.errors.note}>
              <label>Personal note</label>
              <textarea name="invite[note]" placeholder={this.props.notePlaceholder} className="form-control" />
            </FormGroup>

            <FormGroup error={this.state.errors.tip_cents}>
              <label>Leave a tip</label>
              <p className="h6">Start off on the right foot; generosity always pays off.</p>

              <div className="btn-group center" data-toggle="buttons" style={{width:'100%'}}>
                <label className="btn btn-default active" style={{width:'34%'}}>
                  <input type="radio" name="invite[tip_cents]" value="10" defaultChecked={true} />
                  <span className="icon icon-app-coin yellow"></span><span className="yellow">10</span>
                </label>
                <label className="btn btn-default" style={{width:'33%'}}>
                  <input type="radio" name="invite[tip_cents]" value="100"/>
                  <span className="icon icon-app-coin yellow"></span><span className="yellow">100</span>
                </label>
                <label className="btn btn-default" style={{width:'33%'}}>
                  <input type="radio" name="invite[tip_cents]" value="500"/> <span className="icon icon-app-coin yellow"></span><span className="yellow">500</span>
                </label>
              </div>
            </FormGroup>
          </div>

          <hr/>

          <div className="p3">
            <input type="hidden" name="invite[via_type]" value={this.props.via_type} />
            <input type="hidden" name="invite[via_id]" value={this.props.via_id} />
            <button className="btn btn-primary btn-block" style={{ marginBottom: 20 }}>Send message</button>
          </div>
        </form>
      )
    },

    handleSubmit: function(e) {
      e.preventDefault();

      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: $(e.target).serialize(),
        success: function(data) {
          this.props.onSubmit(data);
          this.setState({
            alertDisplay: 'inline-block'
          });

          // FIXME: (pletcher) this is super gross
          setTimeout(function() {
            $('.modal').modal('hide');
          }, 1000);
        }.bind(this),
        error: function(xhr, status, err) {
          if (xhr.responseJSON && xhr.responseJSON.errors) {
            this.handleErrors(xhr.responseJSON.errors)
          }
        }.bind(this)
      });
    },

    handleErrors: function(errors) {
      this.setState({ errors: errors })
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InviteBountyForm;
  }

  window.InviteBountyForm = InviteBountyForm;
})();
