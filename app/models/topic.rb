class Topic < Struct.new(:slug, :name)
  def self.find(slug)
    all.find{|t| t.slug == slug }
  end

  def self.find_by_slug(slug)
    all.find{|t| t.slug == slug }
  end

  def self.all
    @all ||= [
      ['art', "Art & Design"],
      ['education', "Education"],
      ['entertainment', "Entertainment & Games"],
      ['lifestyle', "Family & Lifestyle"],
      ['mobile', "Mobile"],
      ['productivity', "Productivity & Tools"],
      ['saas', "SaaS"],
      ['social', "Social"]
    ].map{|args| new(*args) }
  end
end
