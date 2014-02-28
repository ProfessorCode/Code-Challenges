consonantsElement = document.getElementById("consonants");
vowelsElement = document.getElementById("vowels");
resultElement = document.getElementById("result");
devowelateElement = document.getElementById("devowelate");

emvowelateEvokedFromElement = function(){
	startTimeStamp = new Date();
	var result = emvowelate();
	result = (result.toString()).replace(/,/g," ");
	log(result);
	devowelateElement.value = result;
}

emvowelate = function(vowels,consonants,wordChain) {
	if(typeof vowels === "undefined" ) {vowels = vowelsElement.value; consonants = consonantsElement.value;}
	if(typeof wordChain === "undefined" ) {wordChain = []}
	var legitWords,tmp,legitWordFoundInThisLevel = false;//ASSUMPTION : no legit word will be found
	var ilim = (tmp = vowels.length + consonants.length) < 6? tmp : 6;//has a HUGE performance impact, 6 keeps it fast. VERY fast

	log("started processing");
	
	for(var i = 1; i <= ilim; i++) {
		numPairs = numberPairsThatAddUpto(i,vowels.length,consonants.length);
		for(var j = 0; j < numPairs.length; j++) {
			var p = vowels.slice(0,numPairs[j][0]), q = consonants.slice(0, numPairs[j][1]);
			if((legitWords = wordPermutations(p,q)).length !== 0) {
				log("word found : <b>"+legitWords[0]+"</b>, attempting sentence");
				legitWordFoundInThisLevel = true;
				vnew = vowels.slice(numPairs[j][0],vowels.length);
				cnew = consonants.slice(numPairs[j][1] ,consonants.length);
				wordChain.push(legitWords[0]);
				if((vnew == "" && cnew == "")||emvowelate(vnew,cnew,wordChain)) {
					return wordChain; //If last one fits, then we just return all the way till original call
				} else {
					//the chain does not complete in future
					log("sentence attempt failed");
					wordChain.pop();
					continue;
				}
			}
		}
	}
	if(legitWordFoundInThisLevel === false) {
		return false;
	}
}

numberPairsThatAddUpto = function(n,max1,max2) {
	var result = [];
	for(var i = 0; i <=n; i++) {
		if(i <= max1 && n-i <= max2) {
			result.push([i,n-i]);
		}
	}
	return result;
}

wordPermutations = function(a,b){
	var x = new Date();
	var len = a.length + b.length,minlen = Math.min(a.length,b.length);//minlen helps in optimization of calculation of combinations, while combinations stay the same, full list increases by a factor of n as in c(n,r)
	var result = [];
	var c = combinations(len,minlen);

	if(b.length === minlen) { // perform a swap if necessary so that smaller string is in var a
		var tmp = a; 
		a = b;
		b = tmp;
	}
	for(var i = 0; i < c.length; i++)	{
		var word = "", p = getObjectClone(a), q = getObjectClone(b), k = 0, l = 0;
		for(var j = 0; j < len; j++) {
			if(c[i].indexOf(j) !== -1) {
				word += p[k++];
			} else {
				word += q[l++];
			}
		}
		if(Word_List.isInList(word)) {
			result.push(word);
		}
	}
	if(c.length === 0&&Word_List.isInList(b)) {//C(n,0) = 1, e.g. "", "why" should return one word permutation : why
		result.push(b);
	}
	return result;
}

combinations = function(n,r,ce,result) {
	if(typeof ce === "undefined") { ce = []; result = []}
	
	for(var i = 0; i < n; i++) {
		if(ce.length > 0) {//This if block was added later for optimization, earlier this function was used to just list all the possible permutations with repetition allowed
			if(i < ce[ce.length - 1]||ce.indexOf(i) !== -1) {//First condition removes duplicate combinations (123,231), second removes impossible combinations (113)
				continue;
			}
		}
		ce.push(i);
		if(ce.length == r) {
			result.push(getObjectClone(ce)); //objects are otherwise passed by reference in js
			ce.pop();
		} else {
			ce = combinations(n,r,ce,result);
		}
	}
	
	if(ce.length==0) {
		return result;
	}
	
	ce.pop();
	return ce;
}

devowelate = function (x) {
	if(typeof x == "undefined") {x = devowelateElement.value;}
	var s = x.replace(/ /g,"").eqArray();
	var v = "aeiouAEIOU".eqArray();
	var a = s.map(function(e){
		if(v.indexOf(e) === -1) {
			return "";
		}
		return e;
	});
	var b = s.map(function(e){
		if(v.indexOf(e) !== -1) {
			return "";
		}
		return e;
	});
	a = a.eqString();
	b = b.eqString();
	vowelsElement.value = a;
	consonantsElement.value = b;
	return { v : a, c : b};
}

//helper functions 
String.prototype.eqArray = function () {
	var x = [];
	for(var i = 0;i<this.length;i++) {
		x[i] = this[i];
	}
	return x;
}

Array.prototype.eqString = function () {
	return (this.toString()).replace(/,/g,"");
}

Array.prototype.compare = function (array) { //fn to compare two arrays
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

getObjectClone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
}

TD = function(x) {//for time testing
	var y = new Date();
	return (y.valueOf()-x.valueOf())/1000;
}

log = function(msg) {
	console.log(msg + " at "+TD(startTimeStamp)+"s")
	resultElement.innerHTML += "<p>" + msg + " at <span class='time'>"+TD(startTimeStamp)+"s</span>";
}
