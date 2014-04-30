require './lib/avatar'

describe Avatar do

  let(:user) { double(email: 'chris@assemblymade.com', avatar_url: nil) }

  it "#url" do
    expect(described_class.new(user).url(60).to_s).to eq(
      "https://gravatar.com/avatar/b0e32439634fc685bf41339110b704e8?d=https%3A%2F%2Fassemblymade.com%2Fassets%2Favatars%2Fdefault.png&s=60"
    )
  end

end
