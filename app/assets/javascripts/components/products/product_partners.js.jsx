const Partner = require('../partner.js.jsx')
const PeopleStore = require('../../stores/people_store');
const AppCoins = require('../app_coins.js.jsx')
const Tile = require('../ui/tile.js.jsx')
const ProgressBar = require('../ui/progress_bar.js.jsx')
const Markdown = require('../markdown.js.jsx')
const UserStore = require('../../stores/user_store.js')
import ProductHeader from '../products/product_header.js.jsx'
import ProductStore from '../../stores/product_store'
import PartnersStore from '../../stores/partners_store'
import Button from '../ui/button.js.jsx';


function _parseDate(date) {
  var parsedDate = new Date(date);

  return (parsedDate.getMonth() + 1).toString() + '-' + parsedDate.getDate().toString() + '-' + parsedDate.getFullYear().toString();
}

const ProductPartners = React.createClass({

  getInitialState() {
    return {
      partners: PartnersStore.get(ProductStore.getId()),
      coinprism_url: ProductStore.getCoinPrismUrl(),
      isStaff: UserStore.isStaff()
    }
  },

  renderWalletAddress(partner) {
    return (
      <td>
        <a href={partner.coinprism_url} className="gray-2 h6">
          <div className="">
            {partner.wallet_public_address}
          </div>
        </a>
      </td>
    )
  },

  render() {
    let partners = _.sortBy(
      _.filter(
        this.state.partners,
        (m) => { return m.coins > 0}),
      (m) => { return -m.coins })

    let totalCoins = _.reduce(
      partners.map(
        (m) => { return m.coins }),
      (memo, num) => { return memo + num },
      0)

    let rows = partners.map(function(partnership) {
      const {partner, coins} = partnership

      let formattedCoins = null;

      if (coins  / totalCoins < 0.0001) {
        formattedCoins = "< 0.01"
      } else {
        formattedCoins = numeral(coins/totalCoins).format('0.00%')
      }

      return (
        <tr key={`partner-${partner.id}`}>
          <td>
            <a href={partner.url} title={'@' + partner.username}>
              <div className="left mr2">
                <Partner user={partner} size={24} />
              </div>
              {partner.username}
            </a>
          </td>

          <td className="right-align">
            <AppCoins n={coins} />
          </td>

          <td className="right-align">
            {formattedCoins}
          </td>
          { this.state.isStaff ? this.renderWalletAddress(partner) : ""}
        </tr>
      )
    }.bind(this))
    return <div>
        <ProductHeader />
        <div className="container mt3">
          <Tile>
          <div className="p4">
            { this.state.isStaff ? <Button action = {this.state.coinprism_url} >See it on the Blockchain</Button> : <div></div>}

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th className="right-align">Coins</th>
                    <th className="right-align">Ownership</th>
                    { this.state.isStaff ? <th>Public Address</th> : ""}
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
              </table>
            </div>
          </div>
        </Tile>
      </div>
    </div>
  }
})

module.exports = window.ProductPartners = ProductPartners;

var PeopleList = React.createClass({

  render: function() {
    return (
      <div>
        {this.rows(this.props.memberships)}
      </div>
    )
  },

  rows: function(memberships) {
    var self = this;
    var rows = [];

    for (var i = 0, l = memberships.length; i < l; i++) {
      var member = memberships[i];

      var user = member.user;

      var row = (
        <div className="clearfix py2" key={`user-${user.id}-${i}`}>
          <div className="left mr3">
            <Avatar user={user} size={48} />
          </div>
          <div className="overflow-hidden">
            <div>
              <a className="bold" href={user.url} title={'@' + user.username}>
                {user.username}
              </a>
              <p className="gray-2">
                {user.bio ? user.bio : ''}
              </p>
            </div>
          </div>
        </div>
      )

      rows.push(row);
    }

    return rows;
  }
})

var BioEditor = React.createClass({
  componentWillMount: function() {
    this.setState({
      currentUser: this.props.currentUser,
      member: this.props.member,
      originalBio: this.props.originalBio,
      editing: false
    });
  },

  componentDidMount: function() {
    var params = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    if (!this.introduced && params.indexOf('introduction=true') >= 0) {
      this.introduced = true;
      this.makeEditable();
    }
  },

  render: function() {
    var currentUser = this.state.currentUser;
    var member = this.state.member;

    if (!member || !currentUser) {
      return <div />;
    }

    if (currentUser.id === member.user.id) {
      return (
        <div>
          <div className="js-edit-bio" key={'b-' + currentUser.id}>
            {member.bio}
            &nbsp;{this.state.editing ? this.saveButton() : this.editButton()}
          </div>
        </div>
      )
    }

    return (
      <div key={'b-' + member.user.id}>
        {member.bio}
      </div>
    )
  },

  editButton: function() {
    return (
      <a className="text-small" style={{ cursor: 'pointer' }} onClick={this.makeEditable}>&mdash;&nbsp;Update Intro</a>
    )
  },

  saveButton: function() {
    return (
      <div className="right-align" style={{'margin-top':'16px'}}>
        <a className="btn btn-default btn-sm" onClick={this.makeUneditable} style={{'margin-right' : '8px'}}>Cancel</a>
        <a className="btn btn-primary btn-sm" onClick={this.updateBio}>Save</a>
      </div>
    )
  },

  makeEditable: function(e) {
    $('#edit-membership-modal').modal('show');

    $('#modal-bio-editor').val(this.state.originalBio);
  },

  skillsOptions: function() {
    var options = _.map(this.props.interestFilters, function(interest) {
      if (interest === 'core') {
        return;
      }
      return (<option value={interest}>{'@' + interest}</option>);
    });

    return options;
  },

  makeUneditable: function(e) {
    var member = this.state.member;
    var bio = this.state.originalBio || this.props.originalBio;

    this.save(member, bio, member.interests);
  },

  updateBio: function(e) {
    var self = this;
    var bio = $('.bio-editor').val();
    var interests = $('#join-interests').val();
    var member = this.state.member;

    this.save(member, bio, interests);
  },

  save: function(member, bio, interests) {
    var self = this;

    $.ajax({
      url: this.props.updatePath,
      method: 'PATCH',
      data: {
        membership: {
          bio: bio,
          interests: interests
        }
      },
      success: function(data) {
        member.bio = data.bio
        member.interests = data.interests
        self.setState({ member: member, editing: false, originalBio: data.bio })
      },
      error: function(data, status) {
        console.error(status);
      }
    });
  }
});
