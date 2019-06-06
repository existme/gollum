module Precious
  module HasPage
    def path
      @page.path
    end

    def escaped_url_path
      @page.escaped_url_path
    end

    def format
      @page.format.to_s
    end

    def git_path
      # generate a link to the repository page
      # origin = @page.wiki.repo.git.instance_variable_get(:@repo).remotes["origin"]
      origin = Precious::App.settings.wiki_options[:git_source]
      unless origin.nil?
        path = @page.path
        origin.sub('PATH', path)
      end
    end
  end
end
