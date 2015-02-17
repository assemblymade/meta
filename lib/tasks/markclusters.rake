namespace :markclusters do

  task :assign_marks_to_clusters => :environment do
    #delete all previous mark clusters
    MarkCluster.all.delete_all

    #create 5 clusters
    nameset = ['Backend', 'Mobile', 'Design/Copy', 'Frontend', 'Business/Marketing']

    (0..4).each do |a|
      name = nameset[a]
      MarkCluster.create!({name: name})
    end

    #Backend assignments
    backend = MarkCluster.find_by(name: 'Backend')
    backend.assign_mark("rails")
    backend.assign_mark("ruby")
    backend.assign_mark("api")
    backend.assign_mark("redis")
    backend.assign_mark("python")
    backend.assign_mark("postgres")
    backend.assign_mark("mongodb")
    backend.assign_mark("bug")
    backend.assign_mark("node")
    backend.assign_mark("node.js")
    backend.assign_mark("devops")
    backend.assign_mark("flask")
    backend.assign_mark("sql")
    backend.assign_mark("bitcoin")
    backend.assign_mark("java")
    backend.assign_mark("backend")
    backend.assign_mark("postgresql")
    backend.assign_mark("code")
    backend.assign_mark("development")
    backend.assign_mark("php")
    backend.assign_mark("go")

    #Mobile assignments
    mobile = MarkCluster.find_by(name: 'Mobile')
    mobile.assign_mark("android")
    mobile.assign_mark("ios")
    mobile.assign_mark("mobile")

    #Design assignments
    design = MarkCluster.find_by(name: 'Design/Copy')
    design.assign_mark("design")
    design.assign_mark("product")
    design.assign_mark("copy")
    design.assign_mark("logo")
    design.assign_mark("email")
    design.assign_mark("wireframing")

    #Frontend assignments
    frontend = MarkCluster.find_by(name: 'Frontend')
    frontend.assign_mark("frontend")
    frontend.assign_mark("css")
    frontend.assign_mark("html")
    frontend.assign_mark("bootstrap")
    frontend.assign_mark("html-css")
    frontend.assign_mark("ui-ux")
    frontend.assign_mark("react")

    #Business assignments
    business = MarkCluster.find_by(name: 'Business/Marketing')
    business.assign_mark("discussion")
    business.assign_mark("announcement")
    business.assign_mark("marketing")
    business.assign_mark("strategy")
    business.assign_mark("branding")
    business.assign_mark("monetization")

  end
end
