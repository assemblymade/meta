class Ability
  include CanCan::Ability

  def initialize(user)
    can [:read], Product do |product|
      if Product::PRIVATE.include?(product.slug)
        user && product.core_team?(user)
      else
        true
      end
    end

    return false unless user

    # Products
    can [:feature], Product do
      user.staff?
    end

    # The creator has edit privelleges until a core team is established.
    can [:update, :status_update], Product do |product|
      product.core_team?(user) || (product.core_team.empty? && product.user == user)
    end

    # Posts
    can [:create, :update], Post do |post|
      post.product.core_team?(user)
    end

    # WIPs

    can :manage, :all if user.staff?

    can [:close, :reopen], Wip do |wip|
      wip.user == user
    end

    can [:promote, :demote], Wip do |wip|
      wip.open? && wip.product.core_team?(user)
    end

    can [:update, :close], Wip do |wip|
      user.staff? || wip.product.core_team?(user)
    end

    can [:reopen, :reject, :unallocate, :award, :pin], Wip do |wip|
      wip.product.core_team?(user)
    end

    can [:award], Wip do |wip|
      wip.open? && wip.product.core_team?(user)
    end

    can [:move], Wip do |wip|
      !wip.awarded?
    end

    # Event
    can [:award], Event do |event|
      wip = event.wip
      wip.awardable? && wip.open? && wip.product.core_team?(user)
    end
    can [:update], Event do |event|
      event.user == user || event.wip.product.core_team?(user)
    end

    # Comments
    can [:update], Event::Comment do |comment|
      user.staff? || comment.user == user
    end
  end
end
