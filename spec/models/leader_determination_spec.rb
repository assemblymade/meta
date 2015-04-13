require 'spec_helper'

describe LeaderDetermination do

  let(:user) { User.make! }

  before do
    LeaderPosition.create!({leader_type: "Overall", rank: 1, user: user})
    Mark.create!({name: "python"})
    MarkCluster.create!({name: "AppleFanboys"})
  end

  it 'Sort all Leader Positions' do
    rank_data = LeaderDetermination.new.assemble_rank_data
    expect(rank_data['Overall'].length).to eq(1)
  end

  it 'rank marks' do
    expect(LeaderDetermination.new.rankings("python")).to eq([])
  end

  it 'cluster ranks' do
    expect(LeaderDetermination.new.all_cluster_ranks).to eq([["AppleFanboys", []], ["Overall", []]])
  end

end
