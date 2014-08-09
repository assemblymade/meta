require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'

  def main_thread?
    product.main_thread && (product.main_thread.id == id)
  end
end
