require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  def closeable?
    false
  end

  def chat_events
    e = events.includes(:wip, :tips).where.not(type: [::Event::Close]).order(:number).to_a
    if main_thread?
      e.unshift(inception_message)
    else
      e
    end
  end

  def inception_message
    comments.new(user: User.maeby, body: I18n.t('product.chat.inception').sample)
  end

  def main_thread?
    product.main_thread.id == id
  end
end
