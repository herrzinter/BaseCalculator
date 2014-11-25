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

$(function() {
    //Functions to hide and show exception on the website
    function hideException() {
        $('#term').css('border-color', 'black');
        $('#exception').text('');
    };
    function showException(error) {
        if(['Fraction', 'BaseFraction', 'Parser']
           .indexOf(error.module) === -1)
        {
            throw error;
        };
        $('#term').css('border-color', 'red');
        $('#exception').css('color', 'red');
        $('#exception').text(error.message);
        //console.log(error);
    };

    //Set constant values
    var OPERATORS = [['^'], ['*', '/'], ['+', '-']];
    var DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  'A', 'B', 'C', 'D', 'E', 'F'];
    var HEIGTH = $('#solution').height();
    var TIMEOUTEXCEPTIONS = [
        'EmptyBracket', 'OperatorValue', 'MissingOperator',
        'Paranthesis'
    ];

    //Create NumberModule class
    Num = BaseFractionFactory(DIGITS);

    //Load default values of controls
    $('#inputbase').val(10);
    $('#inputbase').prop('max', DIGITS.length);
    $('#outputbase').val(10);
    $('#outputbase').prop('max', DIGITS.length);
    $('#fraction').prop('checked', false);

    /* Create parser object and set event handlers
     *
     * Every time, when a new character is entered the resulting
     * string ist parsed. Ocurring errors are catched and
     * displayed. If the person uses the enter key or click the
     * equal button, the resulting expression is evaluated.
     * */

    //Create parser object
    var Parser = ParserFactory(DIGITS, OPERATORS);

    //Set event handlers
    var id = 0;
    var exception = true;
    $('#option').change(function() {
        $('#equal').trigger('click');
    });
    $('#term').keypress(function(event) {
        //
        if(event.which === 13) {
            event.preventDefault();
        };
    });
    $('#equal').click(function() {
        var event = jQuery.Event("keyup");
        event.which = 13;
        event.keyCode = 13;
        $("#term").trigger(event);
    });
    $('#term').keyup(function(event) {
        try {
            //Parse string
            parser = new Parser($('#term').val());
            parser.parse();

            //Adjust the height of the input field
            if(parser.string !== '') {
                $('#term').height(
                    (Math.floor((parser.string.length)/
                        ($('#term').prop('cols') + 1)) + 1)
                    * HEIGTH
                );
            };

            //Evaluate if enter is pressed
            if(event.keyCode === 13) {
                exception = false;
                //Get configuration from the user interface
                var inputbase = Number($('#inputbase').val());
                var outputbase = Number($('#outputbase').val());
                var fraction = $('#fraction').prop('checked');

                //Evaluate expression by parsing the tree and
                //evaluating each node
                var number = parser.iterate(
                    function(parent, first, second) {
                        if(typeof first === 'string') {
                            first = new Num(first, inputbase);
                        };
                        if(typeof second === 'string') {
                            second = new Num(second, inputbase);
                        };

                        if(parent === '+') {
                            first.add(second);
                        };
                        if(parent === '-') {
                            first.subtract(second);
                        };
                        if(parent === '*') {
                            first.multiply(second);
                        };
                        if(parent === '/') {
                            first.divide(second);
                        };
                        if(parent === '^') {
                            first.power(second);
                        };

                        //Store result in parent node
                        return first;
                    }
                );

                if(typeof number === 'string') {
                    number = new Num(number, inputbase);
                };
                number.convert(outputbase);

                if(fraction) {
                    var result = new Num(number.numerator.toString())
                                     .convert(outputbase).toString();
                    if(!number.denominator.equals(new BigInteger('1'))) {
                        result = result +  '/'
                                 + new Num(number.denominator.toString())
                                       .convert(outputbase).toString();
                    };
                } else {
                    var result = number.toString();
                };

                //Adjust height of the output field and split the
                //output string to the resulting rows
                $('#solution').height(HEIGTH);
                $('#solution').text('');
                var rows = Math.floor(
                    (result.length - 1)
                    /($('#solution').prop('cols') + 1)
                );
                for(var i = 0; i < 1 + rows; i++) {
                    if(i > 0) {
                        $('#solution').append('<br>')
                        $('#solution').height(HEIGTH * (i + 1));
                    };
                    $('#solution').append(
                        result.slice(
                            ($('#solution').prop('cols')+1) * i,
                            ($('#solution').prop('cols')+1) * (i+1)
                        )
                    );
                };
                //Set flag to thrue if the evaluation didn't throw
                //an exception
                exception = true;
            };
            //Hide exception if flag is true. This is nescesarry
            //so a exception showed by evaluating is only hidden
            //again, if the expression is evaluated correctly
            if(exception) {
                hideException();
                clearTimeout(id);
            };
        } catch(error) {
            clearTimeout(id);
            if(TIMEOUTEXCEPTIONS.indexOf(error.name) >= 0) {
                id = setTimeout(function() {
                    showException(error);
                }, 1500);
            } else {
                showException(error);
            };
        };
    });
});
