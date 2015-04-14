class ProductApiSerializer < ActiveModel::Serializer
  attributes :partners

  def user
    UserSerializer.new(object)
  end

  def coins
    
  end

end
