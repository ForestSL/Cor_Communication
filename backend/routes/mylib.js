var express = require('express');

var depart[];

module.exports = {
	name_ID:function (departName,departID){
	for(var i=0;i<depart.length;i++){
		if(depart[i]==departName){
			departID=i;
		}
	}
	return departID;
	},
	ID_name:function (departID,departName){

	},
	create_ID:function (departName,departID){
	var index=0;
	for(var i=0;i<depart.length;i++){
		if(depart[i]==null){
			depart[i]=departName;
			departID=i;
			index=1;
		}
	}
	if(index==0){
		depart[depart.length]=departName;
		departID=depart.length;
	}
	}
};