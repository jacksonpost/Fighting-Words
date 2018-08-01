
var request = require('request');
var fs = require('fs');

function loadPosters(){
	var url = "posters.json";
	var data = fs.readFileSync(url);
	data = JSON.parse(data);

	for(var k=0; k<data.length; k++){
		for(var l=0; l<data[k].phrases.length; l++){
			var results = readDiaries(data[k].phrases[l]);
			if(results.length>0){
				data[k]["snippets"]=results;
			}
		}
	}

	fs.writeFile("posters_with_snippets.json", JSON.stringify(data, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved");
	    }
	});

}

function loadTest(){
	readDiaries("quick");
}

function readDiaries(phrase){

	//phrase = phrase.replace(/\s/,"\\\\s");

	console.log("searching diaries for: "+phrase);

	var url = "slnsw-diaries/dataDiaries.json";
	var sentences = [];

	var data = fs.readFileSync(url);

	data = JSON.parse(data);

	//console.log(data[0]);

	for(var i=0; i<data.length; i++){

		var path = './slnsw-diaries/diariesPages/'+data[i].diary_id+'/';
		//console.log("searching: "+path);

		var pages = [];
		var dir = fs.readdirSync(path);
			
	    pages=dir;

	    for(var k=0; k<pages.length; k++){

	    	var fullPath = 'slnsw-diaries/diariesPages/'+data[i].diary_id+'/'+pages[k];
			var file = fs.readFileSync(fullPath, 'utf8');
				
			//var re = new RegExp(phrase,'gim');
			//var result = file.match(/\(?[A-Z][^\.]+\)?stand\slooking\(?[A-Z][^\.]+[\.!\?]+\)?/gi);
			//var re = new RegExp('\\(?[A-Z][^\\.]+\\)?'+phrase+'\\(?[A-Z][^\\.]+[\\.!\\?]+\\)?',"gim");
			// \(?[A-Z][^\.]+\)?old\sman\(?[^\.]+[\.]\)?
			var re = new RegExp('\\(?[A-Z][^\\.]+\\)?'+phrase+'\\(?[^\\.]+[\\.]\\)?',"gim");
			var result = file.match(re);

			if(result!==null){
				// http://transcripts.sl.nsw.gov.au/page/274151/view
				var strip = pages[k].replace(".txt","");
				var ob = {
					"title":data[i].title,
					"don":data[i].don,
					"page":strip,
					"sentences":result
				}
				// sentences = sentences.concat(result);
				sentences.push(ob);
			}

		}

		    
	}
	for(var j=0; j<sentences.length; j++){
		console.log(sentences[j]);
	}
	return sentences;

}

loadPosters();


