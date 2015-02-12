class SevenDayMVP
  def self.current
    Product.find_by(slug: 'gamamia')
  end

  def self.recent
    ['giraff', 'signupsumo'].map { |s| Product.find_by(slug: s) }
  end
end
