class Sequence
  def self.save_uniquely(&blk)
    begin
      blk.call

    # TODO: (whatupdave) rescuing from UniqueViolation because of race condition in sequenced gem
    rescue PG::UniqueViolation
      @retries ||= 0
      retry if (@retries += 1) < 5
      raise
    end
  end
end