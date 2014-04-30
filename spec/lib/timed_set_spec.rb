require 'redis'
require 'timecop'
require 'timed_set'

describe TimedSet do
  before(:each) do
    @redis = Redis.new(host: '127.0.0.1', db: 15)
  end

  after(:each) do
    @redis.flushdb
    @redis.client.disconnect
  end

  let(:start) { Time.local(1990) }
  before(:each) { Timecop.freeze(start) }
  after(:each) { Timecop.return }

  let(:set) { TimedSet.new(@redis, 'key') }

  it 'true if not present' do
    set.add('value_1').should == true
  end

  it 'adds to redis sorted set with timestamp' do
    set.add('value_1')
    @redis.zscore('key', 'value_1').to_i.should == start.to_i
  end

  it 'false if already in set' do
    set.add('value_1')
    set.add('value_1').should == false
  end

  it 'drops older than given seconds' do
    set.add('value_0')
    Timecop.travel(start + 5)
    set.add('value_5')
    Timecop.travel(start + 10)
    set.add('value_10')

    Timecop.travel(start)
    set.drop_older_than(6)
    set.members.should == ['value_0', 'value_5']
  end
end