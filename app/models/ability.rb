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

    can :manage, :all if current_user.staff?

    can [:update], User do |user|
      user == current_user
    end

    # Products
    can [:feature], Product do
      current_user.staff?
    end

    # The creator has edit privelleges until a core team is established.
    can [:update, :status_update], Product do |product|
      product.core_team?(current_user) || (product.core_team.empty? && product.user == current_user)
    end

    # Posts
    can [:create, :update], Post do |post|
      post.product.core_team?(current_user)
    end

    # WIPs

    can [:comment, :allocation], Wip do
      true
    end

    can [:close, :reopen], Wip do |wip|
      wip.user == current_user
    end

    can [:promotion, :demotion], Wip do |wip|
      wip.open? && wip.product.core_team?(current_user)
    end

    can [:update, :close], Wip do |wip|
      current_user.staff? || wip.product.core_team?(current_user)
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
    can :create, Event::Comment
    can :update, Event::Comment do |comment|
      comment.user == current_user
    end

    # Event

    can :award, Event do |event|
      wip = event.wip
      wip.awardable? && event.awardable? && wip.open? && wip.product.core_team?(current_user)
    end

  end
end
