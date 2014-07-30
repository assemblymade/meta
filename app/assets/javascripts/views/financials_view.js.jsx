/** @jsx React.DOM */

// TODO: Tidy up shared state

/**
 * Right now, both the table and the meter have
 * all of the financials in state; it would be
 * better to move all of this to the FinancialsStore
 */
;(function() {
  var FinancialsStore = {
    month: 'June',
    getMonth: function() {
      return this.month;
    },

    setMonth: function(month) {
      this.month = month;
    }
  };

  var FinancialsActions = {
    addChangeListener: function(callback) {
      this.listeners = this.listeners || [];
      this.listeners.push(callback)
    },

    sendChange: function(state) {
      _.each(this.listeners, function(callback) {
        callback(state);
      });
    }
  };

  window.Financials = React.createClass({
    componentWillMount: function() {
      this.setState({
        financials: {
          January: 27732,
          February: 20704,
          March: 34020,
          April: 30074,
          May: 26632,
          June: 27334
        },
        expenses: {
          January: 2998,
          February: 4024,
          March: 3363,
          April: 3433,
          May: 3474,
          June: 3487
        }
      });
    },

    render: function() {
      var name = this.props.product.name;
      var costs = this.state.expenses[FinancialsStore.getMonth()];
      var annuity = "18000";

      return (
        <div className="financials">
          <FinancialsKey
              product={this.props.product}
          />

          <FinancialsMeter
              product={this.props.product}
              financials={this.state.financials}
              costs={this.state.expenses}
              annuity={annuity}
          />

          <FinancialsTable
              product={this.props.product}
              financials={this.state.financials}
              costs={this.state.expenses}
              annuity={annuity}
          />
        </div>
      );
    }
  });

  var FinancialsKey = React.createClass({
    componentWillMount: function() {
      this.setState({
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
    },

    render: function() {
      // TODO: Break out dl-inline styles into reusable SCSS components
      return (
        <div>
          <dl className="text-small">
            <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#48a3ed'}}></dt>
            <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>{this.props.product.name} annuity</dd>
            <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#f93232'}}></dt>
            <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>Expenses (hosting, maintenance, etc.)</dd>
            <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#fd6b2f'}}></dt>
            <dd style={{'margin-left': '5px', 'margin-right': '15px', display: 'inline', clear: 'left'}}>Assembly</dd>
            <dt style={{'width': '10px', 'height': '10px', display: 'inline-block', 'background-color': '#e9ad1a'}}></dt>
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
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
    },

    _onChange: function(state) {
      this.setState({ month: FinancialsStore.getMonth() })
    },

    render: function() {
      var name = this.props.product.name;
      var total = this.props.financials[this.state.month];
      var costs = this.props.costs[this.state.month];

      var annuity = calculateAnnuity(total, costs, this.props.annuity);
      var expenses = calculateExpenses(total, costs);
      var communityShare = calculateCommunityShare(total, costs, this.props.annuity);
      var assemblyShare = communityShare * 0.1;
      communityShare = communityShare - assemblyShare;

      var annuityWidth = annuity / total * 100;
      var costsWidth = expenses / total * 100;
      var communityWidth = communityShare / total * 100;
      var assemblyWidth = assemblyShare / total * 100 ;

      if (assemblyShare > 0) {
        assemblyWidth += 5;
        annuityWidth -= 5;
      }

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
            <span>{'$' + numeral(expenses).format('0,0')}</span>
          </div>
          <div id='assembly-share'
               className="progress-bar"
               role="progress-bar"
               style={{ width: assemblyWidth + '%', 'background-color': '#fd6b2f' }}>
            <span>{'$' + numeral(assemblyShare).format('0,0')}</span>
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
        month: FinancialsStore.getMonth()
      })
    },

    componentDidMount: function() {
      FinancialsActions.addChangeListener(this._onChange)
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
                  Expenses
                </th>
                <th className="text-right">
                  {name}
                </th>
                <th className="text-right">
                  Assembly
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

      return _.map(Object.keys(financials), function mapFinancials(month) {
        var total = financials[month];
        var costs = self.props.costs[month];

        var profit = calculateProfit(total, costs);
        var annuity = calculateAnnuity(total, costs, self.props.annuity);
        var expenses = calculateExpenses(total, costs);
        var communityShare = calculateCommunityShare(total, costs, self.props.annuity);
        var assemblyShare = communityShare * 0.1;

        return (
          self.tRow(month, total, annuity, expenses, assemblyShare, communityShare)
        );
      });
    },

    tRow: function(month, total, annuity, costs, assembly, community) {
      var muted = '';
      if (['January', 'February', 'March', 'April', 'May'].indexOf(month) >= 0) {
        muted = ' text-muted';
      }

      return (
        <tr style={{cursor: 'pointer'}} onMouseOver={this.monthChanged(month)} key={month}>
          <td id={'financials-' + month}>{month}</td>
          <td>{'$' + numeral(total).format('0,0')}</td>
          <td className="text-right">{'$' + numeral(costs).format('0,0')}</td>
          <td className="text-right">{'$' + numeral(annuity).format('0,0')}</td>
          <td className={"text-right" + muted}>{'$' + numeral(assembly).format('0,0')}</td>
          <td className={"text-right" + muted}>{'$' + numeral(community - assembly).format('0,0')}</td>
        </tr>
      );
    },

    monthChanged: function(month) {
      return function(e) {
        FinancialsStore.setMonth(month);
        FinancialsActions.sendChange(month);
      };
    }
  });

  function calculateProfit(total, costs) {
    total = parseInt(total, 10);
    costs = parseInt(costs, 10);

    return total - costs;
  }

  function calculateExpenses(total, costs) {
    total = parseInt(total, 10);
    costs = parseInt(costs, 10);

    return costs;
  }

  function calculateAnnuity(total, costs, annuity) {
    total = parseInt(total, 10);
    costs = calculateExpenses(total, parseInt(costs, 10));
    annuity = parseInt(annuity, 10);

    var profit = calculateProfit(total, costs);

    return profit < annuity ? profit : annuity;
  }

  function calculateCommunityShare(total, costs, annuity) {
    total = parseInt(total, 10);
    costs = calculateExpenses(total, parseInt(costs, 10));
    annuity = parseInt(annuity, 10);

    var profit = calculateProfit(total, costs);

    return profit < annuity ? 0 : profit - annuity;
  }
})();
