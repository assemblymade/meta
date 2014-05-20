require 'spec_helper'

describe TextFilters::AssetInlineFilter do
  def filter(html)
    @result = {}
    TextFilters::AssetInlineFilter.call(html, {}, @result)
  end

  context 'gif link' do
    it 'replaces with img' do
      body = "<a href=\"http://fun.co/image.gif\">http://fun.co/image.gif</a>"
      filter(body).to_html.should == "<a href=\"http://fun.co/image.gif\"><img src=\"http://fun.co/image.gif\"></a>"
    end

    it 'has references' do
      body = "Some <a href=\"http://fun.co/image.gif\">http://fun.co/image.gif</a> stuff <a href=\"http://fun.co/image2.gif\">http://fun.co/image2.gif</a>"
      filter(body)
      @result[:assets][:images].should =~ ['http://fun.co/image.gif', 'http://fun.co/image2.gif']
    end
  end
end
