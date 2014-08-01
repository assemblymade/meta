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

  it 'filters by deliverable' do
    query = FilterWipsQuery.new(product_wips, user, { deliverable: 'code' })

    expect(query.deliverable_filter).to eq(Wip.where(deliverable: 'code'))
  end

  it 'does not filter if deliverable is empty' do
    query = FilterWipsQuery.new(product_wips, user, {})

    expect(query.deliverable_filter).to be_nil
  end


  it 'selects a page' do
    query = FilterWipsQuery.new(product_wips, user, { page: 2 })

    expect(query.page_selection).to eq(Wip.page(2))
  end
end
