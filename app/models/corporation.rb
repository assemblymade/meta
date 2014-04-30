class Corporation
  include ActiveModel::Serialization

  def name
    'Assembly'
  end

  def attributes
    {name: name}
  end

end
