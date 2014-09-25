/** @jsx React.DOM */

(function() {
  var ProductStage = React.createClass({
    getInitialState: function() {
      return { label: this.props.initialLabel }
    },

    render: function() {
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

    listItems: function() {
      return this.props.stages.map(function(u){
        return (
          <li key={u}>
            <a onClick={this.updateStage(u)}>
              <span className={this.labelClass(u)}>{u}</span>
            </a>
          </li>
        )
      }.bind(this))
    },

    updateStage: function(label) {
      return function() {
        this.setState({label: label})
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'PATCH',
          data: { stage: label }
        });
      }.bind(this)
    },

    labelClass: function(stage) {
      return ""
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ProductStage;
  }

  window.ProductStage = ProductStage;
})();
