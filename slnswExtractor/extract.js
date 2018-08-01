var request = require("request");
var fs = require("fs");

//var query= "World+War+1+poster";
//var query= "World+War+1+recruitment"
var query= "norman+lindsay+poster";

var base = "http://acmssearch.sl.nsw.gov.au/s/search.json?collection=slnsw&num_ranks=500&query=";

var harvest  = [];

function extractRecords(url){
	request(url,function(err,response,body){
		if (err) {
			console.log(err);
			return;
		}

		//console.log(body);

		data = JSON.parse(body);

		console.log(data);

		var records = data.response.resultPacket.results;
		console.log(" got " + records.length + " records for query " + query);

		records.forEach(function(r){
			// http://acms.sl.nsw.gov.au/_DAMt/image/26/128/a2921002t.jpg
			//http://acmssearch.sl.nsw.gov.au/s/search.json?collection=slnsw&query=Holsworthy+Bungardy
			var pages = [];
			if (r.metaData.hasOwnProperty('D') && r.metaData.hasOwnProperty('E')){ // make sure it's got the necessary data
				pages = r.metaData.D.split(" ").map(function(p){
					var t = "http://acms.sl.nsw.gov.au/_DAMt/image/"+r.metaData.E+"/"+p+"t.jpg";
					var h = "http://acms.sl.nsw.gov.au/_DAMx/image/"+r.metaData.E+"/"+p+"h.jpg";	
					return { pageID: p,
							thumbURL: t,
							hiresURL: h
					}
				});
			}; 

			extract = {
					'title': r.title,
					'itemID': r.metaData["1"],
					'creator': r.metaData["3"],
					'date': r.metaData["5"],
					'pages': pages
			};

			if (pages.length > 0) harvest.push(extract); // only store those with digitised images
		});

		saveData({
				query: query,
				records: harvest
			});

	});
}

function saveData(data){
	console.log("saving");
	var outputFilename = 'slnsw-extract-' + query + '.json';
	fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outputFilename);
	    }
	});
}


extractRecords(base+query);