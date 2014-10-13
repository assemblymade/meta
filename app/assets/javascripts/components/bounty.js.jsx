/** @jsx React.DOM */

(function() {
  var Bounty = React.createClass({
    renderBountyValuation: function() {
      var bounty = this.props;
      var maxOffer = Math.round(6 * bounty.product.average_bounty / 10000) * 10000

      return (
        <BountyValuation
          offersPath={bounty.offers_url}
          product={bounty.product}
          contracts={bounty.contracts}
          offers={bounty.offers}
          maxOffer={maxOffer}
          averageBounty={bounty.product.average_bounty}
          value={bounty.value}
          open={bounty.open} />
      );
    },

    renderUrgency: function() {
      var bounty = this.props;
      var urgencies = ['Urgent', 'Now', 'Someday'];

      return (
        <Urgency
          initialLabel={bounty.urgency.label}
          urgencies={urgencies}
          state={bounty.state}
          url={bounty.urgency_url} />
      );
    },

    renderTagList: function() {
      var bounty = this.props;
      var tags = _.map(bounty.tags, function(tag) { return tag.name });

      return (
        <TagList
          filterUrl={bounty.product.wips_url}
          destination={true}
          tags={tags}
          newBounty={true}
          url={bounty.tag_url} />
      );
    },

    renderDescription: function() {
      var bounty = this.props;

      if(bounty.markdown_description) {
        return <div className="markdown markdown-content text-large" dangerouslySetInnerHTML={{__html: bounty.markdown_description}}></div>;
      } else {
        return <p className="large text-muted">(No description)</p>;
      }
    },

    render: function() {
      var bounty = this.props;

      return (
        <div className="card">
          <div className="card-heading">
            <ul className="list-inline" style={{ 'margin-bottom': '6px' }}>
              <li className="text-large">
                {this.renderBountyValuation()}
              </li>
              <li>
                {this.renderUrgency()}
              </li>
              <li>
                {this.renderTagList()}
              </li>
              <li className="text-muted" style={{ 'font-size': '14px', 'color': '#a5a5a5' }}>
                Created by
                {' '}
                <a className="text-stealth-link" href={bounty.user.url}>@{bounty.user.username}</a>
                {' '}
                {moment(bounty.created).fromNow()}
              </li>
            </ul>

            <h1 className="alpha omega">
              {this.props.title}
              {' '}
              <small style={{ 'font-size': '30px', 'color': '#b4b4b4' }}>
                #{this.props.number}
              </small>
            </h1>
          </div>

          <div className="card-body bounty-description">
            {this.renderDescription()}
          </div>
        </div>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Bounty;
  }

  window.Bounty = Bounty;
})();

/* 

          <div className="card-body bounty-description">
            <% if bounty.description.present? %>
              <div className="markdown markdown-content text-large">
                <%= product_markdown(bounty.product, bounty.description) %>
              </div>
            <% else %>
              <p className="large text-muted">(No description)</p>
            <% end %>
          </div>

          <div className="card-footer clearfix">
            <ul className="list-inline alpha omega pull-left">
              <% if current_user && current_user.staff? %>
                <li className="alpha">
                  <div data-react-class="ToggleButton"
                       data-react-props="<%= {
                         bool: bounty.flagged?,
                         text: { true: 'Unflag', false: 'Flag' },
                         classes: { true: 'btn btn-label', false: 'btn btn-label' },
                         icon: 'flag',
                         href: { true: product_wip_unflag_path(bounty.product, bounty), false: product_wip_flag_path(bounty.product, bounty) }
                      }.to_json %>">
                  </div>
                </li>
              <% end %>
              <% if can?(:update, bounty) %>
                <li>
                  <a href="<%= edit_product_wip_path(bounty.product, bounty) %>" className="btn btn-label">
                    <span className="icon icon-pencil icon-left"></span>
                    Edit
                  </a>
                </li>
              <% end %>
              <% if can?(:update, bounty) %>
                <li>
                  <%= form_tag product_wip_comments_path(bounty.product, bounty), method: :post, class: %w(form new_event_comment) do %>
                    <% if bounty.resolved? || bounty.closed? %>
                      <%= button_tag name: 'event_comment[type]', value: 'Event::Reopen', type: 'submit', class: %w(btn btn-label) do %>
                        <span className="icon icon-check"></span>
                        Reopen
                      <% end %>
                    <% else %>
                      <%= button_tag name: 'event_comment[type]', value: 'Event::Close', type: 'submit', class: %w(btn btn-label) do %>
                        <span className="icon icon-close icon-left"></span>
                        Close
                      <% end %>
                    <% end %>
                  <% end %>
                </li>
              <% end %>
              <li>
                <div data-react-class="ToggleButton"
                     data-react-props="<%= {
                       bool: watching?(bounty),
                       text: { true: 'Mute', false: 'Follow' },
                       icon: 'volume-off',
                       classes: { true: 'btn btn-label', false: 'btn btn-label' },
                       href: { true: product_wip_mute_path(bounty.product, bounty.number), false: product_wip_watch_path(bounty.product, bounty.number) }
                    }.to_json %>">
                </div>
              </li>
            </ul>

            <ul className="list-inline alpha omega pull-right">
              <% unless bounty.closed? || bounty.resolved? %>
                <li>
                  <div data-react-class="InviteFriendBounty" data-react-props="<%= {
                      url: invites_path,
                      invites: (@invites ? serialize_hash(@invites) : []),
                    }.merge(TypeId.as_json(:via, bounty)).to_json %>">
                  </div>
                </li>
                <li className="omega">
                  <% if !bounty.assigned_to?(current_user) %>
                    <a href="<%= product_wip_start_work_path(bounty.product, bounty, user: current_user) %>" data-method="patch" class="btn btn-success">
                      Work on this bounty
                    </a>
                  <% else %>
                    <a href="<%= product_wip_stop_work_path(bounty.product, bounty, user: current_user) %>" data-method="patch" class="btn btn-danger">
                      Abandon bounty
                    </a>
                  <% end %>
                </li>
              <% end %>
            </ul>

          </div>
          */
