BaseCalculator
========

BaseCalculator is a web based calculator implementing numbers of different
bases. The numbers are internally represented by a fraction and the usual
arithmetic operations can be used on the class. A mathematical expression
parser is also included.

Build
=======

After cloning the project, the submodules have to be initialised and updated:

```bash
git submodule init
git submodule update
# build jquery
cd external/jquery
npm run build
```

Licence
=======

All code and icons are released under the General Public Licence. Please see
COPYING for further information.
All external libraries are included as submodules in the external folder and 
have their own licencing.
