class TransactionLogEntry < ActiveRecord::Base
  belongs_to :product, touch: true

  scope :credit,       -> { where(action: 'credit') }
  scope :in_user_wallets, -> { joins('inner join users on users.id = wallet_id') }
  scope :minted,       -> { where(action: 'minted') }
  scope :from_month_start, ->(time) { where('transaction_log_entries.created_at >= ?', TransactionLogEntry.start_of_month(time.to_time)) }
  scope :to_month_end, ->(time) { where('transaction_log_entries.created_at <= ?', TransactionLogEntry.end_of_month(time.to_time)) }
  scope :validated,    -> { where(action: 'validated') }
  scope :with_cents,   -> { where.not(cents: nil) }

  # after_commit :schedule_minter

  def self.balance(product, wallet_id)
    where(product_id: product.id, wallet_id: wallet_id).with_cents.sum(:cents)
  end

  def self.sum_balances(user)
    where(wallet_id: user.id).with_cents.sum(:cents)
  end

  def self.product_balances(user)
    where(wallet_id: user.id).with_cents.group(:product_id).sum(:cents)
  end

  def self.product_totals
    with_cents.group(:product_id).sum(:cents)
  end

  def self.bounty_values_on_product(product)
    bounties = TransactionLogEntry.minted.
      where(product_id: product.id).
      where.not(work_id: product.id).
      group(:work_id).
      sum(:cents).values.reject(&:zero?)
  end

  def self.products_with_balance(wallet_id, launched_only=false)
    query = Product.select('products.id, sum(cents) as balance').
       joins('inner join transaction_log_entries tle on tle.product_id = products.id').
       where('wallet_id = ?', wallet_id)

    query = query.where.not(state: ['stealth', 'reviewing']) if launched_only

    query.group('products.id').map do |product|
     [product.id, product.balance]
    end
  end

  def self.wallet_balances(product_id)
    where(product_id: product_id).with_cents.group(:wallet_id).sum(:cents)
  end

  def self.users_with_balance
    User.select('users.*, sum(cents) as balance').
         joins('inner join transaction_log_entries tle on tle.wallet_id = users.id').
         group('users.id')
  end

  def self.end_of_month(time)
    ActiveSupport::TimeZone["Hawaii"].parse(
      time.end_of_month.strftime("%Y-%m-%dT%T")
    ).end_of_day
  end

  def self.start_of_month(time)
    ActiveSupport::TimeZone["Hawaii"].parse(
      time.beginning_of_month.strftime("%Y-%m-%dT%T")
    ).beginning_of_day
  end

  def self.minted!(parent_id, created_at, product, wallet_id, cents, extra=nil)
    create!(
      transaction_id: parent_id,
      created_at: created_at,
      product: product,
      action: 'minted',
      wallet_id: wallet_id,
      cents: cents,
      extra: extra
    )
  end

  def self.product_partners(product_id)
    User.select('users.*, sum(cents) as balance').
         where(tle: {product_id: product_id}).
         joins('inner join transaction_log_entries tle on tle.wallet_id = users.id').
         group('users.id').
         having('sum(cents) > 0')
  end

  def self.product_partners_with_balances(product_id)
    User.joins('inner join transaction_log_entries tle on tle.wallet_id = users.id').
      where(tle: {product_id: product_id}).
      group('users.id').sum(:cents)
  end

  def self.product_partners_with_balances_unqueued(product_id)
    User.joins('inner join transaction_log_entries tle on tle.wallet_id = users.id').
      where(tle: {product_id: product_id, queue_id: nil}).
      group('users.id').sum(:cents)
  end

  def self.transfer!(product, from_id, to_id, cents, via, created_at=Time.now)
    transaction do
      transaction_id = SecureRandom.uuid

      from_balance = self.balance(product, from_id)
      valid = from_balance >= cents

      Rails.logger.info "from=#{from_id} balance=#{from_balance} to=#{to_id} cents=#{cents} via=#{via} valid=#{valid}"
      raise ActiveRecord::Rollback if !valid

      attributes = {
        transaction_id: transaction_id,
        created_at: created_at,
        product_id: product.id,
        work_id: via
      }

      create!(attributes.merge(
        action: 'credit',
        wallet_id: to_id,
        cents: cents
      ))
      create!(attributes.merge(
        action: 'debit',
        wallet_id: from_id,
        cents: (-1 * cents)
      ))
    end
  end

  def schedule_minter
    return unless %w(validated voted).include? action

    MinterWorker.perform_async(id)
  end
end
