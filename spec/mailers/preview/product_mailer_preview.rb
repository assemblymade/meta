class ProductMailerPreview < ActionMailer::Preview

  def status_update
    ProductMailer.status_update(User.first.id, StatusUpdate.order(:created_at).last.id)
  end

  def congrats_on_your_first_user
    product    = Product.sample
    ProductMailer.congrats_on_your_first_user(product.id)
  end

  def flagged
    product    = Product.sample
    admin      = User.random.first
    ProductMailer.flagged(admin.id, product.id, 'Some personal messae')
  end

  def idea_process_update
    product    = Product.waiting_approval.sample
    ProductMailer.idea_process_update(product.id)
  end

  def mission_completed
    product = Product.joins(:completed_missions).
      group('products.id').
      having('count(completed_missions.id) > 1').sample

    ProductMailer.mission_completed(product.completed_missions.order(:created_at).first.id, product.user.id)
  end

  def stale_wips
    user = User.find_by(username: 'chrislloyd')
    ProductMailer.stale_wips(user.id)
  end

  def saved_search_created
    ProductMailer.saved_search_created SavedSearch.sample.id
  end


end
