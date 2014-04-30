require 'spec_helper'

describe Counter do
  let(:counter_params) {
    {
      name: "sign-ups",
      value: 1,
      measure_time: Time.new(2014, 1, 28, 2, 0, 0)
    }
  }

  let(:product) { Product.make! }

  let(:counter) {
    Counter.new(product, counter_params)
  }


  it "creates measurements from an array of params" do
    counter = [double('Counter')]
    expect(Counter).to receive(:wrap).with(product, [counter_params]) { [counter] }
    expect(counter).to receive(:create_measurement)

    Counter.create_measurements(product, [counter_params])
  end

  it "wraps up attributes in counter objects" do
    expect(Counter).to receive(:new).with(product, counter_params).and_call_original

    counters = Counter.wrap(product, [counter_params])

    expect(counters.first).to be_a(Counter)
  end

  it "creates a measurement" do
    measurement_params = double("MeasurementParams")
    counter.stub(measurement_params: measurement_params)

    expect(Measurement).to receive(:create!).with(measurement_params)

    counter.create_measurement
  end

  it "retrieves or creates a metric by product and name" do
    metric_scope = double('MetricScope')
    counter.stub(find_metric: metric_scope)

    expect(metric_scope).to receive(:first_or_create!)

    counter.metric
  end

  it "finds a metric by name and product" do
    product = double("Product", id: 2)
    counter.stub(product: product)

    expect(Metric).to receive(:where).with(name: "sign-ups", product_id: product.id)

    counter.find_metric
  end

  it "returns params used to create a metric" do
    product = double("Product", id: 4)
    counter.stub(product: product)

    expect(counter.metric_params).to eq(
      name: "sign-ups",
      product_id: product.id,
    )
  end

  it "creates a measurement" do
    measurement_params = double("MeasurementParams")
    counter.stub(measurement_params: measurement_params)

    expect(Measurement).to receive(:create!).with(measurement_params)

    counter.measurement
  end

  it "returns params used to create a measurement" do
    metric = double("Metric", id: 5)
    counter.stub(metric: metric)

    expect(counter.measurement_params).to eq(
      metric_id: metric.id,
      value: 1,
      created_at: Time.new(2014, 1, 28, 2, 0, 0)
    )
  end
end
