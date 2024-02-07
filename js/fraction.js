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

/**/

// some helper functions for BigInts which are not part of js standard lib
function intSignFromBigInt(x) {
    return x >= 0 ? 1 : -1;
}

function bigIntAbsFromBigInt(x) {
    return x >= 0 ? x : -x;
}

function bigIntGcdFromBigInts(x, y) {
    x = BigInt(x);
    y = BigInt(y);
    while (y != 0n) {
      let tmp = y;
      y = x % y;
      x = tmp;
    }
    return x;
}

Fraction = (function FractionFactory() {
    //Create local Error class for module
    var ModuleError = ModuleErrorFactory('Fraction');

    //Constructor
    function Fraction() {
        if(arguments[0] instanceof BigInt
           && arguments[1] instanceof BigInt) {
            this.fromBigInt(arguments[0], arguments[1]);
        };
        if(typeof arguments[0] === 'string') {
            this.fromString(arguments[0]);
        };
        if(arguments[0] instanceof Fraction) {
            this.fromFraction(arguments[0]);
        };
    };

    //Initialisation functions
    Fraction.prototype.fromFraction = function fromFraction(fraction) {
        this.fromBigInt(fraction.numerator, fraction.denominator);
    };
    Fraction.prototype.fromBigInt
    = function fromBigInt(numerator, denominator) {
        this.numerator = numerator;
        if(denominator === 0n) {
            throw new ModuleError('DenominatorZero', 'Can not divide by zero');
        };
        this.denominator = denominator;
    };
    Fraction.prototype.fromString = function fromString(string) {
        var input = string.split('/');
        if(input.length < 2) {
            input.push('1');
        }
        this.fromBigInt(
            BigInt(input[0]),
            BigInt(input[1])
        );
    };

    //Conversion functions
    Fraction.prototype.toString = function toString() {
        if(this.denominator === 1n) {
            return this.numerator.toString();
        };
        return this.numerator.toString() + '/' + this.denominator.toString();
    };
    Fraction.prototype.toIntSign = function toIntSign() {
        return intSignFromBigInt(this.numerator) * intSignFromBigInt(this.denominator);
    };
    Fraction.prototype.toBigInt = function toBigInt() {
        return this.numerator / this.denominator;
    };

    Fraction.prototype.copy = function copy() {
        return new Fraction(this);
    };

    //Arithmetic operation functions
    Fraction.prototype.add = function add(fraction) {
        fraction = fraction.copy()
        //Extend fractions if denominators are not equal
        if(this.denominator !== fraction.denominator) {
            this.numerator =
                (this.numerator * fraction.denominator) +
                    (fraction.numerator * this.denominator);
            this.denominator = this.denominator * fraction.denominator;
        } else {
            this.numerator = this.numerator + fraction.numerator;
        };

        return this;
    };
    Fraction.prototype.subtract = function sub(fraction) {
        fraction = fraction.copy()
        //Extend fractions if denominators are not equal
        if(this.denominator !== fraction.denominator) {
            this.numerator =
                (this.numerator * fraction.denominator) -
                    (fraction.numerator * this.denominator);
            this.denominator = this.denominator * fraction.denominator;
        } else {
            this.numerator = this.numerator - fraction.numerator;
        };

        return this;
    },
    Fraction.prototype.multiply = function mul(fraction) {
        fraction = fraction.copy()
        //Multiply numerator and denominator of fractions
        this.numerator = this.numerator * fraction.numerator;
        this.denominator = this.denominator * fraction.denominator;

        return this;
    };
    Fraction.prototype.divide = function div(fraction) {
        fraction = fraction.copy()
        //Check if divisor is zero
        if(fraction.numerator === 0n) {
            throw ModuleError('DivideByZero', 'Can not divide by Zero');
        };
        //Multiply numerator and denominator of fractions
        this.numerator = this.numerator * fraction.denominator;
        this.denominator = this.denominator * fraction.numerator;

        return this;
    };
    Fraction.prototype.power = function pow(fraction) {
        fraction = fraction.copy()
        //Create local unsigned copy of exponent
        var signum = fraction.toSignum();
        fraction = fraction.copy().cancel().abs();

        //Check if exponent is a whole number. Non whole exponents would
        //produce irrational numbers, who can not be represented by the
        //classes of this module
        if(fraction.denominator !== 1n) {
            throw new ModuleError('Power', 'Exponent can not be fractional');
        };

        if(signum === 0) {
            //If exponent equals zero the resulting fraction equals one
            this.numerator = 1n;
            this.denominator = 1n;
        } else {
            //Multiply numerator exponent times
            var factor = this.copy();
            if(signum === 1) {
                for(var i = 1n; i !== fraction.numerator; i += 1n) {
                    this.multiply(factor)
                };
            } else {
                this.divide(factor);
                for(var i = 0n; i !== fraction.numerator; i += 1n) {
                    this.divide(factor)
                };
            };
        };

        return this;
    };
    Fraction.prototype.abs = function abs() {
        this.numerator = bigIntAbsFromBigInt(this.numerator);
        this.denominator = bigIntAbsFromBigInt(this.denominator);

        return this;
    };
    Fraction.prototype.floor = function floor() {
        this.numerator = this.toBigInt();
        this.denominator = 1n;

        return this;
    };
    Fraction.prototype.remainder = function remainder() {
        this.numerator = this.numerator - (
            this.toBigInt() * this.denominator
        );

        return this;
    };
    Fraction.prototype.cancel = function cancel() {
        //Cancel out common factors
        while(true) {
            var divisor = bigIntGcdFromBigInts(this.numerator, this.denominator);
            if(divisor === 1n) {
                break;
            };
            this.numerator = this.numerator / divisor;
            this.denominator = this.denominator / divisor;
        };
        //Compute sign of the fraction and store it in numerator
        if(this.toSignum() === -1) {
            this.numerator = -bigIntAbsFromBigInt(this.numerator);
            this.denominator = bigIntAbsFromBigInt(this.denominator);
        } else {
            this.numerator = bigIntAbsFromBigInt(this.numerator);
            this.denominator = bigIntAbsFromBigInt(this.denominator);
        };

        return this;
    };

    //Comparision functions
    Fraction.prototype.equals = function equals(fraction) {
        return this.numerator === fraction.numerator &&
               this.denominator === fraction.denominator;
    };

    return Fraction;
})();
