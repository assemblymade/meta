class DeleteUserAccount
  include Sidekiq::Worker

  attr_reader :at

  def perform(user_id)
    @user = User.unscoped.find(user_id)
    @at = Time.now

    @user.with_lock do
      hard_deletes
      soft_deletes
    end

    Rails.cache.clear
  end

  def hard_deletes
    Activity.where(actor_id: @user.id).find_each do |a|
      a.story.try(:destroy)
    end
    Activity.where(actor_id: @user.id).delete_all
    Heart.where(user_id: @user.id).delete_all
    Heart.where(target_user_id: @user.id).delete_all
  end

  def soft_deletes
    @user.update!(deleted_at: at)

    Product.unscoped.where(user_id: @user.id).find_each do |p|
      delete_product_entities(p)
    end
    Product.unscoped.where(user_id: @user.id).update_all(deleted_at: at)

    Wip.unscoped.where(user_id: @user.id).update_all(deleted_at: at)
    Event.unscoped.where(user_id: @user.id).update_all(deleted_at: at)


    Idea.unscoped.where(user_id: @user.id).update_all(deleted_at: at)
    nfis = NewsFeedItem.unscoped.where(source_id: @user.id)
    nfis.each do |nfi|
      nfi.comments.update_all(deleted_at: at)
    end
    nfis.update_all(deleted_at: at)
    NewsFeedItemComment.unscoped.where(user_id: @user.id).update_all(deleted_at: at)
    TeamMembership.unscoped.where(user_id: @user.id).update_all(deleted_at: at)

  end

  def delete_product_entities(product)
    Wip.unscoped.where(product_id: product.id).update_all(deleted_at: at)
    Event.unscoped.joins(:wip).where(wips: {product_id: product.id}).update_all(deleted_at: at)

    Activity.unscoped.where(product_id: product.id).find_each do |a|
      a.story.try(:destroy)
    end
    Activity.unscoped.where(product_id: product.id).delete_all

    NewsFeedItem.unscoped.where(source_id: @user.id).update_all(deleted_at: at)
    NewsFeedItemComment.unscoped.where(user_id: @user.id).update_all(deleted_at: at)
    TeamMembership.unscoped.where(user_id: @user.id).update_all(deleted_at: at)
  end
end
