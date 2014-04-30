require './lib/poster_image'

describe PosterImage do
  let(:product) { double('product', poster: '1234-abcd.jpg', poster?: true) }

  it "#url" do
    expect(
      described_class.new(product).url.to_s
    ).to eq(
      "1234-abcd.jpg"
    )
  end

end
