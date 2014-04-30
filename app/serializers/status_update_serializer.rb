require 'nokogiri'

class StatusUpdateSerializer < ActiveModel::Serializer
  include MarkdownHelper

  attributes :id, :url
  attributes :created, :body_html, :summary_html

  has_one  :user, :key => :author, serializer: UserSerializer

  def url
    product_status_update_path(object.product, object)
  end

  def created
    object.created_at.iso8601
  end

  def body_html
    unescaped_markdown(object.body)
  end

  def summary_html
    Nokogiri::XML(body_html).css('p').first.inner_html
  end

end
