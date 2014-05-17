require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  def closeable?
    false
  end

  def chat_events
    [inception_message] + events.where.not(type: [::Event::Close]).order(:number)
  end

  def inception_message
    comments.new(user: User.maeby, body: I18n.t('product.chat.inception').sample)
  end

  def main_thread?
    number.zero?
  end
end
