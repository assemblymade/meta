require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  has_many :comments, class_name: 'Event::Comment', foreign_key: 'wip_id'

  def main_thread?
    product.main_thread && (product.main_thread.id == id)
  end
end
