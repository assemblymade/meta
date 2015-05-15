

// TODO: Tidy up shared state

/**
 * Right now, both the table and the meter have
 * all of the financials in state; it would be
 * better to move all of this to the FinancialsStore
 */

(function() {
  var FinancialsStore = {
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

  var Financials = React.createClass({
    componentWillMount: function() {
      FinancialsStore.setMonth(this.props.reports[0].end_at);
    },

    render: function() {
      var groupedReports = _.reduce(this.props.reports, function(h, r){ h[r.end_at] = r; return h; }, {});

      return (
        <div className="financials">
          <FinancialsKey product={this.props.product} />
          <FinancialsMeter product={this.props.product} reports={groupedReports} />
          <FinancialsTable product={this.props.product} reports={groupedReports} />
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
          <ul className="list-inline mb0">
            <li>
              <span className="bg-green"></span>
              <span className="green">Payout</span>
            </li>
            <li>
              <span className="bg-yellow"></span>
              <span className="yellow">Assembly</span>
            </li>
            <li>
              <span className="bg-blue"></span>
              <span className="blue">Expenses</span>
            </li>
          </ul>
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
      var report = this.props.reports[this.state.month];

      var total = report.revenue;
      var costs = report.expenses;

      var annuity = calculateAnnuity(total, costs, report.annuity);
      var expenses = calculateExpenses(total, costs);
      var communityShare = calculateCommunityShare(total, costs, report.annuity);
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
        <div className="row">
          <div className="col-sm-2">
            {moment(this.state.month).format('MMM YYYY')}
          </div>
          <div className="com-sm-10">
            <div className="progress">
              <div id='community-meter'
                   className="progress-bar progress-bar-success"
                   role="progress-bar"
                   style={{ width: communityWidth + '%'}}>
                <span>{'$' + numeral(communityShare / 100).format('0,0')}</span>
              </div>
              <div id='assembly-share'
                   className="progress-bar progress-bar-warning"
                   role="progress-bar"
                   style={{ width: assemblyWidth + '%'}}>
                <span>{'$' + numeral(assemblyShare / 100).format('0,0')}</span>
              </div>
              <div id={name + '-meter'}
                   className="progress-bar"
                   role="progress-bar"
                   style={{ width: (annuityWidth + costsWidth) + '%' }}>
                <span>{'$' + numeral((annuity + expenses) / 100).format('0,0')}</span>
              </div>
            </div>
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
                <th className="left-align">
                  Total revenue
                </th>
                <th className="right-align">
                  Expenses
                </th>
                <th className="right-align">
                  Assembly
                </th>
                <th className="right-align">
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
      var financials = this.props.reports;

      return _.map(Object.keys(financials), function mapFinancials(month) {
        var report = financials[month];
        var total = report.revenue;
        var costs = report.expenses;

        var profit = calculateProfit(total, costs);
        var annuity = calculateAnnuity(total, costs, report.annuity);
        var expenses = calculateExpenses(total, costs);
        var communityShare = calculateCommunityShare(total, costs, report.annuity);
        var assemblyShare = communityShare * 0.1;

        return (
          self.tRow(month, total, annuity, expenses, assemblyShare, communityShare)
        );
      });
    },

    tRow: function(month, total, annuity, costs, assembly, community) {
      var expenses = annuity + costs;

      return (
        <tr style={{cursor: 'pointer'}} onMouseOver={this.monthChanged(month)} key={month}>
          <td id={'financials-' + month}>{moment(month).format('MMM YYYY')}</td>
          <td>{'$' + numeral(total / 100.0).format('0,0')}</td>
          <td className="right-align">{'$' + numeral(expenses / 100.0).format('0,0')}</td>
          <td className={"right-align"}>{'$' + numeral(assembly / 100.0).format('0,0')}</td>
          <td className={"right-align"}>{'$' + numeral((community - assembly) / 100.0).format('0,0')}</td>
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

  if (typeof module !== 'undefined') {
    module.exports = Financials;
  }

  window.Financials = Financials;
})();
