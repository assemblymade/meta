# This should include more details for the show page
class WipHotSerializer < WipSerializer
  include TruncateHtmlHelper
  attributes :description

  def description
    truncate_html(object.description, length: 200)
  end

end
