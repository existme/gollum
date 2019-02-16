Gem::Specification.new do |s|
  s.specification_version = 2 if s.respond_to? :specification_version=
  s.required_rubygems_version = Gem::Requirement.new('>= 0') if s.respond_to? :required_rubygems_version=
  s.rubygems_version = '1.3.5'
  s.required_ruby_version = '>= 1.9'

  s.name              = 'gollum-base'
  s.version           = '0.0.1'
  s.date              = '2019-02-16'
  s.license           = 'MIT'

  s.summary     = 'Needed gems for building gollum.'
  s.description = 'Needed gems for building gollum.'

  s.authors  = ['Reza Shams']
  s.email    = 'existme@gmail.com'

  s.require_paths = %w[lib]

  # s.executables = ['gollum']

  s.rdoc_options = ['--charset=UTF-8']

  s.add_dependency 'gollum-lib', '>= 4.2.7'
  s.add_dependency 'kramdown', '~> 1.9.0'
  s.add_dependency 'sinatra', '~> 1.4', '>= 1.4.4'
  s.add_dependency 'mustache', ['>= 0.99.5', '< 1.0.0']
  s.add_dependency 'useragent', '~> 0.16.2'
  s.add_dependency 'gemojione', '~> 3.2'

  # s.add_dependency 'github-markdown'
  s.add_dependency 'commonmarker'
  s.add_dependency 'gollum-rugged_adapter'
  s.add_dependency 'omniauth-ldap'
  # s.add_dependency 'omnigollum'

  s.add_development_dependency 'rack-test', '~> 0.6.2'
  s.add_development_dependency 'shoulda', '~> 3.5.0'
  s.add_development_dependency 'minitest-reporters', '~> 0.14.16'
  s.add_development_dependency 'twitter_cldr', '~> 3.2.0'
  s.add_development_dependency 'mocha', '~> 1.1.0'
  s.add_development_dependency 'test-unit', '~> 3.1.0'
  s.add_development_dependency 'webrick', '~> 1.3.1'

  # = MANIFEST =
  # = MANIFEST =

end
