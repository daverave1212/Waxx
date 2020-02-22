import yaml

class MyDumper(yaml.Dumper):

    def increase_indent(self, flow=False, indentless=False):
        return super(MyDumper, self).increase_indent(flow, False)

def printDict(d):
    print(yaml.dump(d, Dumper=MyDumper, default_flow_style=False))