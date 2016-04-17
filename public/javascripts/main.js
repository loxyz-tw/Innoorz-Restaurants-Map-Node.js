//Init List restaurants
var restaurantName = [];
var restaurantPrice = [];
var restaurantLat = [];
var restaurantLng = [];
var restaurantWeight = [];
var distance;
var duration;
var timer;

//Google Map property
var geocoder;
var map;
var ResInfo = null;
var info;
var directionsDisplay;
var directionsService;

//Sign in checking
boolean isSignInAsInno = false;

//Init Googel Map
function initMap() {
	directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('mapview'), {
        center: {lat: 25.041004, lng: 121.537734},
        scrollwheel: false,
        zoom: 17
    });
	directionsDisplay = new google.maps.DirectionsRenderer({ 'draggable': true });
    var inno = new google.maps.Marker({
        map: map,
        position: map.center,
        animation : google.maps.Animation.DROP,
        icon : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });
    
    ResInfo = new google.maps.InfoWindow({content: "Innorz" });
    ResInfo.open(map, inno);
    
    inno.addListener('click', function () {
        if (ResInfo) {
            ResInfo.close();
        }
        ResInfo = new google.maps.InfoWindow({content: "Innorz"});
        ResInfo.open(map, inno);
    });
    restaurantList();
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    userEmail = profile.getEmail();
	if(userEmail.split("@")[1] == "inno-orz.com") {
		isSignInAsInno = true;
		showButtons();
	}
}

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
	  console.log('User signed out.');
	  isSignInAsInno = false;
	  window.location.replace("https://inno-restaurant.herokuapp.com");
	});
}


//List Restaurant
function restaurantList(){
    $.getJSON("/api/v1/restaurant").then(function(data){
//	$.getJSON("../restaurants.json").then(function(data){
        var tableRow = "";
		
        for(var i=0;i<data.length;i++){
			
            var restaurant = "";
            restaurant += ("<td class='res'>"+data[i].name+"</td><td>"+data[i].address+"</td><td>"+data[i].price+"</td><td>"+(data[i].star/10).toFixed(1)+"</td>");
            tableRow += ("<tr>"+restaurant+"</tr>");
            restaurantName.push(data[i].name);
			restaurantPrice.push(data[i].price);
			restaurantLat.push(data[i].lat);
			restaurantLng.push(data[i].lng);
            //Create a weighted array
            for(var j=0; j<Math.pow(2, (data[i].star)/10); j++)
                restaurantWeight.push(i);
			
            var latlng = {lat: data[i].lat,lng: data[i].lng};
            var name = data[i].name;
            var address = data[i].address;
            var price = data[i].price;
            var star = data[i].star;

            var marker = new google.maps.Marker({
                map: map,
                animation : google.maps.Animation.DROP,
                position: latlng
            });
            var content = "<h3>"+name+"</h3>"+
                "<p>地址："+address+"</p>"+
                "<p>平均價格："+price+"</p>"+
                "<p>平均評分："+(star/10).toFixed(1)+"</p>";
            
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
            
        }
    })
}

var result;
var selectWeightedIndex, selectIndex;
//random for restaurant
$("#goButton").on("click",function(){
    $("#dochi").html("");
	dochiAnimation(0);
    //get random select index by weighted array
	selectWeightedIndex = Math.floor(Math.random()*(restaurantWeight.length));
    selectIndex = restaurantWeight[selectWeightedIndex];
})
var txtArray = ["今","天","我","要","吃："];
function dochiAnimation(num){
	if(num == 3) {
		getDistanceAndDuration(selectIndex);
		result = (restaurantName[selectIndex]) + " ；平均價格" + restaurantPrice[selectIndex];
		$("#dochi").append(txtArray[num]);
		num++;
        timer = setTimeout(function(){dochiAnimation(num)},500);
	}else if(num < 5){
        $("#dochi").append(txtArray[num]);
        num++;
        timer = setTimeout(function(){dochiAnimation(num)},500);
    }else{
        $("#dochi").append(result).append(" ；距離" + distance).append(" ；步行時間" + duration);
        clearTimeout(timer);
    }
    
}

function getDistanceAndDuration(index) {
	directionsDisplay.setMap(map);
	var source = "25.041004,121.537734"
	var destination = restaurantLat[index]+","+restaurantLng[index]
	
	var request = {
		origin: source,
		destination: destination,
		travelMode: google.maps.TravelMode.WALKING
	};
	
	directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
	
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [source],
        destinations: [destination],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
    }, function (response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
            distance = response.rows[0].elements[0].distance.text;
            duration = response.rows[0].elements[0].duration.text;
        } else {
            alert("Unable to find the distance via road.");
        }
    });
}

function showButtons() {
	if(isSignInAsInno) {
	//Add a new row for insert restaurant data
		$("#plus").show();
		$("#plus").on("click",function () {    
			var clone = $(".restaurant-data:last").clone().find("input:text").val("").end();
			$("#buttons").before(clone);
		});
		//Post data
		$("#submit").show();
		$("form").submit(function(event) {
			
			var length = $(".restaurant-data").length;
			var restaurantArray = []
			for(var i = 0; i < length; i++){
				var name = $("input[name='name']").eq(i).val()
				var address = $("input[name='address']").eq(i).val()
				var price = $("input[name='price']").eq(i).val()
				codeAddress(name,addressmprice);    
			}
			$("form")[0].reset();
			$(".restaurant-data").not(":first").remove();
			event.preventDefault();
			
		});
	}
}

$(document).ready(function(){
	$("#plus").hide();
	$("#submit").hide();
	showButtons();
});
