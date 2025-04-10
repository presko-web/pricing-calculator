var splitType = 0;
var windowType = 0;
var uShapedType = 0;

var windowTypePrice = 0;
var splitTypePrice = 0;
var discount = 0;
var errorCount = 0;
var total = 0;

async function init(){
    
    // initial Creds
    var creds;
    await fetch('Assets/Notes/spec.json').then((response) => response.json()).then((json) => {
        creds = json;
        sessionStorage.setItem("clientId", json.clientId);
        sessionStorage.setItem("clientSecret", json.clientSecret);
        sessionStorage.setItem("refreshToken", json.refreshToken);
    }); 
    await getToken();
    await getData();

    // select options
    for (let index = 1; index <= 20; index++) {
        $('.number-Of').append(`<option value="${index}">${index}</option>`);
    }
    
    // required fields
    $('[required="true"]').each(function(){
        const para = document.createElement("span");
        para.style.color = "red";
        const node = document.createTextNode(" *");
        para.appendChild(node);
        $(this)[0].previousElementSibling.appendChild(para);
    })

    // assign minimum date
    var isoDateToday = new Date().toISOString().substring(0,10);
    $('#cleaning-date').attr('min', isoDateToday);

}

async function getToken(){


    let clientId = atob(sessionStorage.getItem("clientId"));
    let clientSecret = atob(sessionStorage.getItem("clientSecret"));
    let refresh = atob(sessionStorage.getItem("refreshToken"));
    
    var settings = {
        "url": "https://presko-dev-ed.develop.my.salesforce.com/services/oauth2/token?grant_type=refresh_token&client_id="+clientId+"&client_secret="+clientSecret+"&refresh_token="+refresh,
        "method": "POST",
        "timeout": 0
      };
      await $.ajax(settings).done(function (response) {
        sessionStorage.setItem("tkn", response.access_token);
      }).catch(function (err){
        console.log(err.responseJSON);
      });
}
async function getData(){

    var reqJson = {
        "url": "https://presko-dev-ed.develop.my.salesforce.com/services/apexrest/RetrieveSetupDetails",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Authorization": "Bearer " + sessionStorage.getItem('tkn')
        }
    }
    await $.ajax(reqJson).done(function (res) {
        var resJsn = JSON.parse(res);
        windowTypePrice = resJsn.invoice.window_type;
        splitTypePrice = resJsn.invoice.split_type;
        discount = resJsn.invoice.discount;
        $('.number-Of').removeAttr('disabled');
    });

}

function calculation(numberOfWindowTypeCalculated, numberOfSplitTypeCalculated, uShapedTypeCalculated){

    var subTotal = 0;
    var total = 0;
    subTotal = numberOfWindowTypeCalculated + numberOfSplitTypeCalculated + uShapedTypeCalculated;
    total = subTotal - (subTotal * (discount/100));
    return {subTotal, total}

}

function removeTable(windowType, splitType, uShapedType) {
    if(windowType > 0 || splitType > 0 || uShapedType > 0){
        $("#table-data").css({"display": "block"});
        $('button[name=proceed]').removeAttr('disabled');
    }else{
        $("#table-data").css({"display": "none"});
        $("#customer-data").css({"display": "none"});
        $('button[name=proceed]').attr('disabled', true);
        $("button[name=proceed]").css({"display": "block"});
        $("button[name=book]").css({"display": "none"});
    }

}

function generateBreakdownTable(arrTableData){

    for (let index = 0; index < arrTableData.length; index++) {
        const element = arrTableData[index];
        $('#table-data table.tbl > tbody').append(
            $('<tr/>').append($('<td/>').text(element.description), 
                             $('<td/>').text(element.qty),
                             $('<td/>').text(new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(element.unitPrice)).css({"text-align":"right"}),
                             $('<td/>').text(new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(element.lineTotal)).css({"text-align":"right"}))
        )
    }

}

function generateTotalTable(calc){

    var discountMessage = "Discount (" + discount + "%):";
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
}

async function createRecord(data){


    var settings = {
        "url": "https://presko-dev-ed.develop.my.salesforce.com/services/apexrest/CreateAppointment",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem('tkn')
        },
        "data": JSON.stringify(data),
    };
    
    await $.ajax(settings).done(function (response) {
        console.log(response);
    }).catch((err) => {
        if(err.responseText.includes('Session expired or invalid')){
            errorCount ++;
            if(errorCount == 3) window.location.reload();
            getToken();
            setTimeout(() => {
                createRecord(data);
            }, 2000);
            
        }
    });


}

$(function() {
    
    $('.number-Of').on('change', function(){
        var arrTableData = [];
        if($(this).attr('name') == 'noOfSplitType'){
            splitType = $(this).val();
        }else if($(this).attr('name') == 'noOfWindowType'){
            windowType = $(this).val();
        }else{
            uShapedType = $(this).val();
        }

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
        if(uShapedType > 0){
            arrTableData.push(
                {
                    description: "U-Shaped Type Aircon Service",
                    qty: uShapedType,
                    unitPrice: splitTypePrice,
                    lineTotal: splitTypePrice * uShapedType
                }
            );
        }
        // Clean the Table
        $('#table-data table.tbl > tbody > tr').remove();
        removeTable(windowType, splitType, uShapedType);

        // Generate new
        generateBreakdownTable(arrTableData);
        var calc = calculation((windowType * windowTypePrice), (splitType * splitTypePrice), (uShapedType * splitTypePrice));
        total = calc.total;
        generateTotalTable(calc);

    });

    $("button[name=clear]").on("click", function(){
        $('.number-Of').val(0);
        splitType = 0;
        windowType = 0;
        uShapedType = 0;
        $('#cleaning-date').val("");
        removeTable(0, 0, 0);
    });

    $("button[name=proceed]").on("click", function(){
        if(windowType > 0 || splitType > 0){
            $("#customer-data").css({"display": "block"});
            $(this).css({"display": "none"});
            $("button[name=book]").css({"display": "block"});
            
        }
    });

    $("#frm").on("submit", function(e){
        e.preventDefault();
        var customerFields = [
                            "firstName",
                            "lastName",
                            "mobile",
                            "street",
                            "barangay",
                            "city",
                            "landmark"
                        ];

        var appointmentFields = [
                            "cleaningDate",
                            "noOfSplitType",
                            "noOfWindowType",
                            "noOfUShapedType"
                        ];

        var jsonReq = {"customer": {}, "appointment": {
            "totalAmount": total,
            "redeem": "No"
        }};
        $.each($(this).serializeArray(), function(i, field) {
            if(customerFields.includes(field.name)){
                jsonReq['customer'][field.name] = field.value;
            } else if(appointmentFields.includes(field.name)){
                jsonReq['appointment'][field.name] = field.value;
            }
        });
        createRecord(jsonReq);
    })

    // initialization
    init();
})