class Counter
  attr_accessor :measurement_created_at, :name, :product, :value

  def self.create_measurements(product, counter_params)
    wrap(product, counter_params).map(&:create_measurement)
  end

  def self.wrap(product, counter_params)
    counter_params.map do |params|
      Counter.new(product, params)
    end
  end

  def initialize(product, params)
    self.product = product
    self.measurement_created_at = params.fetch(:measure_time, Time.now)
    self.name = params.fetch(:name)
    self.value = params.fetch(:value)
  end

  def create_measurement
    measurement
  end

  def metric
    find_metric.first_or_create!
  end

  def find_metric
    Metric.where(metric_params)
  end

  def metric_params
    {
      name: name,
      product_id: product.id
    }
  end

  def measurement
    Measurement.create!(measurement_params)
  end

  def measurement_params
    {
      metric_id: metric.id,
      value: value,
      created_at: measurement_created_at
    }
  end
end
