require 'spec_helper'

describe Product do
  let(:creator) { User.make! }
  let(:product) { Product.make!(user: creator) }
  let(:user) { User.make! }
  let(:ip) { '127.0.0.1' }

  it 'should revert to id if slug is blank on to_param' do
    blank_slug_in_prod_that_messes_up_urls = ""
    product = Product.make!(:slug => blank_slug_in_prod_that_messes_up_urls)
    product.to_param.should == product.id
  end

  it 'generates an authentication token before create' do
    product = Product.make!
    expect(product.authentication_token).not_to be_blank
  end

  context 'evaluation' do
    let(:evaluator) { User.make! }

    it 'can be approved' do
      expect {
        product.approve!(evaluator)
      }.to change { product.is_approved }.from(nil).to(true)
    end

    it 'is evaluated by a user' do
      expect {
        product.decline!(evaluator)
      }.to change { product.evaluator }.from(nil).to(evaluator)
    end
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
      product.core_team << badass
    }

    subject { product }

    its(:core_team) { should =~ [badass] }

    it 'checks membership' do
      product.core_team?(badass).should be_true
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

    its(:repos) { should =~ repos}
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
      product.core_team << user
      expect {
        product.core_team << user
      }.to raise_error(ActiveRecord::RecordInvalid)
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
end
