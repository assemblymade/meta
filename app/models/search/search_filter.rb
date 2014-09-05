module Search
  class SearchFilter < Struct.new(:name, :slug)
    def self.find(slug)
      all.find{|t| t.slug == slug } || raise(ActiveRecord::RecordNotFound, slug)
    end

    def self.find_by_name(name)
      all.find{|t| t.name == name }
    end
  end
end