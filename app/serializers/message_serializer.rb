class MessageSerializer < BaseSerializer
  include MarkdownHelper
  attributes :body, :body_html
  has_one :author

  def body_html
    unescaped_markdown(object.body)
  end
end
