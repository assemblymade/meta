require 'redis'
require 'leaderboard'
require 'timecop'

describe Leaderboard do
  before(:each) do
    @redis = Redis.new(host: '127.0.0.1', db: 15)
    @leaderboard = Leaderboard.new(@redis)
  end

  after(:each) do
    @redis.flushdb
    @redis.client.disconnect
  end

  subject { @leaderboard }

  context 'ordered members' do
    before { add_members(5) }

    describe :size do
      it { expect(subject.size).to eq(5) }
    end

    describe :rank do
      it { expect(subject.rank_for('member_5')).to eq(0) }
      it { expect(subject.rank_for('member_4')).to eq(1) }
      it { expect(subject.rank_for('not in list')).to eq(nil) }
    end

    describe :score do
      it { expect(subject.score_for('member_4')).to eq(4) }
      it { expect(subject.score_for('not in list')).to eq(nil) }
    end

    describe :top do
      subject { @leaderboard.top(3) }

      it { expect(subject.size).to eq(3) }

      it 'is ranked in order' do
        expect(subject[0][0]).to eq('member_5')
        expect(subject[1][0]).to eq('member_4')
        expect(subject[-1][0]).to eq('member_3')
        expect(subject[-1][1]).to eq(3.0)
      end
    end
  end

  context 'overlapping scores' do
    before {
      add_member("member_3", 0)
      add_member("member_2", 0)
      add_member("member_1", 0)
    }

    describe :rank do
      it { expect(subject.rank_for('member_1')).to eq(0) }
      it { expect(subject.rank_for('member_2')).to eq(1) }
      it { expect(subject.rank_for('member_3')).to eq(2) }
    end
  end


  def add_members(n = 5)
    1.upto(n) {|i| add_member("member_#{i}", i) }
  end

  def add_member(member, score)
    @leaderboard.add(member, score)
  end

end
