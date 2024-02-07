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

BaseFractionFactory = function BaseFractionFactory(DIGITS) {
    //Create local exception class for module
    var ModuleError = ModuleErrorFactory('Number');

    //The DIGITS array has to be initialized with a set of possible digits. By
    //its length it defines the maximum bases, while the minimum base and
    //therefore the minimum length of the array is two. During the
    //initialization the primefactors, which are needed to check if a
    //finit represenation of a number exists in a certain base, of all bases
    //are calculated.
    var PRIMEFACTORS = (function createPRIMEFACTORS() {
        if(DIGITS.length < 2) {
            throw new ModuleError('DigitArray',
                                  'At least two digits required');
        };

        //Calculate all prime numbers smaller than the maximal base
        var primes = [];
        for(var i = 2; i < DIGITS.length; i++) {
            var primeflag = true;
            for(var j = 2; j < i; j++) {
                if(i % j === 0) {
                    //If a divisor has been detected the number is not a prime
                    //number
                    primeflag = false;
                };
            };
            if(primeflag === true) {
                primes.push(i);
            };
        };

        //Calculate prime factors for bases
        PRIMEFACTORS = [NaN, NaN];
        for(var base = 2; i < DIGITS.length + 1; base++) {
            var primefactors = [];
            for(var i = 0; i < base; i++) {
                //Check if prime is primefactor of base
                if(base % primes[i] === 0) {
                    primefactors.push(BigInt(primes[i].toString()));
                };
            };
            PRIMEFACTORS.push(primefactors);
        }
        return PRIMEFACTORS;
    })();

    //Constructor
    function BaseFraction() {
        if(arguments[0] instanceof BigInt
           && arguments[1] instanceof BigInt
           && arguments[2] instanceof BigInt) {
            this.fromBigInt(arguments[0], arguments[1], arguments[2]);
        };
        if(typeof arguments[0] === 'string') {
            this.fromStringBase(arguments[0], arguments[1]);
        };
        if(arguments[0] instanceof BaseFraction) {
            this.fromBaseFraction(arguments[0]);
        };
    };

    //Inherit Fraction
    BaseFraction.prototype = new Fraction();
    BaseFraction.prototype.construtctor = BaseFraction;

    //Intialization functions
    BaseFraction.prototype.fromBaseFraction
    = function fromBaseFraction(baseFraction) {
        this.fromBigInt(baseFraction.numerator, baseFraction.denominator,
                            baseFraction.base);
    };
    BaseFraction.prototype.fromBigInt
    = function fromBigInt(numerator, denominator, base) {
        //Call initialization method of super class
        Fraction.prototype.fromBigInt.apply(this, arguments);
        this.base = base;
    };
    BaseFraction.prototype.fromStringBase
    = function fromStringBase(string, base) {
        base = base || 10;
        if(base < 2 || base > DIGITS.length) {
            throw new ModuleError(
                'Base',
                'Base is not between 2 and ' + DIGITS.length
            );
        };
        var baseBigInt = BigInt(base.toString());

        //Create fraction
        var numerator = 0n;
        //Identify sign and remove it from the string
        var sign = BigInt('1');
        if(string[0] === '-') {
            sign = BigInt('-1');
            string = string.slice(1, string.length);
        };
        //Identifiend point and remove it from the string
        var point = string.indexOf('.');
        if(point === -1) {
            point = string.length;
        };
        string = string.slice(0, point)
                 + string.slice(point + 1, string.length);
        //Calculate resulting shift
        var shift = BigInt((string.length - point).toString());

        //
        for(var i = 0; i < string.length; i++) {
            var value = DIGITS.indexOf(string[string.length - i - 1]);
            if(value >= base) {
                throw new ModuleError(
                    'Digit',
                    'Digit ' + DIGITS[value]
                    + ' is not defined for base ' + base
                );
            };
            numerator = numerator + (
                BigInt(value.toString()) * (
                    (baseBigInt ** BigInt(i.toString()))
                )
            );
        };

        //Call parent class initialization function
        this.fromBigInt(
            numerator * sign,
            baseBigInt ** shift,
            baseBigInt
        );
    };

    //Conversion functions
    BaseFraction.prototype.toString = function toString() {
        var isFinit = this.isFinit();
        //Calculate the finit or not finit representation of the remaining
        //proper fraction. This is necessary, as we can not use the
        //conversion algorithm for fractions.
        //The "pseudo floating point" object contains a BigInt
        //representation of the finit and infinit part of the number and
        //the factor, which shifted the post radix number to an integer
        function createFloat(numerator, denominator) {
            var valueArray = [];
            var string = '';
            var infinit = false;

            numerator = numerator * 10n;
            for(var i = 0; numerator !== 0n; i++) {
                //Recurrence detection
                if(valueArray.indexOf(numerator.toString()) > -1) {
                    infinit = valueArray.indexOf(numerator.toString());
                    break;
                };
                valueArray.push(numerator.toString());

                string += (numerator / denominator).toString();
                numerator = numerator % denominator;
                numerator = numerator * 10n;
            };

            var infinitlength = string.length - infinit;
            var finit = BigInt(string);
            if(infinit !== false) {
                var infinit = BigInt(
                    string.slice(infinit, string.length)
                );
                finit = finit - infinit;
            };
            var shift = 10n ** (BigInt((i).toString()));

            return {
                'finit' : finit,
                'infinit' : infinit,
                'infinitlength' : infinitlength,
                'shift' : shift,
            };
        };

        //Calculate the represenation of the number in the given base by
        //the usual conversion algorithm. The algorithm compensates if
        //the number is infinit in base 10 and finit in the target base and
        //calculates the new infinit part if the represenation in the
        //target base is also infinit
        function createPoststring(value, base) {
            var infinit = false;
            var valueArray = [];
            var string = '';

            //Add the infinit part to the finit part if existend
            if(value.infinit !== false) {
                value.finit = value.finit + value.infinit;
            };
            //The length of the infinit part
            //var length = value.infinit.toString().length;
            var length = value.infinitlength;
            var divisor = 10n ** BigInt(length.toString());

            //
            for(var j = 0; value.finit !== 0n; j++) {
                //Detect recurrence in the output string
                if(valueArray.indexOf(value.finit.toString()) > -1) {
                    infinit = valueArray.indexOf(value.finit.toString());
                    break;
                };
                valueArray.push(value.finit.toString());

                value.finit = value.finit * base;

                if(value.infinit !== false) {
                    //Append carry from infinit part
                    value.infinit = value.infinit * base;
                    var tmp = BigInt(value.infinit.toString());
                    var tmplength = tmp.toString().length;
                    //
                    for(i = length; i < tmplength; i = i + length) {
                        value.infinit = value.infinit + (
                            tmp / (10n ** BigInt(i.toString()))
                        );
                    };
                    var carry = value.infinit / divisor;
                    value.infinit = value.infinit - (carry * divisor);
                    //If output string is finit add one
                    if(j === 0 && isFinit) {
                        carry += 1n;
                    };
                    value.finit += carry;
                };

                var index = value.finit / value.shift;
                string += DIGITS[index];
                value.finit = value.finit - (index * value.shift);
            };
            //Add brackets to indicate recurrence
            if(infinit !== false) {
                string = string.slice(0, infinit) + '['
                    + string.slice(infinit, string.length) + ']';
            };

            return string;
        };

        var string = '';



        //Calculate digits before the point
        var pre = this.copy().abs().toBigInt();
        while(pre >= 1) {
            var remainder = pre % this.base;
            string = DIGITS[Number(remainder.toString())] + string;
            pre = (pre - remainder) / this.base;
        };

        var post = this.copy().abs().remainder();
        string += '.' + createPoststring(
            createFloat(post.numerator, post.denominator),
            this.base
        );

        //Prepend zero if number is smaller than one
        if(string[0] === '.') {
            string = '0' + string;
        };
        //Remove zero at the end of the string
        if(string[string.length - 1] === '0') {
            string = string.slice(0, string.length - 1);
        };
        //Remove point at the end of the string
        if(string[string.length - 1] === '.') {
            string = string.slice(0, string.length - 1);
        };
        //Prepend sign fi number is negativ
        if(this.toIntSign() === -1) {
            string = '-' + string;
        };

        return string;
    };

    BaseFraction.prototype.copy = function copy() {
        return new BaseFraction(this);
    };

    //Change the base used for representation
    BaseFraction.prototype.convert = function convert(base) {
        this.base = BigInt(base.toString());
        return this;
    };

    //Check if a finit representation exists in the current base
    BaseFraction.prototype.isFinit = function isFinit() {
        //Finit represantation exists if all primefactors of the
        //denominator are also primefactors of the base
        var denominator = this.denominator;
        var primefactors = PRIMEFACTORS[this.base];

        for(var i = 0; i < primefactors.length; i++) {
            //If the prime factor is a proper divisor of the denominator
            //remove the prime factor by division
            while((denominator % primefactors[i]) === 0n) {
                denominator /= primefactors[i];
            };
            //If the denominator is one it has been divided by all prime
            //factors and a finit representation of the fraction exists
            if(denominator === 1n) {
                return true;
            };
        };
        //If the denominator is not one after division by all primefactors
        //of the current base no finit representation exists
        return false;
    };

    return BaseFraction;
};
