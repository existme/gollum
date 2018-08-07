#!/usr/bin/python

import os
from time import sleep

sleep(0.5)
TAB = '  '
dir_path = os.path.dirname(os.path.realpath(__file__))
dir_path = os.path.abspath(dir_path + "/../../")
# HOME = os.path.abspath('.')
HOME = dir_path
FILE = dir_path+"/folder.json"
files = ['config.rb', '.gitignore' ]
ignored_folders = ('.git', 'node_modules', '.idea', 'assets')

# files: coming from os.listdir() sorted alphabetically, thus not numerically
def cmp_f(x, y):
    # print x+" "+y+" cmp:"+str(cmp(x,y))
    if os.path.isdir(x) and os.path.isdir(y):
        return cmp(x, y)
    elif os.path.isdir(x):
        return -1
    elif os.path.isdir(y):
        return 1
    else:
        return cmp(x, y)


# sorted_files = sorted(files, cmp_f)
# print sorted_files
# exit(0)


with open("folder.json", "w") as f_out:
    f_out.write("[\n")


def write_to_file(text):
    with open(FILE, "a") as f_out:
        f_out.write(text + "\n")
    # print(text)


def write_open_folder(ident, name, path):
    write_to_file(TAB * ident + "{")
    write_to_file(TAB * (ident + 1) + '"key": "' + path + '",')
    write_to_file(TAB * (ident + 1) + '"title": "' + name + '",')
    write_to_file(TAB * (ident + 1) + '"folder": true,')
    if ident>=1:
        write_to_file(TAB * (ident + 1) + '"lazy": true,')
    write_to_file(TAB * (ident + 1) + '"children": [')


def write_page(ident, name, path):
    path = os.path.realpath(path)
    rel_path = os.path.relpath(path, HOME)
    filename, file_extension = os.path.splitext(rel_path)
    file_extension = file_extension[1:]

    write_to_file(TAB * ident + "{")
    write_to_file(TAB * (ident + 1) + '"key": "' + rel_path + '",')
    write_to_file(TAB * (ident + 1) + '"title": "' + name + '",')
    write_to_file(TAB * (ident + 1) + '"href": "' + filename + '",')
    write_to_file(TAB * (ident + 1) + '"icon": "' + file_extension + '"')
    write_to_file(TAB * ident + "}")

def write_pic(ident, name, path):
    rel_path = os.path.relpath(path, HOME)
    filename, file_extension = os.path.splitext(rel_path)
    file_extension = file_extension[1:]

    write_to_file(TAB * ident + "{")
    write_to_file(TAB * (ident + 1) + '"key": "' + rel_path + '",')
    write_to_file(TAB * (ident + 1) + '"title": "' + name + '",')
    write_to_file(TAB * (ident + 1) + '"href": "' + rel_path + '",')
    write_to_file(TAB * (ident + 1) + '"icon": "' + file_extension + '"')
    write_to_file(TAB * ident + "}")


def write_close_folder(ident):
    write_to_file('  ' * (ident + 1) + ']')  # close children
    write_to_file('  ' * ident + '}')  # close folder


def write_extra_comma(is_first, ident):
    if not is_first:
        write_to_file('  ' * ident + ',')


def traverse(abs_path, path="", ident=0):
    if path == "":
        traverse(os.path.abspath(abs_path), abs_path, 0)
        return

    # write_to_file('  ' * index + path)
    if path != ".":
        write_open_folder(ident, path, abs_path)

    files = os.listdir(os.path.realpath(abs_path))
    sorted_files = sorted(files, cmp_f)
    # files = (os.path.join(os.path.abspath(path), file) for file in files)
    is_first = True
    for item in sorted_files:
        abs_file = os.path.join(abs_path, item)
        if os.path.isdir(abs_file) or os.path.islink(abs_file):
            if not item.endswith(tuple(ignored_folders)):
                write_extra_comma(is_first, ident + 1)
                traverse(abs_file, item, ident + 1)
                # write_open_folder(ident+1, item, abs_file)
                # write_close_folder(ident+1)
                is_first = False
        elif item.endswith('.md') and not item.startswith('_'):
            write_extra_comma(is_first, ident + 1)
            write_page(ident + 1, item, abs_file)
            is_first = False
        elif item.endswith('.png') or item.endswith('.jpg'):
            write_extra_comma(is_first, ident + 1)
            write_pic(ident + 1, item, abs_file)
            is_first = False
            # write_to_file('  ' * (ident + 1) + i)
        # else:
        #     print("xxxx "+i)

    if path != ".":
        write_close_folder(ident)


with open("folder.json", "w") as f_out:
    f_out.write("[\n")
traverse(".")
write_to_file("]\n")
print "\n\n Writing to: "+FILE+"\n\n"
print "\n\n Folder structure traverse completed successfully\n\n"
