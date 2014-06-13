require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  def chat_events(length = 15)
    e = events.includes(:wip, :tips).where.not(type: [::Event::Close]).order('number desc').take(length).to_a.reverse
    if main_thread? && e.size < length
      e.unshift(inception_message)
    else
      e
    end
  end

  def inception_message
    comments.new(user: User.maeby, body: I18n.t('product.chat.inception').sample)
  end

  def main_thread?
    product.main_thread && (product.main_thread.id == id)
  end
end
