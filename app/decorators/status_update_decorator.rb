class StatusUpdateDecorator < WipDecorator
  include MarkdownHelper

  decorates_association :user

  def body_html
    product_markdown(product, body)
  end

  def summary_html
    text = body_html
    Nokogiri::XML(text).css('p').first.inner_html if body_html.present?
  end
end
