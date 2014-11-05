task :statwing => :environment do

  ActiveRecord::Base.logger = nil

  def print_csv_line(data)
    puts data.join(',')
  end

  # ---

  def user_id(user)
    user.id
  end

  def time_until_first_coin(user)
    tx = TransactionLogEntry.where(
      wallet_id: user.id
    ).first

    if tx
      (tx.created_at - user.created_at).to_i
    else
      nil
    end
  end

  def total_coins(user)
    TransactionLogEntry.where(
      wallet_id: user.id
    ).sum(:cents)
  end

  def email_domain(user)
    user.email.split('@', 2).last
  end

  def most_important_quality(user)
    user.most_important_quality
  end

  def products_browsed_count(user)
    (user.recent_product_ids || []).count
  end

  def has_github?(user)
    user.github_uid.present?
  end

  def has_twitter?(user)
    user.twitter_uid.present?
  end

  def has_facebook?(user)
    user.facebook_uid.present?
  end

  def sign_in_count(user)
    user.sign_in_count
  end

  def last_request_at(user)
    user.last_request_at
  end

  def transaction_log_entries_count(user)
    TransactionLogEntry.where(
      wallet_id: user.id
    ).count
  end

  def products_founded_count(user)
    user.products.count
  end

  def core_team_count(user)
    user.core_team_memberships.count
  end

  def talk_count(user)
    Event::Comment.where(user: user).count
  end

  def number_of_products_available_on_signup(user)
    Product.where('started_team_building_at <= ?', user.created_at).count
  end

  def bounties_started(user)
    Task.where(user: user).count
  end

  # ---

  fields = [
    :user_id,
    :time_until_first_coin,
    :total_coins,
    :email_domain,
    :most_important_quality,
    :products_browsed_count,
    :has_github?,
    :has_twitter?,
    :last_request_at,
    :sign_in_count,
    :transaction_log_entries_count,
    :products_founded_count,
    :core_team_count,
    :talk_count,
    :number_of_products_available_on_signup,
    :bounties_started
  ]

  print_csv_line(fields)

  User.all.each do |user|
    print_csv_line(fields.map {|field| Kernel.send(field, user) })
  end

end
