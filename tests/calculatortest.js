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
    function Test(test, result, inputbase, outputbase, fraction) {
        this.test = test;
        this.result = result;
        this.inputbase = inputbase  || 10;
        this.outputbase = outputbase || 10;
        if(fraction === undefined) {
            fraction = false;
        };
        this.fraction = fraction;
    };

    var Tests = [
        new Test('1/3', '0.1', '10', '3'),
        new Test('1/6', '0.1[6]'),
        new Test('1/6', '0.1', '10', '6'),
        new Test('1/6', '0.0[1]', '10', '3'),
        new Test('277-300', '-23'),
    ];

    function addElement(content, type) {
        $('#test table tr').last().append(
            '<' + type + '>' + content + '</' + type + '>'
        );
    };

    $('form#calculator').append(
        '<fieldset id="test"><table></table></fieldset>'
    );
    $('#test table').append('<tr></tr>');

    var header = ['in', 'out', 'calculation', 'result', 'correct'];
    for(var i = 0; i < header.length; i++) {
        addElement(header[i], 'th');
    };

    $('#test table').append('<tr></tr>');

    for(var i = 0; i < Tests.length; i++) {
        $('#inputbase').val(Tests[i].inputbase);
        $('#outputbase').val(Tests[i].outputbase);
        $('#term').val(Tests[i].test);
        $('#fraction').prop('checked', Boolean(Tests[i].fraction));

        $('#equal').click();
        var solution = $('#solution').text();

        $('#test table').append('<tr></tr>');
        addElement(Tests[i].inputbase, 'td');
        addElement(Tests[i].outputbase, 'td');
        addElement(Tests[i].test, 'td');
        addElement(solution, 'td');

        if(solution !== Tests[i].result) {
            $('#test tr').last().css('color', 'red');
        };
    };
});
