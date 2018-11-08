const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const soap = require('soap')
const path = require('path')
const app= express()
const port = process.env.PORT || 3000
var request = require('request');

var Sort = require('./includes/Sort')
var ups = require('./includes/UPS')
var fedex = require('./includes/FedEx')
var aramex = require('./includes/Aramex')
var db = require('./includes/Db')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({   
  extended: true
})); 


app.get('/', function(req,res){
	res.write('( o Y o )');	
	res.end();
});
app.get('/calculate', function(req,res,next){ 
	var params=req.query;
	
	var result={};
	result.success=true;
	result.origin=params.o;
	result.destination=params.d;
	result.coords=params.c;
	result.weight=params.w;
		
	var origin =	params.orig.split(', ');
	var destin =	params.dest.split(', ');
	var carrier = Array();
	
	//carrier.push({ id: 'UPS' });
	carrier.push({ id: 'FEDEX'});
	//carrier.push({ id: 'ARAMEX' });
	
	 db.readPlace({ origin: { state: origin[1],country: origin[2] }, destination: { state: destin[1],country: destin[2] } }, function(thisState){
		console.log(thisState);
		
		var pack=Array();
		var p=0;
		for(var j in carrier){
			var vendor=carrier[j];
			
			switch(carrier[j].id){
				case 'FEDEX':
					
					var fedex_data = fedex.prepare({ w: (params.w).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: params.o, cc: origin[2], sc:thisState.origin.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.destination.stateCode,place: destin[0]  });	
					soap.createClient(fedex_data.path, fedex_data.endpoint, function(err, client) {
							if (err) {
								console.log(err);
								return ;
							}
							//console.log(client);
							client.getRates(fedex_data.params, function(err, f_r) {
								var fedex_d2 = fedex.prepare({ w: (params.w-1).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: params.o, cc: origin[2], sc:thisState.origin.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.destination.stateCode,place: destin[0]  });	
								soap.createClient(fedex_d2.path, fedex_d2.endpoint, function(err, client) {
									if (err) {
										return;
									}
									
									client.getRates(fedex_d2.params, function(err, f_r2) {
										if(f_r) {							
											var res_ar= fedex.result(f_r,f_r2);
											pack=pack.concat(res_ar);							
										} 
										console.log('FED');
										p++;
										if(p==carrier.length){	
											req.result=result;
											req.data=pack;
											next()
										}
									});
								});
							});
						});
				break;
				case 'UPS':
					var ups_data=ups.prepare({ w: params.w, pl: params.pl, ph: params.ph, pw: params.pw }, { pin: params.o, cc: origin[2], sc:thisState.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.stateCode,place: destin[0]  });
					
					soap.createClient(ups_data.path, ups_data.endpoint, function(err, client) {
						var soapHeader = {
						  UPSSecurity: ups_data.params.UPSSecurity
						};
						client.addSoapHeader(soapHeader);
						console.log('UPS');
						console.log(client);
							if (err) {
								return ;
							}
							console.log(client.RateService);
							client.processRate(ups_data.params.RateRequest, function(err, f_r) { console.log(f_r);
								/*var fedex_d2 = fedex.prepare({ w: (params.w-1).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: params.o, cc: origin[2], sc:thisState.origin.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.destination.stateCode,place: destin[0]  });	
								soap.createClient(fedex_d2.path, fedex_d2.endpoint, function(err, client) {
									if (err) {
										return;
									}
									
									client.getRates(fedex_d2.params, function(err, f_r2) {
										if(f_r) {							
											var res_ar= fedex.result(f_r,f_r2);
											pack=pack.concat(res_ar);							
										} 
										p++;
										if(p==carrier.length){	
											req.result=result;
											req.data=pack;
											next()
										}
									});
								});*/
							});
						});
				break;
				case 'UPS_REST':				
					var ups_data=ups.prepare({ w: params.w, pl: params.pl, ph: params.ph, pw: params.pw }, { pin: params.o, cc: origin[2], sc:thisState.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.stateCode,place: destin[0]  });
					request.post({ url: ups_data.path,formData:ups_data.params },function(err, res, body){
						var data=JSON.parse(body)
						if(data.RateResponse){
							
							var ups_d2 = ups.prepare({ w: (params.w-1).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: params.o, cc: origin[2], sc:thisState.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.stateCode,place: destin[0]  });
							request.post({ url: ups_d2.path,formData:ups_d2.params },function(err, res, c_r){
								var c_rd=JSON.parse(c_r)
								var res_ar=ups.result(data,c_rd.RateResponse.RatedShipment);				
								pack=pack.concat(res_ar);
							});
						}
						p++;
						if(p==carrier.length){	
							req.result=result;
							req.data=pack;
							next()
						}
	  
					});
					/*var post_data = querystring.stringify(ups_data.param);
 var post_options = {
      host: ups_data.path,
      port: '',
      path: '/rest/Rate',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };
console.log(post_options);
  
					 var post_req = http.request(post_options, function (response) {
						
						var buffer = "", 
								data,
								route;
						response.on("data", function (chunk) {
								buffer += chunk;
						}); 	


						response.on("end", function (err) {
							console.log(buffer);
						});
						 
					});
					post_req.write(post_data);
					post_req.end();
					*/
					/*axios.post(ups_data.path,ups_data.param)
					.then(r =>{ 
								var data=r.data.RateResponse.RatedShipment;		
								var ups_d2 = ups.prepare({ w: (params.w-1).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: params.o, cc: origin[2], sc:thisState.stateCode,place: origin[0] },{ pin: params.d , cc:destin[2], sc:thisState.stateCode,place: destin[0]  });
								axios.post(ups_d2.path, ups_d2.param)
								.then(c_r =>{
									
									var res_ar=ups.result(data,c_r.data.RateResponse.RatedShipment);				
									pack=pack.concat(res_ar);
									p++;
									if(p==carrier.length){	
										req.result=result;
										req.data=pack;
										next()
									}
								}).catch(e =>{			
									console.log(e);	
								});
								
						
					}).catch(e =>{			
						console.log(e);	
					});*/
				break;
				case 'ARAMEX':
					var aramex_data = aramex.prepare({ w: (params.w-1).toString(), pl: params.pl, ph: params.ph, pw: params.pw  }, { pin: "10001", cc:'US', sc:'NY',place: params.orig },{ pin: "90270" , cc:'US', sc:'CA',place: params.dest });	
					soap.createClient(aramex_data.path, aramex_data.endpoint, function(err, client) {
				  
				  
						  client.CalculateRate(aramex_data.params, function(err, result) {
							  console.log(result);
						  });
					});
				break;
			}
		}

	});	

},function(req,res){
	var params=req.query;
	var result=req.result;
	var pack=req.data;
	if(params.s==0)
		pack=Sort.byCost(pack,0,pack.length-1);
	else
		pack=Sort.byFast(pack,0,pack.length-1);
	result.results=pack;
	console.log('DONE');	
	res.setHeader("Access-Control-Allow-Origin","*");									
	res.json(result);
	res.end();
});



app.listen(port)