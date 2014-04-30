class Event::WinSerializer < EventSerializer
  has_one :winner, :key => :target
end
