# This shouldn't load too much stuff, only stuff that will be displayed on the index page. Counts etc.
class WipSerializer < ActiveModel::Serializer
  attributes :id, :url
  attributes :product_slug,
             :product_name,
             :title,
             :number,
             :state,
             :winner,
             :watchers_count,
             :promoted,
             :push_channel,
             :comments_count,
             :score,
             :score_multiplier,
             :deliverable

  # personalized
  attributes :new_comments, :unread, :own_comments

  has_one  :user, :key => :author, serializer: UserSerializer

  def filter(keys)
    if scope.nil?
      keys - [:new_comments, :unread]
    end
  end

  def product_slug
    product.slug
  end

  def product_name
    product.name
  end

  def url
    case wip.type
    when 'Discussion'
      product_discussion_path(product, wip)
    else
      product_wip_path(product, wip)
    end
  end

  def state
    wip.current_state.to_s
  end

  def promoted
    wip.promoted?
  end

  def watchers_count
    wip.watchings_count
  end

  def winner
    if winner = wip.winner
      UserSerializer.new(winner)
    end
  end

  # personalized

  def unread
    wip.updates.for(scope).unread? if scope
  end

  def new_comments
    wip.updates.for(scope).unread_comment_count if scope
  end

  def own_comments
    wip.comments.where(user: scope).count if scope
  end

  # private

  def product
    @product ||= wip.product
  end

  def wip
    object
  end

end
