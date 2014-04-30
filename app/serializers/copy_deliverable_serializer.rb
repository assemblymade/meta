class CopyDeliverableSerializer < ActiveModel::Serializer
  include MarkdownHelper

  attributes :body_html

  def body_html
    markdown(object.body)
  end
end

