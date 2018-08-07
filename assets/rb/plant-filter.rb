# ~*~ encoding: utf-8 ~*~
require 'gollum/app'

class Gollum::Filter::PlantUML2 < Gollum::Filter

  # Extract all sequence diagram blocks into the map and replace with
  # placeholders.
  def extract(data)
    return data if @markup.format == :txt
    # ap data
    # data.gsub!(/^([ \t]*)(```+) ?([^\r\n]+)?\r?\n(.+?)\r?\n\1(```+)[ \t\r]*$/m) do
    #     m_indent = Regexp.last_match[1]
    #     m_start  = Regexp.last_match[2] # ```
    #     m_lang   = Regexp.last_match[3]
    #     m_code   = Regexp.last_match[4]
    #     m_end    = Regexp.last_match[5] # ```
    #     next '' if m_start.length != m_end.length
    #     lang = m_lang ? m_lang.strip : nil
    #     if lang=="sequence" || lang=="uml"
    #         "#{m_indent}#{replace_plantuml_tags(lang, m_code, m_indent)}"
    #     else
    #         "#{m_indent}#{replace_code_tags(lang, m_code, m_indent)}"
    #     end
    # end
    data.gsub!(/^([ \t]*)(~~~+) ?([^\r\n]+)?\r?\n(.+?)\r?\n\1(~~~+)[ \t\r]*$/m) do
        m_indent = Regexp.last_match[1]
        m_start  = Regexp.last_match[2] # ~~~
        m_lang   = Regexp.last_match[3]
        m_code   = Regexp.last_match[4]
        m_end    = Regexp.last_match[5] # ~~~
        next '' if m_start.length != m_end.length
        lang = m_lang ? m_lang.strip : nil
        if lang=="sequence" || lang=="uml"
            "#{m_indent}#{replace_plantuml_tags(lang, m_code, m_indent)}"
        end
    end
    return data
  end

  def replace_plantuml_tags(language, code, indent = "")
    language = language.to_s.empty? ? nil : language
    "@startuml\n#{code}\n@enduml\n"
  end

  def replace_code_tags(language, code, indent = "")
    language = language.to_s.empty? ? nil : language
    puts "~~~#{language}\n#{code}\n~~~\n"
    "~~~#{language}\n#{code}\n~~~\n"
  end
  def process(data)
    data
  end

end

