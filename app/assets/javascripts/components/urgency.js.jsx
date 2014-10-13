/** @jsx React.DOM */

(function() {
  var Urgency = React.createClass({
    getInitialState: function() {
      return { label: this.props.initialLabel }
    },

    render: function() {
      if(this.props.state == 'open') {
        return this.renderOpen();
      } else {
        return this.renderNotOpen();
      }
    },

    renderOpen: function() {
      return (
        <div className="dropdown" style={{"display":"inline-block"}}>
          <a data-toggle="dropdown" style={{"cursor":"pointer"}}>
            <span className={this.labelClass(this.state.label)}>{this.state.label}</span>
          </a>
          <ul className="dropdown-menu">
            {this.listItems()}
          </ul>
        </div>
      )
    },

    renderNotOpen: function() {
      switch(this.props.state) {
        case 'resolved':
          return <span className="label label-info">DONE</span>;
        case 'closed':
          return <span className="label label-default">CLOSED</span>;
        default:
          return <span className={"label label-" + this.props.initialLabel.toLowerCase()}>{this.props.initialLabel}</span>
      }
    },

    listItems: function() {
      return this.props.urgencies.map(function(u){
        return (
          <li key={u}>
            <a onClick={this.updateUrgency(u)}>
              <span className={this.labelClass(u)}>{u}</span>
            </a>
          </li>
        )
      }.bind(this))
    },

    updateUrgency: function(label) {
      return function() {
        this.setState({label: label})
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'PATCH',
          data: { urgency: label.toLowerCase() }
        });
      }.bind(this)
    },

    labelClass: function(urgency) {
      return "label label-" + urgency.toLowerCase()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Urgency;
  }

  window.Urgency = Urgency;
})();
