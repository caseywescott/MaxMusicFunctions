autowatch = 1;

// mode definitions

var modes = {};
  
modes.major = [2, 2, 1, 2, 2, 2, 1];
modes.mixolydian = [2, 2, 1, 2, 2, 1, 2];
modes.dorian = [2, 1, 2, 2, 2, 1, 2];
modes.aeolian = [2, 1, 2, 2, 2, 2, 2];
modes.phrygian = [1, 2, 2, 2, 1, 2, 2];
modes.lydian = [2, 2, 2, 1, 2, 2, 1];
modes.locrian = [1, 2, 2, 1, 2, 2, 2];
modes.barryharris = [2, 2, 1, 2, 1, 1, 2, 1];
modes.pentatonic = [2, 2, 3, 2, 3] // No avoid notes
modes.emahoy = [2, 1, 1, 3, 2, 3] // No avoid notes

modes.hexatonic = [2, 2, 3, 2, 2, 1] // No avoid notes


modes.minor_pentatonic = [3, 2, 2, 3, 2];
modes.minor_hexatonic = [2, 1, 2, 2, 3, 2];

///
/// Rhythm declarations
///

/*
The bjorklund function generates a rhythm pattern using Bjorklund's algorithm. 
This algorithm distributes a specified number of pulses (k) within a total number 
of steps (n) as evenly as possible.

Parameters:

n (Type: Number) - Total number of steps in the rhythm pattern.
k (Type: Number) - Number of pulses to be distributed within the pattern.
Return Value:

Type: Array of Numbers
The function returns an array representing the rhythm pattern. Each element in 
the array is either 0 (representing a rest) or 1 (representing a pulse).
*/

function bjorklund(n, k) {
  const pattern = Array(n).fill(0);
  const counts = Array(k).fill(Math.floor(n / k));

  const remainders = n % k;
  var index = 0;

  for (var i = 0; i < remainders; i++) {
    pattern[index] = 1;
    index += (counts[i] + 1);
  }

  for (var i = remainders; i < k; i++) {
    pattern[index] = 1;
    index += counts[i];
  }

  return pattern;
}
//const pattern2 = bjorklund(7, 3);

///
/// PitchClass declarations
///

/// Define constants
var octavebase = 12;

// PitchClass class definition
function PitchClass(note, octave) {
    this.note = note % octavebase;
    this.octave = octave || Math.floor(note / octavebase);

    // pcToKeynum method
    this.pcToKeynum = function() {
        var keynum = this.note + octavebase * this.octave;
        return keynum;
    }

    // scaleDegree method
    this.scaleDegree = function(tonic, mode) {
        var key_arr = get_notes_of_key_fix(tonic, mode);
        return key_arr.indexOf(this.note);
    }

    // modalTransposition method
    this.modalTransposition = function(steps, tonic, mode) {
        var key_arr = get_notes_of_key(tonic, mode);
        var scaledegree = this.scaleDegree(tonic, mode);
        var keyn = this.note + octavebase * this.octave;

        var total_steps = num_steps_from_scale_degree_fix(
            scaledegree,
            steps,
            tonic,
            mode
        );

        return new PitchClass(keyn + total_steps);
    }

    // keynumToNote method
    this.keynumToNote = function(keynum) {
        return keynum % octavebase;
    }

    // quantizeToModeKeynum method
    this.quantizeToModeKeynum = function(tonic, mode) {
        var key_arr = get_notes_of_key(tonic, mode);
        var index = findNearestElement(key_arr, this.note);

        return index + 12 * this.octave;
    }

    // quantizeToModePC method
    this.quantizeToModePC = function(tonic, mode) {
        var key_arr = get_notes_of_key(tonic, mode);
        var index = findNearestElement(key_arr, this.note);

        return new PitchClass(index + 12 * this.octave);
    }

    // stepsToPC method
    this.stepsToPC = function(pc, tonic, mode) {
        var qnote = this.quantizeToModePC(tonic, mode);
        var qpc = pc.quantizeToModePC(tonic, mode);

        var qnotedegree = qnote.get_scale_degree(tonic, mode);
        var qpcdegree = qpc.get_scale_degree(tonic, mode);

        var modal_steps;

        if (qnotedegree > qpcdegree) {
            var octave_diff = qpc.octave - qnote.octave;
            modal_steps = (qpcdegree - qnotedegree) * (mode.length * octave_diff);
        } else {
            var octave_diff = qnote.octave - qpc.octave;
            modal_steps = (qnotedegree - qpcdegree) * (mode.length * octave_diff);
        }

        return modal_steps;
    }

    // get_scale_degree method
    this.get_scale_degree = function(tonic, mode) {
        var quant_pc = this.quantizeToModePC(tonic, mode);
        var key_arr = get_notes_of_key(tonic, mode);
        var index = key_arr.indexOf(quant_pc.note);

        return index;
    }
}

// Utility Functions

function keynumToNote(keynum) {
    return keynum % octavebase;
}

function keynumToPitchClass(keynum) {
    var pc = new PitchClass(keynum % octavebase, Math.floor(keynum / octavebase));
    return pc;
}

function mode_notes_above_note_base(pitchbase, mode) {
    var step_sum = 0;
    var notes = new Array(mode.length);

    for (var i = 0; i < notes.length; i++) {
        step_sum = step_sum + mode[i];
        notes[i] = pitchbase + step_sum;
    }
    return notes;
}

function get_notes_of_key(pc, mode) {
    var step_sum = 0;
    var notes = new Array(mode.length + 1);
    notes[0] = pc.note;

    for (var i = 0; i < mode.length; i++) {
        step_sum = step_sum + mode[i];
        notes[i + 1] = (pc.note + step_sum) % 12;
    }
    return notes;
}

function get_notes_of_key_fix(pc, mode) {
    var step_sum = 0;
    var notes = new Array(mode.length);
    notes[0] = pc.note;

    for (var i = 0; i < mode.length - 1; i++) {
        step_sum = step_sum + mode[i];
        notes[i + 1] = (pc.note + step_sum) % 12;
    }
    return notes;
}

function get_scale_degree(pc, tonic, mode) {
    var key_arr = get_notes_of_key_fix(tonic, mode);
    var index = key_arr.indexOf(pc.note);

    return index;
}

function keynum_to_scale_degree(keynum, tonic, mode) {
    var summ = 0;

    var key_arr = get_notes_of_key(tonic, mode);
    var note = keynumToNote(keynum);
    var index = key_arr.indexOf(note);

    return index;
}

function num_steps_from_scale_degree_fix(scale_degree, num_steps, tonic, mode) {
    var abs_steps = Math.abs(num_steps);
    var sum = 0;
    var currentstep;
    var reverse_mode = reverseArray(mode); // Use a separate function to reverse the array
    var inverted_scale_degree =
        mode.length - 1 - (Math.abs(scale_degree) % mode.length);

    for (var i = 0; i < abs_steps; i++) {
        if (num_steps < 0) {
            var currentstep = (inverted_scale_degree + 1 + i) % mode.length;
            sum = sum - reverse_mode[currentstep];
        } else {
            var currentstep = (scale_degree + i) % mode.length;
            sum = sum + mode[currentstep];
        }
    }

    return sum;
}

// Function to reverse an array
function reverseArray(arr) {
    var reversed = [];
    for (var i = arr.length - 1; i >= 0; i--) {
        reversed.push(arr[i]);
    }
    return reversed;
}

function num_steps_from_scale_degree(scale_degree, num_steps, tonic, mode) {
    var abs_steps = Math.abs(num_steps);
    var sum = 0;
    var currentstep;
    var reverse_mode = reverseArray(mode); // Use a separate function to reverse the array
    var inverted_scale_degree =
        (mode.length - 1 - Math.abs(scale_degree)) % mode.length;

    for (var i = 0; i < abs_steps; i++) {
        if (num_steps < 0) {
            var currentstep = (inverted_scale_degree + Math.abs(i)) % mode.length;
            sum = sum - reverse_mode[currentstep];
        } else {
            var currentstep = (scale_degree + i) % mode.length;
            sum = sum + mode[currentstep];
        }
    }

    return sum;
}

function quantizeKeynumToMode(keynum, tonic, mode) {
    var octave = 12 * Math.trunc(keynum / 12);
    var key_arr = get_notes_of_key(tonic, mode);
    var index = findNearestElement(key_arr, keynum % 12);

    return index + octave;
}

function findNearestElement(array, number) {
    var closest = array[0];
    for (var i = 1; i < array.length; i++) {
        if (Math.abs(array[i] - number) < Math.abs(closest - number)) {
            closest = array[i];
        }
    }
    return closest;
}


function findNearestElementIndex(array, number) {
    var closestIndex = -1;
    var closestDifference = Number.MAX_VALUE;

    for (var i = 0; i < array.length; i++) {
        var difference = Math.abs(array[i] - number);
        if (difference < closestDifference) {
            closestDifference = difference;
            closestIndex = i;
        }
    }

    return closestIndex;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntArray(n, min, max) {
    var outputArray = [];
    var range = max - min + 1; // Calculate the range once

    for (var i = 0; i < n; i++) { // Use n instead of n+1
        outputArray.push(Math.floor(Math.random() * range) + min);
    }

    return outputArray;
}

// array of voicings denoted by interval steps from a given pitch class + mode

function generateVoicingArray() {
    var randomArray = [[2,4],[-1,2,4],[2,4,6],[2,4,5],[1,4],[2,4,6,8],[-1,-3,2],[2,-3,-6],[1,2,4],[-3,-6],[2,4,6,8],[4,5]];
//return randomArray[getRandomInt(0,randomArray.length-1)];
return randomArray[getRandomInt(0,randomArray.length-1)];

}

function addOneToArrayElements(pc, tonic, mode) {
 var inputArray = generateVoicingArray();   
 var outputArray = [];

	 outputArray.push(pc.pcToKeynum());

    for (var i = 0; i < inputArray.length; i++) {
  		var updatedValue = pc.modalTransposition(inputArray[i], tonic, mode);
        outputArray.push(updatedValue.pcToKeynum());
    }
    return outputArray;
}

function addNToArrayElements(inputArray, tonic, mode) {
 var inputArray = generateVoicingArray();   
 var outputArray = [];

	 outputArray.push(pc.pcToKeynum());

    for (var i = 0; i < inputArray.length; i++) {
  		var updatedValue = pc.modalTransposition(inputArray[i], tonic, mode);
        outputArray.push(updatedValue.pcToKeynum());
    }
    return outputArray;
}

function addArpToArrayElements(inputArray, numoctaves) {
 var outputArray = [];
 var inputArray = inputArray.sort();

for (var j = 0; j < numoctaves; j++) {
    for (var i = 0; i < inputArray.length; i++) {
  		var updatedValue =  (inputArray[i]-12) + (j * 12);  //(inputArray[i] - 0) + (i * 12);
        outputArray.push(updatedValue);
    }
}
    return outputArray;
}


function arpArrayElements(inputArray, numoctaves, mode) {
 var outputArray = [];

if(mode == 0){
var inputArray = inputArray.sort();
}

if(mode == 2){
var inputArray = shuffleArray(inputArray.sort());
}

if(mode == 3){
var inputArray = reverseArray(swapRandomAdjacentPair(inputArray.sort()));
}

if(mode == 4){
var inputArray = reverseArray(swapRandomAdjacentPairs2(inputArray.sort(),2));
}
  

for (var j = 0; j < numoctaves; j++) {
    for (var i = 0; i < inputArray.length; i++) {
  		var updatedValue =  (inputArray[i]-12) + (j * 12);  //(inputArray[i] - 0) + (i * 12);
        outputArray.push(updatedValue);
    }
}

if(mode == 1){
var outputArray = reverseArray(outputArray.sort());
}


    return outputArray;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function reverseArray(inputArray) {
    return inputArray.slice().reverse();
}

function swapRandomAdjacentPair(arr) {
  if (arr.length < 2) {
    return arr; // Array is too short to swap
  }

  const index = Math.floor(Math.random() * (arr.length - 1)); // Generate a random index

  // Swap the adjacent elements at the generated index
  const temp = arr[index];
  arr[index] = arr[index + 1];
  arr[index + 1] = temp;

  return arr;
}

function swapRandomAdjacentPairs2(arr, n) {
  if (n <= 0 || arr.length < 2) {
    return arr; // No swaps needed or array too short
  }

  for (var i = 0; i < n; i++) {
    var index1 = Math.floor(Math.random() * (arr.length - 1));
    var index2 = index1 + 1;

    // Swap the elements
    var temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
  }

  return arr;
}

function addNToArrayElements(inputArray, n) {
    var outputArray = [];

    for (var i = 0; i < inputArray.length; i++) {
        var updatedValue = inputArray[i] + n;
        outputArray.push(updatedValue);
    }
    return outputArray;
}

function midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function add12ToNRandomElements(array, n) {
    if (n > array.length) {
        throw new Error('Cannot increment more elements than in the array');
    }

    var newArray = array.slice(); // Create a copy of the original array
    var availableIndices = [];
    for (var i = 0; i < newArray.length; i++) {
        availableIndices.push(i);
    }


    for (var i = 0; i < n; i++) {
        var randomIndex = Math.floor(Math.random() * availableIndices.length);
        var chosenIndex = availableIndices[randomIndex];

        newArray[chosenIndex] += 12;
        availableIndices.splice(randomIndex, 1);
    }

    return newArray;
}

function addOctavesToNRandomElements(array, n, dec) {
    if (n > array.length) {
        throw new Error('Cannot increment more elements than in the array');
    }

    var newArray = array.slice(); // Create a copy of the original array
    var availableIndices = [];
    for (var i = 0; i < newArray.length; i++) {
        availableIndices.push(i);
    }

        var randomIndex2 = Math.floor(Math.random(3));

var octave_val = 12;
if(randomIndex2 == 1){
	octave_val = 0;
}
if(randomIndex2 == 0){
	octave_val = 24;
}

    for (var i = 0; i < n; i++) {
        var randomIndex = Math.floor(Math.random() * availableIndices.length);
        var chosenIndex = availableIndices[randomIndex];

	
        
        availableIndices.splice(randomIndex, 1);
    }

    return newArray;
}

function fillArrayWithRandomElements(inputArray, n) {
  var newArray = [];
  
  for (var i = 0; i < n; i++) {
    var randomIndex = Math.floor(Math.random() * inputArray.length);
    newArray.push(inputArray[randomIndex]);
  }
  
  return newArray;
}


function getIndexFromDiffSizeArr(idx, arr1len, arr2len) {
    var index = idx / arr1len; // percentage into array 
    var index2 = index * arr2len; // percentage into new array 
    var roundedidx = Math.floor(index2); // percentage into new array 

    return roundedidx;
}


function createVelocityArray(n) {
  var newArray = [];
newArray.push(2);

	if(n > 1){
 for (var i = 0; i < n-1; i++) {
    newArray.push(1);
  }
}
  return newArray;
}


///////////////////////////////////////////////////

// function to create random minimalist texture


var p = this.patcher;
var c_voicing;

function phrygian_gates_1(){
	
var init_len = getRandomInt(3, 7);
var voice1_length = init_len;
var voice2_length = voice1_length-1;
var voice3_length = voice2_length-1;
var notearray = [];
var notearray2 = [];
var notearray3 = [];
var mode = modes.mixolydian;
var tonic = new PitchClass(0, 5); // Note: 7 (G), Octave: 4
var rand_list1 = getRandomIntArray(voice1_length,0,5);
var rand_list2 = getRandomIntArray(voice2_length,2,5);
var rand_list3 = getRandomIntArray(voice3_length,-1,-5);

var pclist1 = [];
var pclist2 = [];
var pclist3 = [];

  for (var i = 0; i < voice1_length; i++) {
    var outnote =  tonic.modalTransposition(rand_list1[i],tonic,mode);
        pclist1.push(outnote);
        notearray.push(outnote.pcToKeynum());
  }

for (var i = 0; i < voice2_length; i++) {
	var updatedidx = getIndexFromDiffSizeArr(i, voice2_length, voice1_length);
    var outnote2 =  pclist1[0].modalTransposition(rand_list2[i],tonic,mode);

        pclist2.push(outnote2);
		notearray2.push(outnote2.pcToKeynum());
  }

for (var i = 0; i < voice3_length; i++) {
	var updatedidx = getIndexFromDiffSizeArr(i, voice3_length, voice1_length);
    var outnote3 =  pclist1[0].modalTransposition(rand_list3[i],tonic,mode);

        pclist3.push(outnote3);
		notearray3.push(outnote3.pcToKeynum());
  }

post("getIndexFromDiffSizeArr");
post(getIndexFromDiffSizeArr(2,voice2_length, voice1_length));

	post(notearray);
	post("notearray2");
	post(notearray2);
	post("rand_list3");
	post(rand_list3);
	post("createVelocityArray");
	post(createVelocityArray(5));
	
	var c_note = p.getnamed("p_list1");
	var c_note2 = p.getnamed("p_list2");
	var c_note3 = p.getnamed("p_list3");
	
	var tempo_1 = p.getnamed("tempo1");
	var tempo_2 = p.getnamed("tempo2");
	var tempo_3 = p.getnamed("tempo3");
	
	var acc1 = p.getnamed("acc1");
	var acc2 = p.getnamed("acc2");
	var acc3 = p.getnamed("acc3");
	
c_note.set(notearray);
c_note2.set(notearray2);
c_note3.set(notearray3);

tempo_1.set(1000/voice1_length);
tempo_2.set(1000/voice2_length);
tempo_3.set(1000/voice3_length);

acc1.set(createVelocityArray(init_len));
acc2.set(createVelocityArray(voice2_length));
acc3.set(createVelocityArray(voice3_length));

}

// function to create random notes

function modaltrans_accel1(){
	var c_note = p.getnamed("chordnotes1");
	var c_note2 = p.getnamed("chordnotes1[1]");
	
	var nl = p.getnamed("newlist");
	
var notearray = [];
		var notelist = c_note.getattr('boxatoms');
		var mode = modes.lydian;
		var tonic = new PitchClass(0, 5); // Note: 7 (G), Octave: 4
	//	var pitch2 = keynumToPitchClass(vcoi); // Note: 7 (G), Octave: 4
	var rando1 = 	getRandomInt(-2,-3);
	var rando2 = 	getRandomInt(-2,-3);
	var rando3 = 	getRandomInt(-2,-3);
	post(notelist[0])
	 for (var i = 0; i < notelist.length; i++) {
  		var pitch2 = keynumToPitchClass(notelist[i]);
	var outnote =  pitch2.modalTransposition(-1,tonic,mode);
        notearray.push(outnote.pcToKeynum());
    }
c_note.set(notearray);
c_note2.set(notearray);

}

// function to create random notes

function modaltrans_accel(){
	var c_voicing2 = p.getnamed("accel_note");
		var trans_accel_note = p.getnamed("trans_accel_note");
		var accel_note2 = p.getnamed("accel_note2");
			var accel_note3 = p.getnamed("accel_note3");

		var vcoi = c_voicing2.getattr('boxatoms');
		var mode = modes.lydian;
		var tonic = new PitchClass(0, 5); // Note: 7 (G), Octave: 4
		var pitch2 = keynumToPitchClass(vcoi); // Note: 7 (G), Octave: 4
	var rando1 = 	getRandomInt(-2,-3);
	var rando2 = 	getRandomInt(-2,-3);
	var rando3 = 	getRandomInt(-2,-3);
	post(rando1)
var third = pitch2.modalTransposition(2,tonic,mode);
var third2 = third.modalTransposition(rando2,tonic,mode);
var third3 = third2.modalTransposition(rando2,tonic,mode);

//accel_note2.set(third);
//var third_quality = third - pitch2.pcToKeynum();

trans_accel_note.set(third.pcToKeynum());
accel_note2.set(third2.pcToKeynum());
accel_note3.set(third3.pcToKeynum());

}

function createObject2(){
	var c_voicing = p.getnamed("chordvoicing");
		var obj2 = p.getnamed("obj2");
	var vcoi = c_voicing.getattr('boxatoms');
	
obj2.set(addOctavesToNRandomElements(fillArrayWithRandomElements(add12ToNRandomElements(vcoi,2),3)));
//	var obj2 = p.getnamed("obj2");

var chordcount = p.getnamed("chordcount");
	var chordCountValue = parseInt(chordcount.getvalueof());
	var chordCountValue2 = c_voicing.getvalueof();


post("inside")
post(chordCountValue)
post(chordCountValue2)

}


// compute tendency mask around a pitch class for a given mode
// https://cycling74.com/forums/tendency-masks

function tendency() {
  var tendency = p.getnamed("tendency");
  var randomValues = [];
var tonic = new PitchClass(0, 5); // Note: 7 (G), Octave: 4
var mode = modes.lydian;

  for (var i = 0; i < 800; i++) {
    var randomValue = Math.random();
    var upperLimit = Math.floor(20 * (i / 800))+1;
var numsteps = Math.floor((randomValue - 0.5) * upperLimit * 2);
var note = tonic.modalTransposition(numsteps,tonic,mode).pcToKeynum();
    randomValues.push(note); // Scale to be centered around 0 and convert to integer
  }

  tendency.set(randomValues);
}
	

// These are example functions we can call in our Max Patch!
// In this example, you can set/grab data from this function in your Max patch via the following example pattern:

function createObject(){

// define chord, mode, root note and arpeggio info	
	
var c_voicing = p.getnamed("chordvoicing");
var bass = p.getnamed("bassnote");
var arp = p.getnamed("arp");
var majorminor = p.getnamed("majorminor");

var chordnotearp = p.getnamed("chordarp");
var longarp = p.getnamed("longarp");
var chord_qualty = p.getnamed("quality");
var combdelay = p.getnamed("combdelay");
var octavecomb = p.getnamed("octavecomb");

var chordcount = p.getnamed("chordcount");
var notebaseObj = p.getnamed("notebase");
var bassObj = p.getnamed("bass_keynum");


var notebaseValue = parseInt(notebaseObj.getvalueof());
var chordCountValue = parseInt(chordcount.getvalueof());

var tonic = new PitchClass(0, 5); // Note: 7 (G), Octave: 4
		var mode = modes.barryharris;

var penta = modes.barryharris;
var coinflip = getRandomInt(0,2);

var modenotes = this.get_notes_of_key(tonic,mode);
var penta_modenotes = this.get_notes_of_key(tonic,penta);

var	notebase =	getRandomInt(0,modenotes.length-1);

	if(chordCountValue == 0){
		
	
		if(notebase == 6){notebase = 5;}
		notebaseObj.set(modenotes[notebase]);
			bassObj.set(modenotes[notebase]+36);	


		}else{ //if not downbeat
			
			var chance2 = getRandomInt(0,2);
			
			if(chance2==0){
			bassObj.set(modenotes[notebase]+36);	

				}
}

var outnotebase = modenotes[notebase];

var pitch2 = new PitchClass(outnotebase, 5); // Note: 7 (G), Octave: 4
var third = pitch2.modalTransposition(2,tonic,mode).pcToKeynum();
var third_quality = third - pitch2.pcToKeynum();

majorminor.set(third_quality);

var major = [0,2,-1];
var minor = [0,2,-1];
var qarray = [];

if(third_quality == 4){

  for (var i = 0; i < major.length; i++) {
  		var qupdatedValue = pitch2.modalTransposition(major[i], tonic, mode);
        qarray.push(qupdatedValue.pcToKeynum());
    }

}else{

  for (var i = 0; i < minor.length; i++) {
  		var qupdatedValue = pitch2.modalTransposition(minor[i], tonic, mode);
        qarray.push(qupdatedValue.pcToKeynum());
    }

}

var notes =  addOneToArrayElements(pitch2, tonic, mode);

c_voicing.set(notes);

var obj2 = p.getnamed("obj2");
var vcoi = c_voicing.getattr('boxatoms');

obj2.set(add12ToNRandomElements(vcoi,2));

arp.set(modenotes);
var outa = reverseArray(notes);
//scramble the arp
chordnotearp.set(arpArrayElements(notes,3,4));


if(chordCountValue > getRandomInt(2, 5)){
	chordcount.set(0);
		}else{
			chordcount.set(chordCountValue+1);
			}
		
// Now you can use the chordCountValue in your code
post(modenotes)
var outm = penta_modenotes;
outm.pop();
var outm2 = addNToArrayElements(outm, 72);

longarp.set(arpArrayElements(addNToArrayElements(notes,-12),3,4));

arpArrayElements(qarray,4,0)
chord_qualty.set(arpArrayElements(notes,4,0));

combdtimes = [];

 for (var i = 0; i < notes.length; i++) {
  		var cvalue = notes[i];
        combdtimes.push(1000/midiToFrequency(cvalue));
    }

combdelay.set(2.7272);
post("add12ToNRandomElements(notes,2)")
octavecomb.set(add12ToNRandomElements(notes,2));
post(add12ToNRandomElements(notes,2))
	}
