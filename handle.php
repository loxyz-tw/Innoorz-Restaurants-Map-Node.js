<?php

//receive data from form of index
$json = $_POST["json"];

//get content from saved data file
$filename = "restaurants.json";
$fileData = file_get_contents($filename);

//json decode
$decodePostData = json_decode($json);
$decodeData = json_decode($fileData);

if($decodeData != ""){
//merge two array
    $mergeArray = array_merge($decodeData,$decodePostData);
}else{
    $mergeArray = $decodePostData;
}
//json encode
$newData = json_encode($mergeArray);

//save data to file
file_put_contents($filename,$newData);


?>