/** @jsx React.DOM */

(function() {
  var Urgency = React.createClass({
    getInitialState: function() {
      return { label: this.props.initialLabel }
    },

    render: function() {
      return (
        <div className="dropdown" style={{"display":"inline-block"}}>
          <a data-toggle="dropdown" href="#">
            <span className={this.labelClass(this.state.label)}>{this.state.label}</span>
          </a>
          <ul className="dropdown-menu">
            {this.listItems()}
          </ul>
        </div>
      )
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
