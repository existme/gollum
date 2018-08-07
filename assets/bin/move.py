#!/usr/bin/python

import os
import sys
import re
import fileinput

folder = sys.argv[1]


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


def process(item):
    text_to_search = "Andrew"
    replacement_text = "Reza"
    with open(item, 'r') as file:
        filedata = file.read()

    # filedata = filedata.replace(text_to_search, replacement_text)
    # filedata = re.sub(r"(.*)\[(.*?)\]\(\?c=(.*?)\)(.*)", "interfaceOpDataFile %s" % "reza", filedata)
    p = re.compile(r"\[(?P<title>.*)\](?P<link>.*)")
    print filedata
    print "----------"
    print p.sub('gray \g<title>', filedata);
    # print p.sub('link \g<link>', filedata);
    # print p.sub('blue \\2', filedata);


def traverse(abs_path, path="", ident=0):
    if path == "":
        traverse(os.path.abspath(abs_path), abs_path, 0)
        return

    files = os.listdir(abs_path)
    sorted_files = sorted(files, cmp_f)

    for item in sorted_files:
        abs_file = os.path.join(abs_path, item)
        if os.path.isdir(abs_file):
            print abs_file
        elif item.endswith('.md') and not item.startswith('_'):
            is_first = False
            print item
            process(abs_file)


print folder
traverse(folder)
