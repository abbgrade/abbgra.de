title: blob = numpy.frombuffer(data, numpy.dtype('i%d...
slug: diaspora-abbgra-de-p-72
category: timeline
type: base
datetime: 2013-10-16 19:09:11
actions: [["show diaspora", "https://diaspora.abbgra.de/p/72"]]
---
*blob = numpy.frombuffer(data, numpy.dtype('i%d' % len(data)))*

results in:

*ValueError: buffer size must be a multiple of element size*

isn't 1 a multiple, #numpy ?
