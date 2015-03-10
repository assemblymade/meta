module Metrics
  class Percentage
    attr_reader :raw

    def initialize(raw)
      @raw = raw
    end

    def change_from(previous)
      Percentage.new(raw - previous.raw)
    end

    def to_s
      "%.01f%" % (raw * 100)
    end
  end
end
