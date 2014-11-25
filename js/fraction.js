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

Fraction = (function FractionFactory() {
    //Create local Error class for module
    var ModuleError = ModuleErrorFactory('Fraction');

    //Create BigInteger constants
    var ZERO = new BigInteger('0');
    var ONE = new BigInteger('1');
    var TEN = new BigInteger('10');

    //Constructor
    function Fraction() {
        if(arguments[0] instanceof BigInteger
           && arguments[1] instanceof BigInteger) {
            this.fromBigInteger(arguments[0], arguments[1]);
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
        this.fromBigInteger(fraction.numerator, fraction.denominator);
    };
    Fraction.prototype.fromBigInteger
    = function fromBigInteger(numerator, denominator) {
        this.numerator = numerator;
        if(denominator.equals(ZERO)) {
            throw new ModuleError('DenominatorZero', 'Can not divide by zero');
        };
        this.denominator = denominator;
    };
    Fraction.prototype.fromString = function fromString(string) {
        var input = string.split('/');
        if(input.length < 2) {
            input.push('1');
        }
        this.fromBigInteger(
            new BigInteger(input[0]),
            new BigInteger(input[1])
        );
    };

    //Conversion functions
    Fraction.prototype.toString = function toString() {
        if(this.denominator.equals(ONE)) {
            return this.numerator.toString();
        };
        return this.numerator.toString() + '/' + this.denominator.toString();
    };
    Fraction.prototype.toSignum = function toSignum() {
        return this.numerator.signum() * this.denominator.signum();
    };
    Fraction.prototype.toInteger = function toInteger() {
        return this.numerator.divide(this.denominator);
    };

    Fraction.prototype.copy = function copy() {
        return new Fraction(this);
    };

    //Arithmetic operation functions
    Fraction.prototype.add = function add(fraction) {
        //Extend fractions if denominators are not equal
        if(!this.denominator.equals(fraction.denominator)) {
            this.numerator =
                this.numerator.multiply(fraction.denominator).add(
                    fraction.numerator.multiply(this.denominator)
                );
            this.denominator = this.denominator.multiply(fraction.denominator);
        } else {
            this.numerator = this.numerator.add(fraction.numerator);
        };

        return this;
    };
    Fraction.prototype.subtract = function sub(fraction) {
        //Extend fractions if denominators are not equal
        if(!this.denominator.equals(fraction.denominator)) {
            this.numerator =
                this.numerator.multiply(fraction.denominator).subtract(
                    fraction.numerator.multiply(this.denominator)
                );
            this.denominator = this.denominator.multiply(fraction.denominator);
        } else {
            this.numerator = this.numerator.subtract(fraction.numerator);
        };

        return this;
    },
    Fraction.prototype.multiply = function mul(fraction) {
        //Multiply numerator and denominator of fractions
        this.numerator = this.numerator.multiply(fraction.numerator);
        this.denominator = this.denominator.multiply(fraction.denominator);

        return this;
    };
    Fraction.prototype.divide = function div(fraction) {
        //Check if divisor is zero
        if(fraction.numerator.equals(ZERO)) {
            throw ModuleError('DivideByZero', 'Can not divide by Zero');
        };
        //Multiply numerator and denominator of fractions
        this.numerator = this.numerator.multiply(fraction.denominator);
        this.denominator = this.denominator.multiply(fraction.numerator);

        return this;
    };
    Fraction.prototype.power = function pow(fraction) {
        //Create local unsigned copy of exponent
        var signum = fraction.toSignum();
        fraction = fraction.copy().cancel().abs();

        //Check if exponent is a whole number. Non whole exponents would
        //produce irrational numbers, who can not be represented by the
        //classes of this module
        if(!fraction.denominator.equals(ONE)) {
            throw new ModuleError('Power', 'Exponent can not be fractional');
        };

        if(signum === 0) {
            //If exponent equals zero the resulting fraction equals one
            this.numerator = ONE;
            this.denominator = ONE;
        } else {
            //Multiply numerator exponent times
            var factor = this.copy();
            if(signum === 1) {
                for(var i = ONE; !i.equals(fraction.numerator);
                    i = i.add(ONE)) {
                    this.multiply(factor)
                };
            } else {
                this.divide(factor);
                for(var i = ZERO; !i.equals(fraction.numerator);
                    i = i.add(ONE)) {
                    this.divide(factor)
                };
            };
        };

        return this;
    };
    Fraction.prototype.abs = function abs() {
        this.numerator = this.numerator.abs();
        this.denominator = this.denominator.abs();

        return this;
    };
    Fraction.prototype.floor = function floor() {
        this.numerator = this.toInteger();
        this.denominator = ONE;

        return this;
    };
    Fraction.prototype.remainder = function remainder() {
        this.numerator = this.numerator.subtract(
            this.toInteger().multiply(this.denominator)
        );

        return this;
    };
    Fraction.prototype.cancel = function cancel() {
        //Cancel out common factors
        while(true) {
            var divisor = this.numerator.gcd(this.denominator);
            if(divisor.equals(ONE)) {
                break;
            };
            this.numerator = this.numerator.divide(divisor);
            this.denominator = this.denominator.divide(divisor);
        };
        //Compute sign of the fraction and store it in numerator
        if(this.toSignum() === -1) {
            this.numerator = this.numerator.abs().negate();
            this.denominator = this.denominator.abs();
        } else {
            this.numerator = this.numerator.abs();
            this.denominator = this.denominator.abs();
        };

        return this;
    };

    //Comparision functions
    Fraction.prototype.equals = function equals(fraction) {
        return this.numerator.equals(fraction.numerator) &&
               this.denominator.equals(fraction.denominator);
    };

    return Fraction;
})();
