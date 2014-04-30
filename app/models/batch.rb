class Batch
  class << self
    def latest
      Batch.new
    end
  end

  def id
    '1'
  end

  def name
    'Sydney Sunrise'
  end

  def ends_at
    @ends_at ||= begin
      raise "You have to set the BATCH_END_DATE in the env for the latest batch" if ENV['BATCH_END_DATE'].blank?
      DateTime.parse(ENV['BATCH_END_DATE'])
    end
  end

  def to_param
    id.to_s
  end

  def total_banked
    Preorder.sum(:amount) + Product.sum(:assembly_contribution)
  end

end
