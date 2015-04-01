class Ability
  include CanCan::Ability

  def initialize(current_user)
    can [:read], Product do |product|
      if Product::PRIVATE.include?(product.slug)
        current_user && product.core_team?(current_user)
      else
        true
      end
    end

    return false unless current_user

    can(:manage, :all) if current_user.staff?

    if current_user.staff?
      can :read, :playground
    end

    can [:update], User do |user|
      user == current_user
    end

    can [:update], Idea do |idea|
      idea.user_id == current_user.id
    end

    # NewsFeedItems
    can [:update], NewsFeedItem do |nfi|
      (nfi.product && nfi.product.core_team?(current_user)) || current_user.staff?
    end

    # Products
    can [:feature], Product do
      current_user.staff?
    end

    can [:create_bounty], Product do |product|
      product.core_team?(current_user) || product.partner?(current_user)
    end

    # The creator has edit privileges until a core team is established.
    can [:update, :status_update], Product do |product|
      product.core_team?(current_user) || (product.core_team.empty? && product.user == current_user)
    end

    # Posts
    can [:create, :update], Post do |post|
      post.product.core_team?(current_user)
    end

    # WIPs

    can [:comment, :allocation, :review_ready], Wip do
      true
    end

    can [:close, :reopen], Wip do |wip|
      wip.user == current_user
    end

    can [:promotion, :demotion], Wip do |wip|
      wip.open? && wip.product.core_team?(current_user)
    end

    can [:update, :close], Wip do |wip|
      current_user.staff? || wip.product.core_team?(current_user) || wip.user == current_user
    end

    can [:reopen, :rejection, :unallocate], Wip do |wip|
      wip.product.core_team?(current_user)
    end

    can [:award], Wip do |wip|
      wip.open? && wip.product.core_team?(current_user)
    end

    can [:move], Wip do |wip|
      !wip.awarded?
    end

    # Comments
    can :create, NewsFeedItemComment
    can :update, NewsFeedItemComment do |comment|
      comment.user == current_user
    end

    # Event

    can :award, Event do |event|
      wip = event.wip
      wip.awardable? && event.awardable? && wip.open? && wip.product.core_team?(current_user)
    end

    # Contracts

    can :contract, Product do |product|
      product.core_team?(current_user)
    end

    can [:update, :destroy], AutoTipContract do |contract|
      contract.product.core_team?(current_user)
    end

  end
end
