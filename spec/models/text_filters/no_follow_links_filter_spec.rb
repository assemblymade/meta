require 'spec_helper'

describe TextFilters::NoFollowLinksFilter do
  def filter(html)
    @result = {}
    TextFilters::NoFollowLinksFilter.call(html, {}, @result)
  end

  it "adds rel=nofollow to links to external domains" do
    expect(
      filter("<a href='https://example.com'>link</a>").to_html
    ).to eq(
      "<a href=\"https://example.com\" rel=\"nofollow\">link</a>"
    )
  end

  it "doesn't add rel=nofollow to local links" do
    html = "<a href=\"https://treasure.assembly.com\">link</a>"
    expect(filter(html).to_html).to eq(html)
  end

end
