

(function() {
  var BountyContracts = React.createClass({
    render: function() {
      var contracts = this.props.contracts
      return (
        <ul className="list-reset">
          {contracts.author ? <BountyContract
            tooltip={"Tip to @" + contracts.author.username + "for creating this Bounty"}
            label="Bounty Author"
            coins={contracts.author.percentage * contracts.total} /> : null}

          {contracts.core_team ? <BountyContract
            tooltip={"Tip to the "+ this.props.product.name + " Core Team"}
            label="Core Team"
            coins={contracts.core_team.percentage * contracts.total} /> : null}

          {contracts.others.map(function(c){
            <BountyContract label={"@" + c.username}
              tooltip={"Tip to @" + c.username}
              coins={c.percentage * contracts.total} />
          })}
        </ul>
      )
    }
  });

  var BountyContract = React.createClass({
    render: function() {
      return (
        <li>
          <span className="yellow mt0 mb0" style={{ display: 'inline-block', width: '60px' }}>
            <span className="icon icon-app-coin"></span>
            {' '}
            {numeral(this.props.coins).format('0,0')}
          </span>
          {' '}
          to 
          {' '}
          <span data-toggle="tooltip" title={this.props.tooltip} data-placement="left">
            {this.props.label}
          </span>
          {' '}
        </li>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyContracts;
  }

  window.BountyContracts = BountyContracts;
})();
