/** @jsx React.DOM */

// TODO: Tidy up shared state

/**
 * Right now, both the table and the meter have
 * all of the financials in state; it would be
 * better to move all of this to the FinancialsStore
 */

var FinancialsStore = {
  getMonth: function() {
    return this.month;
  },

  setMonth: function(month) {
    this.month = month;
  }
};

var FinancialsActions = {
  addChangeListener: function(event, callback) {
    this.listeners = this.listeners || {};
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback)
  },

  sendChange: function(event, state) {
    _.each(this.listeners[event], function(callback) {
      callback(state);
    });
  }
};

var Financials = React.createClass({
  componentWillMount: function() {
    this.setState({
      financials: {
        January: 27732,
        February: 20704,
        March: 34020,
        April: 30074,
        May: 26634
      }
    });
  },

  render: function() {
    var name = this.props.product.name;
    var costs = "3572";
    var annuity = "20000";

    return (
      <div className="financials">
        <FinancialsKey
            product={this.props.product}
        />

        <FinancialsMeter
            product={this.props.product}
            financials={this.state.financials}
            costs={costs}
            annuity={annuity}
        />

        <FinancialsTable
            product={this.props.product}
            financials={this.state.financials}
            costs={costs}
            annuity={annuity}
        />
      </div>
    );
  }
});

var FinancialsKey = React.createClass({
  componentWillMount: function() {
    this.setState({
      month: 'January'
    })
  },

  componentDidMount: function() {
    FinancialsActions.addChangeListener('monthChanged', this._onChange)
  },

  render: function() {
    // TODO: Break out dl-inline styles into reusable SCSS components
    return (
      <div>
        <dl>
          <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#5290d2'}}></dt>
          <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>{this.props.product.name}</dd>
          <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#d05555'}}></dt>
          <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>Expenses (hosting, maintenance, etc.)</dd>
          <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#eebb20'}}></dt>
          <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>App Coin holders</dd>
        </dl>
        <strong>{this.state.month}</strong>
      </div>
    );
  },

  _onChange: function() {
    this.setState({ month: FinancialsStore.getMonth() });
  }
});

var FinancialsMeter = React.createClass({
  componentWillMount: function() {
    this.setState({
      month: 'January'
    })
  },

  componentDidMount: function() {
    FinancialsActions.addChangeListener('monthChanged', this._onChange)
  },

  _onChange: function(state) {
    this.setState({ month: FinancialsStore.getMonth() })
  },

  render: function() {
    var name = this.props.product.name;
    var total = this.props.financials[this.state.month];
    var costs = this.props.costs;

    var profit = calculateProfit(total, costs);
    var annuity = calculateAnnuity(total, costs, this.props.annuity)
    var communityShare = calculateCommunityShare(total, costs, this.props.annuity);

    var annuityWidth = annuity / total * 100;
    var costsWidth = costs / total * 100;
    var communityWidth = communityShare / total * 100;

    return (
      <div className="progress">
        <div id={name + '-meter'}
             className="progress-bar"
             role="progress-bar"
             style={{ width: annuityWidth + '%' }}>
          <span>{'$' + numeral(annuity).format('0,0')}</span>
        </div>
        <div id='costs-share'
             className="progress-bar progress-bar-danger"
             role="progress-bar"
             style={{ width: costsWidth + '%' }}>
          <span>{'$' + numeral(costs).format('0,0')}</span>
        </div>
        <div id='community-meter'
             className="progress-bar progress-bar-warning"
             role="progress-bar"
             style={{ width: communityWidth + '%'}}>
          <span>{'$' + numeral(communityShare).format('0,0')}</span>
        </div>
      </div>
    );
  }
});

var FinancialsTable = React.createClass({
  componentWillMount: function() {
    this.setState({
      month: 'January'
    })
  },

  componentDidMount: function() {
    FinancialsActions.addChangeListener('monthChanged', this._onChange)
  },

  _onChange: function(state) {
    this.setState({ month: FinancialsStore.getMonth() })
  },

  render: function() {
    var name = this.props.product.name;

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th></th>
              <th className="text-left">
                Total revenue
              </th>
              <th className="text-right">
                {name}
              </th>
              <th className="text-right">
                Expenses
              </th>
              <th className="text-right">
                App Coin holders
              </th>
            </tr>
          </thead>
          <tbody>
            {this.tBody()}
          </tbody>
        </table>
      </div>
    );
  },

  tBody: function() {
    var self = this;
    var financials = this.props.financials;
    var costs = this.props.costs;

    return _.map(Object.keys(financials), function mapFinancials(month) {
      var total = financials[month];

      var profit = calculateProfit(total, costs);
      var annuity = calculateAnnuity(total, costs, self.props.annuity)
      var communityShare = calculateCommunityShare(total, costs, self.props.annuity);

      return (
        self.tRow(month, total, annuity, communityShare)
      );
    });
  },

  tRow: function(month, total, annuity, community) {
    return (
      <tr style={{cursor: 'pointer'}} onMouseOver={this.monthChanged(month)} key={month}>
        <td id={'financials-' + month}>{month}</td>
        <td>{'$' + numeral(total).format('0,0')}</td>
        <td className="text-right">{'$' + numeral(annuity).format('0,0')}</td>
        <td className="text-right">{'$' + numeral(this.props.costs).format('0,0')}</td>
        <td className="text-right">{'$' + numeral(community).format('0,0')}</td>
      </tr>
    );
  },

  monthChanged: function(month) {
    return function(e) {
      FinancialsStore.setMonth(month);
      FinancialsActions.sendChange('monthChanged', month);
    };
  }
});

function calculateProfit(total, costs) {
  total = parseInt(total);
  costs = parseInt(costs);

  return total - costs;
}

function calculateAnnuity(total, costs, annuity) {
  total = parseInt(total, 10);
  costs = parseInt(costs, 10);
  annuity = parseInt(annuity, 10);

  var profit = calculateProfit(total, costs);

  return profit < annuity ? profit : annuity;
}

function calculateCommunityShare(total, costs, annuity) {
  total = parseInt(total, 10);
  costs = parseInt(costs, 10);
  annuity = parseInt(annuity, 10);

  var profit = calculateProfit(total, costs);

  return profit < annuity ? 0 : profit - annuity;
}
