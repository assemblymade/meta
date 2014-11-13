json.cache! @cache_key, expires_in: 10.minutes do
  json.array!(@posts) do |post|
    product = Product.find(post.product_id)
    target = post.target_type.constantize.find(post.target_id)
    user = User.find(post.source_id)

    json.id post.id

    json.cache! post, expires_in: 1.minute do
      json.last_comment do
        comment = NewsFeedItem.find(post.id).news_feed_item_comments.last
        next unless comment

        json.id comment.id
        json.markdown_body product_markdown(product, comment.body)
        json.user do
          comment_user = User.find(comment.user_id)

          json.avatar_url Avatar.new(comment_user).url.to_s
          json.url user_path(comment_user)
          json.username comment_user.username
        end
      end
    end

    json.cache! product, expires_in: 30.minutes do
      json.product do
        json.average_bounty product.average_bounty
        json.coins_minted product.coins_minted
        json.logo_url Asset.find_by(id: product.logo.try(:id)).try(:url)
        json.name product.name
        json.pitch product.pitch
        json.profit_last_month product.profit_last_month
        json.slug product.slug
        json.url product_path(product)
      end
    end

    json.cache! target, expires_in: 10.minutes do
      json.target do
        type = target.class.name.underscore

        json.comments_count target.try(:comments_count)
        json.id target.id
        json.type type
        json.url product_wip_path(product, target)

        case type
        when 'discussion'
          json.markdown_body product_markdown(product, target.description)
          json.title target.title
        when 'post'
          json.body target.body || target.description
          json.markdown_body product_markdown(product, target.body)
        when 'task'
          contracts = WipContracts.new(target, product.auto_tip_contracts.active)
          description = target.description
          markdown_description = product_markdown(product, description)

          json.contracts contracts
          json.markdown_description markdown_description
          json.offers target.offers
          json.offers_url api_product_bounty_offers_path(product, target)
          json.short_description product_markdown(product, description.try(:truncate, 200, separator: /\s/))
          json.state target.state
          json.steps BountyGuidance::Valuations.suggestions(product)
          json.tags Wip::Tagging.where(wip_id: target.id).map(&:tag)
          json.thumbnails Nokogiri::HTML(markdown_description).css('img').map do |img|
            img['src']
          end
          json.title target.title
          json.urgency target.urgency
          json.urgency_url product_task_urgency_path(product, target)
        when 'team_membership'
          json.bio target.bio
        else
          json.body (target.try(:body) || target.try(:description))
          json.description (target.try(:description) || target.try(:body))
          json.title (target.try(:name) || target.try(:title))
        end
      end
    end

    json.cache! user, expires_in: 1.hour do
      json.user do
        json.avatar_url Avatar.new(user).url.to_s
        json.url user_path(user)
        json.username user.username
      end
    end
  end
end
