class Financial::AccountSerializer < ActiveModel::Serializer
  include ActiveModel::Lists
  include ActiveModel::Currency

  attributes :name, :type, :credits_balance, :debits_balance, :balance
  attributes :credits_balance_dollars, :debits_balance_dollars, :balance_dollars
  attributes :url

  list :credit_transactions
  list :debit_transactions

  def type
    object.type.split('::').last
  end

  def url
    product_financial_account_url(product, account)
  end

  def balance_dollars
    cents_to_human account.balance
  end

  def credits_balance_dollars
    cents_to_human account.credits_balance
  end

  def debits_balance_dollars
    cents_to_human account.debits_balance
  end

  # private

  def product
    @product ||= object.product
  end

  def account
    object
  end
end
