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

var ParserFactory = function(DIGITS, OPERATORS) {
    //Create custom exception class for module
    var ModuleError = ModuleErrorFactory('Parser');

    //Create
    var ORDER = ['(', ')'];

    var Node = function Node(value, parent, left, right) {
        this.value = value;
        this.parent = parent || '';
        this.left = left || '';
        this.right = right || '';
    };

    //Static functions
    var checkDigit = function(digit) {
        return (DIGITS.indexOf(digit) !== -1 || digit === '.');
    };
    var checkNumber = function(string) {
        if(string === undefined) {
            return false;
        };
        var digit = string[0];
        return (DIGITS.indexOf(digit) !== -1 || digit === '.');
    };
    var checkOperator = function(digit) {
        for(var i = 0; i < OPERATORS.length; i++) {
            if(OPERATORS[i].indexOf(digit) !== -1) {
                return true;
            };
        };
        return false;
    };
    var checkOrder = function(digit) {
        return (ORDER.indexOf(digit) !== -1);
    };

    /* Convert string to array, mainly create number string from
     * digits, so the parser doesn't has to worry about this
     * */
    var createArray = function(string) {
        var array = [];
        var number = '';

        for(var i = 0; i < string.length; i++) {
            var digit = string[i];

            if(checkDigit(digit)) {
                var number = number + digit;
            } else if(checkOperator(digit) || checkOrder(digit)) {
                if(number !== '') {
                    array.push(number);
                    number = '';
                };
                array.push(digit);
            } else {
                throw new ModuleError(
                    'Parse',
                    digit + ' is no mathematical digit'
                );
            };
        };

        if (number !== '') {
            array.push(number);
        };
        return array;
    };

    /* To follow the order of operators for mathematical expressions
     * additional paranthesis are inserted into the expression array.
     * The function is applied to each subarray of OPERATORS,
     * therefore, the operators in the first subarray automatically
     * get precedence over the other operators and so on
     * */
    var insertParanthesis = function(array) {
        for(var level = 0; level < OPERATORS.length; level++) {
            for(var i = 0; i < array.length; i++) {
                digit = array[i];

                if(OPERATORS[level].indexOf(digit) > -1) {
                    var count = 0;
                    for(var j = i; j >= 0; j--) {
                        if(array[j] === ')') {
                            count++;
                        };
                        if(array[j] === '(' && count > 0) {
                            count--;
                        };
                        if(!checkOperator(array[j])) {
                            if(count === 0) {
                                array.splice(j, 0, '(');
                                i++;
                                break;
                            };
                        };
                        if(j === 0) {
                            array.splice(j, 0, '(');
                        };
                    };
                    count = 0;
                    for(var j = i; j < array.length; j++) {
                        if(array[j] === '(') {
                            count++;
                        };
                        if(array[j] === ')' && count > 0) {
                            count--;
                        };
                        if(!checkOperator(array[j])) {
                            if(count === 0) {
                                array.splice(j + 1, 0, ')');
                                break;
                            };
                        };
                        if(j === array.length - 1) {
                            array.push(')');
                        };
                    };
                };
            };
        };

        return array;
    };
    var createTree = function(start, array) {
        var child = new Node('');
        var root = '';

        for(var i = start; i < array.length; i++) {
            var digit = array[i];
            var preDigit = array[i-1];

            if(checkOperator(digit) && checkOperator(array[i-1])) {
                throw new ModuleError(
                    'Iterate',
                    'Operator can not be followed directly by' +
                    ' another operator'
                );
            };

            if(checkDigit(digit[0])) {
                child = new Node(digit);
            };

            //Operands
            if(checkOperator(digit)) {
                var operator = new Node(digit);

                operator.left = root;
                root = operator;

                if(operator.left === '') {
                    //Init case -> there is no operator node present
                    operator.left = child;
                    operator.left.parent = operator;
                } else {
                    operator.left.right = child;
                    operator.left.right.parent
                        = operator.left;
                    operator.left.parent = operator;
                };
            };

            //Parse subtree recursively
            if(digit === '(') {
                if(checkNumber(preDigit) || preDigit === ')'){
                    throw new ModuleError(
                        'MissingOperator',
                        "Operator has to be present between closing" +
                        " and opening bracket or between value and" +
                        " opening bracket"
                    );
                };
                ans = createTree(i + 1, array);
                i = ans.end;
                child = ans.root;
            };
            if(digit === ')') {
                if(checkOperator(preDigit)){
                    throw new ModuleError(
                        'OperatorValue',
                        'Operator has to be followed by value'
                    );
                };
                if(preDigit === '('){
                    throw new ModuleError(
                        'EmptyBracket',
                        "Matching brackets have to contain a value"
                    );
                };
                break;
            };
        };
        //Do the last append
        if(root === '') {
            root = child;
        } else {
            root.right = child;
            child.parent = root;
        };

        return {'root': root, 'end': i, 'preDigit': preDigit};
    };

    var Parser = function Parser(string) {
        this.string = string;
        this.root = '';
        this.array = [];
    };

    Parser.prototype.parse = function parse() {
        if((this.string.match(/\(/g)||[]).length
            !== (this.string.match(/\)/g)||[]).length) {
            throw new ModuleError('Paranthesis',
                                  'Number of Paranthesis does not match');
        };
        this.array = insertParanthesis(createArray(this.string));
        this.root = createTree(0, this.array).root;
    };
    Parser.prototype.iterate = function iterate(callback, node) {
        //Start with root node if not provided otherwise
        node = node || this.root;

        //If node is not a leaf iterate subtree
        if(node.left !== '' && node.right !== '') {
            return callback(
                node.value,
                this.iterate(callback, node.left),
                this.iterate(callback, node.right)
            );
        };
        return node.value;
    };

    return Parser;
};
