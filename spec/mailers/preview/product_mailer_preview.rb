class ProductMailerPreview < ActionMailer::Preview

  def status_update
    ProductMailer.status_update(User.first.id, StatusUpdate.order(:created_at).last.id)
  end

  def congrats_on_your_first_user
    product    = Product.sample
    ProductMailer.congrats_on_your_first_user(product.id)
  end

  def congratulate_on_signups
    product = Product.sample
    ProductMailer.congratulate_on_signups(product.id, 10)
  end

  def new_subscriber
    product = Product.sample
    email = 'foo@bar.com'

    ProductMailer.new_subscriber(product, email)
  end

  def new_promo_subscriber
    product = Product.find_by_slug('assemblycoins')
    email = "foo@bar.com"

    ProductMailer.new_promo_subscriber(product, email)
  end

  def new_promo_subscriber_with_account
    product = Product.find_by_slug('assemblycoins')
    user = User.sample

    ProductMailer.new_promo_subscriber_with_account(product, user)
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

  def stale_wips
    user = User.find_by(username: 'chrislloyd')
    ProductMailer.stale_wips(user.id)
  end

  def saved_search_created
    ProductMailer.saved_search_created SavedSearch.sample.id
  end

  def new_introduction
    ProductMailer.new_introduction(
      User.sample.id,
      TeamMembership.with_bios.with_interests.sample.id
    )
  end
end
