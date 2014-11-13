/** @jsx React.DOM */

(function() {
  var BountyListItem = React.createClass({
    renderWinners: function() {
      var bounty = this.props.bounty

      var winners = bounty.winners.map(function(user) {
        var title = "Awarded to @" + user.username

        return (
          <li data-toggle="tooltip" title={title}>
            <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
          </li>
        )
      })

      var emptyState = (
        bounty.workers.map(function(user) {
          var title = "Assigned to @" + user.username

          return (
            <li data-toggle="tooltip" title={title}>
              <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
            </li>
          )
        })
      )

      var listItems = null

      if(bounty.winners.length) {
        listItems = winners
      } else if(bounty.state != 'resolved') {
        listItems = emptyState
      }

      return (
        <ul className="list-inline text-muted small right">
          {listItems}
          <li>
            <strong>
              <span className="icon icon-speech icon-left"></span>
              {' '}
              {bounty.comments_count}
              <span className="sr-only">comments</span>
            </strong>
          </li>
        </ul>
      )
    },

    render: function() {
      return (
        <div>
          {this.renderWinners()}
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyListItem
  }

  window.BountyListItem = BountyListItem
})();

/*
        <div>
          <a href="<%= product_wip_path(bounty.product, bounty) %>">
            <strong><%= bounty.title %></strong>
          </a>

          <% bounty.tags.map do |tag| %>
            &nbsp;
            <a className="small text-info" href="<%= product_wips_path(bounty.product, tag: tag.name) %>">
              #<%= tag.name.downcase %>
            </a>
          <% end %>
        </div>

      <div className="clearfix small text-muted">
        <% if bounty.open? %>
          <div className="pull-right">
            <%= render partial: 'bounties/urgency', locals: { task: bounty } %>
          </div>
        <% end %>

        <!-- coins -->
        <div>
          <% if !bounty.product.meta? %>
            <% case %>
            <% when bounty.state == 'open' || (bounty.state == 'reviewing' && bounty.workers.empty?) %>
              <span className="text-warning" data-toggle="tooltip" title="Available">
            <% when bounty.workers.any? && (bounty.state != 'resolved') %>
              <span className="text-warning" data-toggle="tooltip" title="<%= pluralize(bounty.workers.count, 'person') %> working">
            <% when bounty.state == 'resolved' %>
              <% if bounty.winners.any? %>
                  <% bounty.winners.each do |winner| %>
                    <span className="text-muted" data-toggle="tooltip" title="Awarded to @<%= winner.username %>">
                  <% end %>
              <% else %>
                <span className="text-muted" data-toggle="tooltip" title="Closed">
              <% end %>
            <% end %>

              <% if bounty.state == 'resolved' && !bounty.winner.present? %>
                  <span className="icon icon-app-coin"></span>
                  <span><%= number_with_delimiter(WipContracts.new(bounty, @auto_tip_contracts).earnable_cents.floor) %></span>
              <% else %>
                <span className="icon icon-app-coin"></span>
                <span className="js-coins"><%= number_with_delimiter(WipContracts.new(bounty, @auto_tip_contracts).earnable_cents.floor) %></span>
              <% end %>
            </span>

            &middot;
          <% end %>

          #<%= bounty.number %> &middot;
          <a className="text-muted" href="<%= user_path(bounty.user) %>">@<%= bounty.user.username %></a> &middot;
          last update <%= time_ago_in_words(bounty.updated_at) %> ago

          <% unless @product %>
            in <a className="text-muted" href="<%= product_path(bounty.product) %>"><%= bounty.product.name %></a>
          <% end %>
        </div>
      </div>
      )
    }
    */
