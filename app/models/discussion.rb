require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  def main_thread?
    product.main_thread && (product.main_thread.id == id)
  end

  # TODO Remove when first comment is the description (chrislloyd)
  def comments_count
    [0, super - 1].max
  end
end
