class Financial::AmountSerializer < ActiveModel::Serializer
  attributes :type, :amount, :account

  def type
    object.type.split('::').last
  end

  def account
    @account ||= {
      name: object.account.name,
      url: product_financial_account_url(object.account.product, object.account)
    }
  end
end
