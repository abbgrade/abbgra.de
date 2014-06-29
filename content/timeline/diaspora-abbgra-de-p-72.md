title: blob = numpy.from...
slug: diaspora-abbgra-de-p-72
category: timeline
type: base
datetime: 2013-10-16 19:09:11
actions: [["show diaspora", "https://diaspora.abbgra.de/p/72"]]
---
_blob = numpy.frombuffer(data, numpy.dtype('i%d' % len(data)))_

results in:

_ValueError: buffer size must be a multiple of element size_

isn't 1 a multiple, [#numpy](/tags/numpy) ?


