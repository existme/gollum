# Configuration without authentication
require 'gollum/app'
require 'sinatra/base'
load 'assets/rb/plant-filter.rb'
load 'assets/rb/traverse.rb'
load 'assets/rb/extended-endpoints.rb'

plantuml_srv = ENV['PLANTUML_SRV']

if(plantuml_srv==nil)
  plantuml_srv = "http://www.plantuml.com/plantuml/png"
end

p "Starting up gollum-custom-template"
p "=================================="
p "Using PlantUML server [PLANTUML_SRV]: #{plantuml_srv}"

wiki_options = {
  :allow_uploads => true,
    :per_page_uploads => true,
    :allow_editing => true,
    :css => false,
    # :js => true,
    :mathjax => false,
    :h1_title => true,
    :emoji => true,
    :plantuml_url => plantuml_srv,
    :ref => "master",
    :universal_toc => true,
    :show_all => true,
    :latest_changes_count => 1000,
    # :filter_chain => [ :PlantUML2, :Metadata, :PlainText, :TOC, :RemoteCode, :Code, :Macro, :Emoji, :Sanitize, :WSD, :PlantUML, :Tags, :Render ]
    :filter_chain => [:Metadata, :PlainText, :TOC, :PlantUML2, :Code, :Macro, :Emoji, :PlantUML, :Render]
}

Precious::App.set(:wiki_options, wiki_options)
Precious::App.set(:environment, :production)
# Precious::App.set(:wiki_options, {
#     :universal_toc => true,
# }

# Precious::App.set
# Gollum::Hook.register(:post_commit, :hook_id) do |committer, sha1|
#            system('assets/hooks/post-commit')
# end

Gollum::Filter::PlantUML.configure do |config|
  config.url = plantuml_srv
  config.verify_ssl = false
end

if ENV['GOLLUM_AUTH'] == "ldap"
  # see https://github.com/omniauth/omniauth-ldap
  require 'omnigollum'
  require 'omniauth-ldap'

  p ENV['GLDAP_TITLE']
  p ENV['GLDAP_HOST']
  p ENV['GLDAP_PORT']
  p ENV['GLDAP_BASE']
  p ENV['GLDAP_UID']
  p ENV['GLDAP_FILTER']
  p ENV['GLDAP_BIND_DN']
  p ENV['GLDAP_PASSWORD']
  options = {
    :providers => Proc.new do
      provider :ldap,
               :title => ENV['GLDAP_TITLE'],
               :host => ENV['GLDAP_HOST'],
               :port => ENV['GLDAP_PORT'],
               :method => :ssl,
               :base => ENV['GLDAP_BASE'],
               :uid => ENV['GLDAP_UID'],
               :filter => ENV['GLDAP_FILTER'],
               :bind_dn => ENV['GLDAP_BIND_DN'],
               :password => ENV['GLDAP_PASSWORD']
    end,
      :dummy_auth => false,
      :protected_routes => ['/*'],
      # :author_format => Proc.new { |user| raise user.inspect },
      :author_email => Proc.new { |user| user.email },
      :authorized_users => nil
  }

  Precious::App.set(:omnigollum, options)
  Precious::App.register Omnigollum::Sinatra
end