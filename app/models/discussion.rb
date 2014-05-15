require 'activerecord/uuid'

class Discussion < Wip
  MAIN_TITLE = 'Main thread'
  
  def closeable?
    false
  end
end
