RSpec::Matchers.define :be_same_time_as do |expected|
  match do |actual|
    actual.to_i == expected.to_i
  end
end