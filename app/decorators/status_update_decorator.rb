class StatusUpdateDecorator < WipDecorator
  include MarkdownHelper

  decorates_association :user

  def body_html
    wip_markdown(body, helpers.product_wips_url(product))
  end

  def summary_html
    text = body_html
    Nokogiri::XML(text).css('p').first.inner_html if body_html.present?
  end
end
