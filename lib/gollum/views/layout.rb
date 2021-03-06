require 'cgi'

module Precious
  module Views
    class Layout < Mustache
      include Rack::Utils
      alias_method :h, :escape_html

      attr_reader :name, :path

      def plantuml_url
        Gollum::Filter::PlantUML.configuration.url
      end

      def author
        @request.session['default_committer_name']
      end

      def escaped_name
        CGI.escape(@name)
      end

      def title
        "Home"
      end

      def has_path
        !@path.nil?
      end

      def page_dir
        @page_dir
      end

      def base_url
        @base_url
      end

      def custom_path
        "#{@base_url}#{@page_dir.empty? ? '' : '/'}#{@page_dir}"
      end

      def css # custom css
        @css
      end

      def js # custom js
        @js
      end

      # Passthrough additional omniauth parameters for status bar
      def user_authed
        @user_authed
      end

      def user_provider
        @user.provider
      end

      def user_name
        !@user.nil? ? @user.name : author
      end
    end
  end
end
