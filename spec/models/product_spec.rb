require 'spec_helper'

describe Product do
  let(:creator) { User.make! }
  let(:product) { Product.make!(user: creator) }
  let(:user) { User.make! }
  let(:ip) { '127.0.0.1' }

  describe '#to_param' do
    it 'is slug if present' do
      expect(
        Product.make!(slug: 'snapcat').to_param
      ).to eq('snapcat')
    end

    it 'is id if no slug' do
      product = Product.make!
      product.slug = nil
      expect(product.to_param).to eq(product.id)
    end
  end

  it 'generates an authentication token before create' do
    product = Product.make!
    expect(product.authentication_token).not_to be_blank
  end

  describe '#watchers' do
    let(:watcher) { User.make! }
    subject(:product) { Product.make! }

    before {
      product.watch! watcher
    }

    it 'has watcher' do
      product.watchers =~ [watcher]
    end
  end

  describe "#core_team" do
    let(:badass) { User.make! }

    before {
      product.team_memberships.create(user: badass, is_core: true)
    }

    subject { product }

    its(:core_team) { should =~ [badass] }

    it 'checks membership' do
      product.core_team?(badass).should be_truthy
    end
  end

  describe '#github_repos' do
    let(:repos) {
      [
        Repo::Github.new('https://github.com/asm-helpful/helpful-web'),
        Repo::Github.new('https://github.com/asm-helpful/helpful-ios'),
      ]
    }

    before {
      product.repos = repos
      product.save!
    }

    subject { product }

    it 'has repos' do
      expect(product.repos).to eq(repos)
    end
  end

  it 'returned featured products by date of featuring' do
    product_1 = Product.make!
    product_2 = Product.make!
    product_2.feature!
    product_1.feature!
    Product.featured.first.should == product_1
  end

  describe '#tags_string' do
    it 'joins the tags into a single, editable string' do
      product = Product.new(tags: ['Ruby', 'Rails', 'Postgres'])

      expect(product.tags_string).to eq('Ruby, Rails, Postgres')
    end
  end

  describe '#tags_string=' do
    it 'splits a comma separated string into individual tags' do
      product = Product.new

      product.tags_string = 'Ruby, Rails, Postgres'

      expect(product.tags).to eq(['Ruby', 'Rails', 'Postgres'])
    end
  end

  it 'should not show flagged products in latest' do
    product         = Product.make!
    flagged_product = Product.make!(:flagged_at => 1.hour.ago)
    Product.latest.should include(product)
    Product.latest.should_not include(flagged_product)
  end

  describe '#core_team_memberships' do
    it 'should be unique for user and product' do
      product.team_memberships.create(user: user, is_core: false)
      expect {
        product.team_memberships.create(user: user, is_core: true)
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe '#logo' do
    it 'falls back to PosterImage' do
      expect(product.poster_image).not_to be_a(Asset)
      expect(product.poster_image).to be_a(PosterImage)
    end

    it 'uses a logo (Asset) if it has one' do
      user = User.make!
      attachment = Attachment.make!
      product = Product.make!
      logo = Asset.create(name: 'trillian.png', attachment: attachment, user: user, product: product)
      product.logo = logo

      expect(product.poster_image).not_to be_a(PosterImage)
      expect(product.poster_image).to be_a(Asset)
    end
  end

  describe '#assembly?' do
    it 'only returns true if the product is assembly' do
      product.slug = 'asm'
      expect(product).to be_assembly

      product.slug = 'monocle'
      expect(product).not_to be_assembly
    end
  end

  describe '#contributors' do
    it 'includes the product creator' do
      expect(product.contributors).to include(creator)
    end
  end

  it 'stores additional fields in info' do
    product = Product.make!
    fields = %w(goals key_features target_audience competing_products competitive_advantage monetization_strategy)
    fields.each do |field|
      product.send :"#{field}=", field
    end
    product.save!
    product.reload

    fields.each do |field|
      expect(product.send(field.to_sym)).to eq(field)
    end
  end

  describe '#try_url=' do
    it 'sets try_url to nil if blank' do
      product = Product.make!

      product.try_url = 'http://test.com'
      expect(product.try_url).to eq('http://test.com')

      product.try_url = '  '
      expect(product.try_url).to be_nil
    end
  end
end
