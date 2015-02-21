class SevenDayMVP
  def self.current
    Product.find_by(slug: 'landline')
  end

  def self.recent
    ['gamamia', 'giraff'].map { |s| Product.find_by(slug: s) }
  end
end
