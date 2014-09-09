# TODO: (whatupdave) use webhook so we're doing the same thing as other services
class AsmTrackUniqueWorker < ActiveJob::Base
  queue_as :default

  def perform(name, distinct_id, at=Time.current)
    metric = Metric.where(
      product: Product.find_by!(slug: 'asm'),
      name: name
    ).first_or_create!

    metric.uniques.create!(
      distinct_id: distinct_id,
      created_at: at
    )
  end
end
