

(function() {
  var ProductState = React.createClass({
    getInitialState: function() {
      return {
        state: this.props.state
      }
    },

    render: function() {
      return (
        <div className="dropdown" style={{"display":"inline-block"}}>
          <a data-toggle="dropdown" style={{"cursor":"pointer"}}>
            <span>{this.state.state}</span>
          </a>
          <ul className="dropdown-menu">
            {this.listItems()}
          </ul>
        </div>
      )
    },

    eventsForState: function() {
      return {
        stealth: ['submit'],
        reviewing: ['accept', 'reject'],
        team_building: ['greenlight', 'reject'],
        greenlit: ['launch', 'remove'],
        profitable: ['remove']
      }[this.state.state] || [];
    },

    listItems: function() {
      return this.eventsForState().map(function(u){
        return (
          <li key={u}>
            <a onClick={this.updateState(u)}>
              <span>{u}</span>
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
          success: function(product) {
            this.setState({
              state: product.state
            });
          }.bind(this)
        });
      }.bind(this)
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ProductState;
  }

  window.ProductState = ProductState;
})();
