var request = require('request');
    
var totItems=0;
var results=[];
var aliens=[];
//var searchTerm = "holsworthy+AND+internment+OR+concentration";
var searchTerm = encodeURI('(nuc:"NSL") date:[1910 TO 1920] Recruiting and enlistment - Posters');
//var searchTerm = '(nuc%3A"NSL")+date%3A%5B1910+TO+1920%5D+Recruiting+and+enlistment+-+Posters';
var pageLimit=1;
var pLength = 100;


function loadData( page, pagelen, query ){
	console.log("loading page " + page);

	var url = "http://api.trove.nla.gov.au/result?key=vl6ahuf5l47j4vaq&zone=picture&q="+query+"&encoding=json&n="+pagelen+"&s="+(page*pagelen)+"&reclevel=full&include=workversions&l-decade=191&l-australian=y";
	
	// MLMSS+261 (SLNSW papers of internees)
	//var url = "http://api.trove.nla.gov.au/result?key=vl6ahuf5l47j4vaq&zone=picture&q="+query+"&encoding=json&n="+pagelen+"&s="+(page*pagelen)+"&reclevel=full&include=workversions&l-availability=y/f";

	request({
	    url: url,
	    json: true
	}, function (error, response, data) {
	    if (!error && response.statusCode === 200) {
	        //console.log(data) // Print the json response

	        var total = data.response.zone[0].records.total;
	        pageLimit = Math.floor(total/pagelen);
	        var item = data.response.zone[0].records.work;
		
			for (var i = 0; i< item.length; i++) {
				
				var itemOb = {};

				if(item[i].hasOwnProperty("title")){
					itemOb["title"] = item[i].title;
				}
/* Description+subject - may contain names but witheld for now for clarity/size of json
				if(item[i].hasOwnProperty("abstract")){
					itemOb["description"] = item[i].abstract;
				}else if(item[i].hasOwnProperty("snippet")){
					itemOb["description"] = item[i].snippet;
				}

				if(item[i].hasOwnProperty("subject")){
					itemOb["subject"] = item[i].subject;
				}
*/

				// may need some checks
				if(item[i].hasOwnProperty("identifier")){
					if(item[i].identifier.length>0){
						itemOb["source"] = item[i].identifier[0].value;
					}

					var imgURL = item[i].identifier[0].value;
					
					if(item[i].identifier.length>1){
						var tn = item[i].identifier[1].value;
						itemOb["imgThumb"] = tn;
					}

				}

				var rec = item[i].version[0].record;

				if(rec.hasOwnProperty("metadataSource")){
					if(rec.metadataSource=="Libraries Australia"){ // NLA
						imgURL += "-v";
					}
					//itemOb["metaSource"] = item[i].version[0].record.metadataSource;
				}else if(rec[0].hasOwnProperty("metadataSource")){
					if(rec[0].metadataSource.value=="SSL"){ // SLSA
						imgURL = imgURL.replace(".htm",".jpg");
					}else if(rec[0].metadataSource.value=="NSL"){ // SLNSW
						imgURL = rec[0].metadata.record[0].mediumresolution;
					}
					//itemOb["metaSource"] = item[i].version[0].record[0].metadataSource;
				}

				itemOb["imgMedium"] = imgURL;

				// ACT Libraries (APLS) - ? all sorts of bad
				// Berrima HS (NBDHS) - may be able to get
				// SLNSW (NSL) - can use mediumRes sometimes, otherwise there's a possible URL trick
				
				
				aliens.push(itemOb);

			}
					
			if (page < pageLimit){
				loadData(page+1,pagelen,query); // call the loader function again
			} else {
				console.log("finished loading");
				console.log(aliens);
				writeIt();
			}

	    }

	})
}

loadData(0,pLength,searchTerm);

var fs = require('fs');

function writeIt(){
	var outputFilename = searchTerm+'.json';
	fs.writeFile(outputFilename, JSON.stringify(aliens, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outputFilename);
	    }
	});
}

/*
// For dowloading the images later.

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  console.log('done');
});
*/
