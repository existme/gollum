module Gollum
  class Macro
    class TraverseMacro < Gollum::Macro
      def dump(obj)
        # puts YAML::dump(obj.inspect)
        # ap Oj.dump( obj, :mode => :object )

        # ap obj.local_variables
        # puts [obj.to_s.red,obj.inspect].join(" : ".blue)
        # puts "\n.........................\n"
        obj.instance_variables.map do |var|
          puts [var.to_s.red, obj.instance_variable_get(var)].join(' : '.blue)
          puts obj.instance_variable_get(var).to_yaml[0..200].green
        end
        # puts obj.to_yaml
        # data = [ false, 42, %w(forty two), { :now => Time.now, :class => Time.now.class, :distance => 42e42 } ]
        # ap data
      end

      def render(_title = 'Global Table of Contents')
        # dump(@wiki)
        render_file
      end

      def new_folder(folder_path)
        new_sub_folder folder_path
      end

      def new_sub_folder(path, folder)
        %(<li class="folder" data-href="#{folder}">#{path}<ul>)
      end

      def enclose_tree(string)
        %(<div id="tree"><ul id="treeData" style="display:none" class="tree">\n) + string + %(</ul></div>)
      end

      def new_page(page)
        name = ::File.basename(page.path)
        url, valid_page = url_for_page page
        path = page.path
        if path.end_with?('.md')
          %(<li data-href="#{url}" id="#{path}" data-icon="md">#{name}</li>)
        elsif path.end_with?('.doc', '.docx')
          %(<li data-href="#{url}" id="#{path}" data-icon="doc">#{name}</li>)
        elsif path.end_with?('.png')
          %(<li data-href="#{url}" id="#{path}" data-icon="png">#{name}</li>)
        elsif path.end_with?('.jpg')
          %(<li data-href="#{url}" id="#{path}" data-icon="jpg">#{name}</li>)
        elsif path.end_with?('.gif')
          %(<li data-href="#{url}" id="#{path}" data-icon="gif">#{name}</li>)
        elsif path.end_with?('.pdf')
          %(<li data-href="#{url}" id="#{path}" data-icon="pdf">#{name}</li>)
        elsif path.end_with?('.txt', '.xml', '.js', '.java', '.py', 'pl')
          %(<li data-href="#{url}" id="#{path}" data-icon="txt">#{name}</li>)
        elsif path.end_with?('.zip')
          %(<li data-href="#{url}" id="#{path}" data-icon="zip">#{name}</li>)
        elsif path.end_with?('.css')
          %()
        else
          %(<li data-href="#{url}" id="#{path}" data-icon="uk">#{name}</li>)
        end
        # %Q(  <li class="file"><a href="#{url}">xxx#{name}</a>#{valid_page ? "" : delete_file(url, valid_page)}</li>)
      end

      def end_folder(_path)
        '</ul></li>'
      end

      def url_for_page(page)
        url = ''
        valid_page_name = false
        # Remove ext for valid pages.
        filename = page.filename
        valid_page_name = Page.valid_page_name?(filename)
        filename = valid_page_name ? filename.chomp(::File.extname(filename)) : filename

        url = ::File.join(::File.dirname(page.path), filename)
        url = url[2..-1] if url[0, 2] == './'
        [url, valid_page_name]
      end

      def render_file
        # @wiki.files : any file other than markdown
        # @wiki.pages : only markdown files
        @pages = @wiki.pages + @wiki.files
        html = ''
        count = @pages.size
        folder_start = -1
        ignored_list = Regexp.new('.*(assets)\/.*').freeze
        sorted_folders = []

        # Process all files
        count.times do |index|
          page = @pages[index]
          path = page.path
          unless ignored_list.match(path) || path.start_with?('"') || path.start_with?('.')
            sorted_folders += [[path, index]]
          end
        end

        # http://stackoverflow.com/questions/3482814/sorting-list-of-string-paths-in-vb-net
        sorted_folders.sort! do |first, second|
          a = first[0]
          b = second[0]

          # use :: operator because gollum defines its own conflicting File class
          dir_compare = ::File.dirname(a).casecmp(::File.dirname(b))
          # p (dir_compare.inspect)+" : "+::File.dirname(a)+" ? "+::File.dirname(b)
          # Sort based on directory name unless they're equal (0) in
          # which case sort based on file name.
          if dir_compare == 0
            ::File.basename(a).casecmp(::File.basename(b))
          else
            # if one of them is root page reverse the order
            if a.include?('/') && b.include?('/')
              dir_compare
            else
              -dir_compare
            end
          end
        end

        # keep track of folder depth, 0 = at root.
        prev_folders_array = []
        changed = false

        # process rest of folders
        (0...sorted_folders.size).each do |i|
          page = @pages[sorted_folders[i][1]]
          path = page.path
          folder = ::File.dirname path

          # Flattern root folder ./Home.md -> Home.md
          folder = '' if folder == '.'

          # split path by folders
          current_folders_array = folder.split '/'
          current_path = ''

          # current path will be the folder path at current depth, we will build
          # tree nodes for each subfolder
          (0...current_folders_array.size).each do |index|
            current_path += '/' unless current_path == ''
            current_path += current_folders_array[index]
            if prev_folders_array[index].nil? || changed
              html += new_sub_folder(current_folders_array[index], current_path)
              next
            end

            next unless prev_folders_array[index] != current_folders_array[index]
            changed = true
            # based on the depth change we should close previous nodes
            (prev_folders_array.size - index).times do
              html += end_folder current_folders_array[index]
            end
            prev_folders_array = current_folders_array
            html += new_sub_folder(current_folders_array[index], current_path)
          end

          # this is fix for root pages after the last folder
          if !prev_folders_array.empty? && current_folders_array.empty?
            prev_folders_array.size.times do
              html += end_folder ''
            end
          end

          # now we reached to leaf add the page
          html += new_page page
          prev_folders_array = current_folders_array
          changed = false
        end

        result = enclose_tree html
      end
    end
  end
end
