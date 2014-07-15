require 'uri'

class PosterImage

  DEFAULT_PATH = "/assets/default_poster.jpg"

  attr_reader :product

  def initialize(product)
    @product = product
  end

  def url
    if product.poster?
      product.poster
    else
      DEFAULT_PATH
    end.gsub('^/','')
  end

end
