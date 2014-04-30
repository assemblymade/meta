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
    query = FilterWipsQuery.new(product_wips, user, { state: 'reviewing' })

    expect(query.state_filter).to eq(Wip.where(state: 'reviewing'))
  end

  it 'filters by user if state is "personally_allocated"' do
    query = FilterWipsQuery.new(product_wips, user, { state: 'personally_allocated' })

    expect(query.state_filter).to eq(user.wips_working_on)
  end

  it 'does not filter if state is empty' do
    query = FilterWipsQuery.new(product_wips, user, {})

    expect(query.state_filter).to be_nil
  end

  it 'filters by deliverable' do
    query = FilterWipsQuery.new(product_wips, user, { deliverable: 'code' })

    expect(query.deliverable_filter).to eq(Wip.where(deliverable: 'code'))
  end

  it 'does not filter if deliverable is empty' do
    query = FilterWipsQuery.new(product_wips, user, {})

    expect(query.deliverable_filter).to be_nil
  end

  it 'includes a sort order' do
    query = FilterWipsQuery.new(product_wips, user, { sort: 'created' })

    expect(query.sort_order).to eq(Wip.order('wips.created_at DESC'))
  end

  it 'selects a page' do
    query = FilterWipsQuery.new(product_wips, user, { page: 2 })

    expect(query.page_selection).to eq(Wip.page(2))
  end
end
