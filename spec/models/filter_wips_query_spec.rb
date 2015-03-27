require 'spec_helper'

describe FilterWipsQuery do
  let(:product_wips) { double('Wips') }
  let(:user) { User.make! }
  let(:filters) { {} }

  it 'applies filters to the wips' do
    query = FilterWipsQuery.new(product_wips, user, filters)
    expect(query).to receive(:product_wips_with_users) { product_wips }

    expect(query).to receive(:apply_filters).with(product_wips)

    query.filter_wips
  end

  it 'filters by state' do
    query = FilterWipsQuery.new(product_wips, user, { state: 'open' })

    expect(query.state_filter).to eq(Wip.where(state: ['open', 'awarded', 'allocated', 'reviewing']))
  end

  it 'filters by multiple states' do
    query = FilterWipsQuery.new(product_wips, user, { state: ['open', 'closed'] })

    expect(query.state_filter).to eq(Wip.where(state: ['open', 'awarded', 'allocated', 'reviewing', 'closed', 'resolved']))
  end

  it 'selects a page' do
    query = FilterWipsQuery.new(product_wips, user, { page: 2 })

    expect(query.page_selection).to eq(Wip.page(2))
  end
end
