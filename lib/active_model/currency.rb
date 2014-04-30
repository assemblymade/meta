module ActiveModel
  module Currency
    def cents_to_human(cents)
      "$#{"%.02f" % (cents / 100.0)}"
    end
  end
end
