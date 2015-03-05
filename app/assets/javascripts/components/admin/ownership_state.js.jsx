

(function() {
  var OwnershipState = React.createClass({
    getInitialState: function() {
      return {
        ownership_status: this.props.ownership_status,
        state: this.props.ownership_status.state,
        pending_until: this.props.ownership_status.pending_until,
        owned_at: this.props.ownership_status.owned_at
      }
    },

    render: function() {
      var classes = React.addons.classSet({
        'label': true,
        'label-danger': this.state.state == 'unowned',
        'label-success': this.state.state == 'owned',
        'label-warning': this.state.state == 'requested',
        'label-info': this.state.state == 'pending',
        'label-default': this.state.state == 'not_applicable'
      })
      var dateString;
      if (this.state.state == 'pending'){
        dateString = 'Available ' + moment(this.state.pending_until).format('MM/DD/YY')
      } else if (this.state.state == 'owned'){
        dateString = moment(this.state.owned_at).format('MM/DD/YY')
      }
      return (
        <div>
          <div className="dropdown" style={{"display":"inline-block"}}>
            <a data-toggle="dropdown" style={{"cursor":"pointer"}}>
              <span className={classes}>{this.state.state}</span>
              {this.state.state_updated_at}
            </a>
            <ul className="dropdown-menu">
              {this.listItems()}
            </ul>
          </div>
          <time className="p1">{dateString}</time>
        </div>
      )
    },

    eventsForState: function() {
      return {
        unowned: ['request', 'set pending 30', 'set pending 60', 'set not applicable'],
        pending: ['owned', 'request', 'undo'],
        requested: ['owned', 'undo'],
        owned: ['undo', 'unown'],
        not_applicable: ['unown']
      }[this.state.state] || [];
    },

    listItems: function() {
      return this.eventsForState().map(function(u){
        return (
          <li key={u}>
            <a onClick={this.updateState(u)}>
              <span className="btn btn-xs btn-default">{u}</span>
            </a>
          </li>
        )
      }.bind(this))
    },

    updateState: function(event) {
      return function() {
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'PATCH',
          data: { event: event },
          success: function(ownership_status) {
            this.setState({
              state: ownership_status.state,
              pending_until: ownership_status.pending_until,
              owned_at: ownership_status.owned_at
            });
          }.bind(this)
        });
      }.bind(this)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = OwnershipState;
  }

  window.OwnershipState = OwnershipState;
})();
