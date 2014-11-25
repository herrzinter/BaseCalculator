/*
 *  This file is part of BaseCalculator.
 *
 *  BaseCalculator is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  BaseCalculator is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with BaseCalculator.  If not, see <http://www.gnu.org/licenses/>.
 * */

/* This factory creates a local error class tied to a specific module. Each
 * exception is identified by a type, a description and the module name
 * */

ModuleErrorFactory = function(MODULE) {
    //Constructor
    function ModuleError(name, message) {
        this.name = name;
        this.message = message;
    };

    //Inheritance
    ModuleError.prototype = new Error();

    //Properties
    ModuleError.prototype.module = MODULE;

    //Conversion functions
    ModuleError.prototype.toString = function toString() {
        return this.name + ' error in ' + this.module + ': ' + this.message;
    };

    return ModuleError;
};
