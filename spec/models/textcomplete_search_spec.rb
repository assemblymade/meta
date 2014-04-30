require 'spec_helper'

describe TextcompleteSearch do
  let(:product) { double('Product') }

  describe '#search' do
    it 'returns search results matching the query' do
      [['vanstee', 'Patrick'], ['vanstew', 'Pat'], ['whatupdave', 'Dave']].each { |username, name| User.make!(username: username, name: name) }

      textcomplete_search = TextcompleteSearch.new(product, '@van')
      expect(textcomplete_search.search).to match_array([['@vanstee', 'Patrick'], ['@vanstew', 'Pat']])
    end

    it 'returns an empty array if the query type cannot be determined' do
      textcomplete_search = TextcompleteSearch.new(product, 'oops')
      expect(textcomplete_search.search).to eq([])
    end
  end

  describe '#query_type' do
    it 'determines the what to search for based on the first letter of the query' do
      textcomplete_search = TextcompleteSearch.new(product, '#352')
      expect(textcomplete_search.query_type).to eq(:wips)
    end
  end

  describe '#users' do
    it 'returns usernames that match the given query' do
      [['vanstee', 'Patrick'], ['vanstew', 'Pat'], ['whatupdave', 'Dave']].each { |username, name| User.make!(username: username, name: name) }

      textcomplete_search = TextcompleteSearch.new(product, '@van')
      expect(textcomplete_search.users).to match_array([['@vanstee', 'Patrick'], ['@vanstew', 'Pat']])
    end
  end

  describe '#wips' do
    let!(:product) { Product.make! }

    it 'returns numbers that match the given query' do
      [[1, 'New navbar'], [12, 'Bug in comments'], [34, 'Moodboard']].each { |number, title| Task.make!(number: number, title: title, product: product) }
      Task.make!(number: 13)

      textcomplete_search = TextcompleteSearch.new(product, '#1')
      expect(textcomplete_search.wips).to match_array([['#1', 'New navbar'], ['#12', 'Bug in comments']])
    end
  end

  describe '#cleaned_query' do
    it 'strips off the type specifier' do
      textcomplete_search = TextcompleteSearch.new(product, '#352')
      expect(textcomplete_search.cleaned_query).to eq('352')
    end
  end
end
