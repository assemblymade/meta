class TextcompleteSearch
  attr_accessor :product, :query

  def self.call(product, query)
    new(product, query).search
  end

  def initialize(product, query)
    self.product = product
    self.query = query
  end

  def search
    return [] unless query_type

    public_send(query_type)
  end

  def query_type
    return unless query

    case query[0]
    when '@' then :users
    when '#' then :wips
    end
  end

  def users
    find_users.map { |username, name| ["@#{username}", name] }
  end

  def find_users
    User.where('username ILIKE ?', "#{cleaned_query}%").limit(limit).pluck(:username, :name)
  end

  def wips
    find_wips.map { |number, description| ["##{number}", description] }
  end

  def find_wips
    wips_by_number = product.wips.where('CAST(number AS VARCHAR) ILIKE ?', "#{cleaned_query}%").limit(limit).pluck(:number, :title)
    # wips_by_title = product.wips.where("title ilike ?", "%#{cleaned_query}%").pluck(:number, :title)
    #
    # wips_by_title + wips_by_number
  end

  def cleaned_query
    query[1..-1]
  end

  def limit
    10
  end
end
