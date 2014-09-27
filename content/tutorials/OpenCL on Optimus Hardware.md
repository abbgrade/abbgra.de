title: OpenCL on Optimus Hardware
description: Make the OpenCL installation usable for applications.
type: tutorial
category: tutorials
tags: [linux, opencl, optimus]
date: 2014-03-15
---

If for example the error of pyopencl or clinfo is 
*libOpenCL.so.1: cannot open shared object file: No such file or directory*, but opencl is installed, it probably is required to link the binary to the right place.
    
Find where the binaries are:

    find /usr -name 'libOpenCL.so.1'
    find /opt -name 'libOpenCL.so.1'

An example result is:

    /usr/lib/x86_64-linux-gnu/libOpenCL.so
    /usr/lib/nvidia-319-updates/libOpenCL.so
    /usr/lib/nvidia-319-updates/libOpenCL.so.1.0.0
    /usr/lib/nvidia-319-updates/libOpenCL.so.1
    /usr/lib/nvidia-319-updates/libOpenCL.so.1.0
    /usr/lib32/nvidia-319-updates/libOpenCL.so
    /usr/lib32/nvidia-319-updates/libOpenCL.so.1.0.0
    /usr/lib32/nvidia-319-updates/libOpenCL.so.1
    /usr/lib32/nvidia-319-updates/libOpenCL.so.1.0
    
    /opt/intel/opencl-1.2-3.2.1.16712/lib64/libOpenCL.so
    /opt/intel/opencl-1.2-3.2.1.16712/lib64/libOpenCL.so.1
    /opt/intel/opencl-1.2-3.2.1.16712/lib64/libOpenCL.so.1.2

The nvidia and intel binaries are installed.
Configure them in a root shell:
    
    echo "/opt/intel/opencl-1.2-3.2.1.16712/lib64" > /etc/ld.so.conf.d/opencl-vendor-intel.conf
    echo "/usr/lib/nvidia-319-updates" > /etc/ld.so.conf.d/opencl-vendor-nvidia.conf
    ldconfig

## Sources

[StreamComputing - Install OpenCL on Debian, Ubuntu and Mint orderly](http://streamcomputing.eu/blog/2011-06-24/install-opencl-on-debianubuntu-orderly/)