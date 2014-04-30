if defined?(RSpec)
  namespace :spec do
    RSpec::Core::RakeTask.new(:fast) do |t|
      t.spec_opts = ['--profile', '--tag', '~slow']
    end
  end
end