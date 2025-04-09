var splitType = 0;
var windowType = 0;

var windowTypePrice = 500;
var splitTypePrice = 900;
var discount = 10;


function init(){
    for (let index = 1; index <= 20; index++) {
        $('.number-Of').append(`<option value="${index}">${index}</option>`);
    }
}

function calculation(numberOfWindowTypeCalculated, numberOfSplitTypeCalculated){

    var subTotal = 0;
    var total = 0;
    subTotal = numberOfWindowTypeCalculated + numberOfSplitTypeCalculated;
    total = subTotal - (subTotal * (discount/100));
    return {subTotal, total}

}

function removeTable(windowType, splitType) {
    if(windowType > 0 || splitType > 0){
        $("#table-data").css({"display": "block"});
        $('button[name=proceed]').removeAttr('disabled');
    }else{
        $("#table-data").css({"display": "none"});
        $("#customer-data").css({"display": "none"});
        $('button[name=proceed]').attr('disabled', true);
    }
    $("button[name=proceed]").css({"display": "block"});
    $("button[name=book]").css({"display": "none"});
}

$(document).ready(function(){

    $('.number-Of').on('change', function(){

        var discountMessage = "Discount (" + discount + "%):";
        var arrTableData = [];
        if($(this).attr('name') == 'split-type'){
            splitType = $(this).val();
        }else{
            windowType = $(this).val();
        }

        $('#table-data table.tbl > tbody > tr').remove();
        removeTable(windowType, splitType);
        if(splitType > 0){
            arrTableData.push(
                {
                    description: "Split Type Aircon Service",
                    qty: splitType,
                    unitPrice: splitTypePrice,
                    lineTotal: splitTypePrice * splitType
                }
            );
        }
        if(windowType > 0){
            arrTableData.push(
                {
                    description: "Window Type Aircon Service",
                    qty: windowType,
                    unitPrice: windowTypePrice,
                    lineTotal: windowTypePrice * windowType
                }
            );
        }

        for (let index = 0; index < arrTableData.length; index++) {
            const element = arrTableData[index];
            $('#table-data table.tbl > tbody').append(
                $('<tr/>').append($('<td/>').text(element.description), 
                                 $('<td/>').text(element.qty),
                                 $('<td/>').text(new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(element.unitPrice)).css({"text-align":"right"}),
                                 $('<td/>').text(new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(element.lineTotal)).css({"text-align":"right"}))
            )
        }

        var calc = calculation((windowType * windowTypePrice), (splitType * splitTypePrice));
        var totalDiscount = calc.subTotal * (discount/100);

        $("#total-table").html(`
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Sub total:</td>
                                            <td>${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calc.subTotal)}</td>
                                        </tr>
                                        <tr>
                                            <td>${discountMessage}</td>
                                            <td>${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalDiscount)}</td>
                                        </tr>
                                        <tr>
                                            <td>Total:</td>
                                            <td>${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calc.total)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            `);


    });

    $("button[name=clear]").on("click", function(){
        $('.number-Of').val(0);
        splitType = 0;
        windowType = 0;
        $('#cleaning-date').val("");
        removeTable(0, 0);
    });

    $("button[name=proceed]").on("click", function(){
        if(windowType > 0 || splitType > 0){
            $("#customer-data").css({"display": "block"});
            $(this).css({"display": "none"});
            $("button[name=book]").css({"display": "block"});
            
        }
    });

    init();
})