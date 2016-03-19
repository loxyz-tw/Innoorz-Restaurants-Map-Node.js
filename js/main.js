//Init List restaurants
restaurantList();
var restaurantData = [];
var timer;

//Google Map property
var geocoder;
var map;
var ResInfo = null;

//Init Googel Map
function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('mapview'), {
        center: {lat: 25.041, lng: 121.538},
        scrollwheel: false,
        zoom: 17
    });
    var inno = new google.maps.Marker({
        map: map,
        position: map.center,
        animation : google.maps.Animation.DROP,
        icon : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    })
    
    ResInfo = new google.maps.InfoWindow({content: "Innorz" });
    ResInfo.open(map, inno);
}


//Add a new row for insert restaurant data
$("#plus").on("click",function(){
    var clone = $(".restaurant-data:last").clone().find("input:text").val("").end()
    $("#buttons").before(clone)
})

//Post data
$("form").submit(function(event) {
    var length = $(".restaurant-data").length
    var restaurantArray = []
    for(i=0;i<length;i++){
        var name = $("input[name='name']").eq(i).val()
        var address = $("input[name='address']").eq(i).val()
        var price = $("input[name='price']").eq(i).val()
        restaurantArray.push({"name":name, "address":address, "price":price})
    }
    console.log(restaurantData)
    var json = JSON.stringify(restaurantArray)
    
    $.post("../handle.php",{
        "json" : json
    },function(data){
        $("form")[0].reset();
        $(".restaurant-data").not(":first").remove();
    })
    restaurantList();
    event.preventDefault();
});

//List Restaurant
function restaurantList(){
    $.getJSON("restaurants.json",function(data){
        var tableRow = "";
        for(i=0;i<data.length;i++){
            var restaurant = "";
            restaurant += ("<td class='res'>"+data[i].name+"</td><td>"+data[i].address+"</td><td>"+data[i].price+"</td>");
            tableRow += ("<tr>"+restaurant+"</tr>");
            codeAddressAndAddMarker(data[i].name,data[i].address,data[i].price);
            restaurantData.push(data[i].name);
        }
        $("#restaurant-list tbody").html(tableRow);
    })
}

//Address Geocode and add marker
function codeAddressAndAddMarker(name,address,price){
    geocoder.geocode({"address":address},function(results,status){
        if(status == google.maps.GeocoderStatus.OK){
            var marker = new google.maps.Marker({
                map: map,
                animation : google.maps.Animation.DROP,
                position: results[0].geometry.location
            });
           
            marker.addListener('click', function() {
                if(ResInfo)ResInfo.close();
        
                var content = "<h3>"+name+"</h3>"+
                "<p>地址："+address+"</p>"+
                "<p>平均價格："+price+"</p>"
                
                ResInfo = new google.maps.InfoWindow({content: content});
                ResInfo.open(map, marker);
            }); 
        }
    })
}


//ranfom for restaurant
$("#goButton").on("click",function(){
    $("#dochi").html("");
    dochiAnimation(0);
})
var txtArray = ["今","天","我","要","吃："];
function dochiAnimation(num){
    if(num < 5){
        $("#dochi").append(txtArray[num]);
        num++;
        timer = setTimeout(function(){dochiAnimation(num)},500);
    }else{
        var select = Math.ceil(Math.random()*(restaurantData.length));
        $("#dochi").append(restaurantData[select]);
        clearTimeout(timer);
    }
    
}

