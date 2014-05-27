module Search
  class StateFilter < SearchFilter
    def self.all
      [
        ['Open',      'open'],
        ['Allocated', 'allocated'],
        ['Reviewing', 'reviewing'],
        ['Resolved',  'resolved'],
      ].map do |args|
        new(*args)
      end
    end
  end
end