class Financial::TransactionSerializer < ActiveModel::Serializer
  include ActiveModel::Currency

  attributes :id, :created_at, :description, :amount, :url
  attributes :amount_dollars

  has_many :credit_amounts, serializer: Financial::AmountSerializer
  has_many :debit_amounts, serializer: Financial::AmountSerializer

  def created_at
    object.created_at.iso8601
  end

  def description
    object.details.map{|k,v| "#{k}=#{v}" }.join(' ')
  end

  def url
    product_financial_transaction_url(object.product, object)
  end

  def amount
    object.credit_amounts.balance
  end

  def amount_dollars
    cents_to_human object.credit_amounts.balance
  end
end