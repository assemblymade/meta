# This should include more details for the show page
class WipHotSerializer < WipSerializer
  include MarkdownHelper
  include TruncateHtmlHelper

  attributes :description, :product

  def description
    Search::Sanitizer.new.sanitize(
      truncate_html(markdown(object.description), length: 200)
    )
  end

  def product
    AppSerializer.new(object.product)
  end

end
