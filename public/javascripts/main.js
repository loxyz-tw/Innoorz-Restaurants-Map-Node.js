//Init List restaurants
var restaurantData = [];
var timer;

//Google Map property
var geocoder;
var map;
var ResInfo = null;
var info;

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
    
    inno.addListener('click', function() {
         if(ResInfo)ResInfo.close();                
         ResInfo = new google.maps.InfoWindow({content: "Innorz"});
         ResInfo.open(map, inno);
     }); 
    restaurantList();
}


//Add a new row for insert restaurant data
$("#plus").on("click",function(){
    var clone = $(".restaurant-data:last").clone().find("input:text").val("").end();
    $("#buttons").before(clone);
})

//Post data
$("form").submit(function(event) {
    var length = $(".restaurant-data").length
    var restaurantArray = []
    for(i=0;i<length;i++){
        var name = $("input[name='name']").eq(i).val()
        var address = $("input[name='address']").eq(i).val()
        var price = $("input[name='price']").eq(i).val()
        codeAddress(name,addressmprice);    
    }
    $("form")[0].reset();
    $(".restaurant-data").not(":first").remove();
    event.preventDefault();
});

//List Restaurant
function restaurantList(){
    $.getJSON("/api/v1/restaurant",function(data){
        var tableRow = "";
        for(i=0;i<data.length;i++){
            var restaurant = "";
            restaurant += ("<td class='res'>"+data[i].name+"</td><td>"+data[i].address+"</td><td>"+data[i].price+"</td>");
            tableRow += ("<tr>"+restaurant+"</tr>");
            restaurantData.push(data[i].name);
            var latlng = {lat: data[i].lat,lng: data[i].lng};
            var name = data[i].name;
            var address = data[i].address;
            var price = data[i].price;

            var marker = new google.maps.Marker({
                map: map,
                animation : google.maps.Animation.DROP,
                position: latlng
            });
            var content = "<h3>"+name+"</h3>"+
                "<p>地址："+address+"</p>"+
                "<p>平均價格："+price+"</p>";
            
            mapInfo(marker,map,content);
        }
        $("#restaurant-list tbody").html(tableRow);
    })
}

function mapInfo(marker,map,content){
    info = new google.maps.InfoWindow();
    marker.addListener('click', function() {
        info.close();
        info.setContent(content)
        info.open(map, marker);
    });
}

//Address Geocode and add marker
function codeAddress(name,address,price){
    geocoder.geocode({"address":address},function(results,status){
        if(status == google.maps.GeocoderStatus.OK){
            var location = results[0].geometry.location.split(",");
            var restaurantArray = [{"name":name, "address":address, lat: location[0],lng: location[1], "price":price}];
            var json = JSON.stringify(restaurantArray)
            $.post("../handle.php",{"json" : json},function(data){
                restaurantList();
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
