module Metrics
  class RawNumber
    attr_reader :raw

    def initialize(raw)
      @raw = raw
    end

    def change_from(previous)
      Percentage.new((raw - previous.raw) / previous.raw.to_f)
    end

    def to_s
      raw.to_s
    end
  end
end
