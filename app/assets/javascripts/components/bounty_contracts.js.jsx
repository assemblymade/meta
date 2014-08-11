/** @jsx React.DOM */

(function() {
  var BountyContracts = React.createClass({
    render: function() {
      var contracts = this.props.contracts
      return <table className="table table-condensed small">
        <tbody>
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

          <BountyContract label="You would earn"
            coins={contracts.earnable} />
        </tbody>
      </table>;
    }
  });

  var BountyContract = React.createClass({
    render: function() {
      return <tr>
        <td className="text-muted">
          <span data-toggle="tooltip" title={this.props.tooltip} data-placement="left">
            {this.props.label}
          </span>
        </td>
        <td className="text-right">
          <span className="text-coins">
            <span className="icon icon-app-coin"></span>
            <span className="js-coins">{numeral(this.props.coins).format('0,0')}</span>
          </span>
        </td>
      </tr>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyContracts;
  }

  window.BountyContracts = BountyContracts;
})();
