**Example:**

https://www.youtube.com/watch?v=pHBo4j6OMmk

**Overview**

This library provides a collection of functions to be used in Max MSP patches for generating musical patterns, rhythms, and transformations. 
The functions include mode definitions, rhythm generation using Bjorklund's algorithm, and pitch class manipulations.

**Installation**

1. Copy the provided JavaScript code into a file with a .js extension.

2. Load the script in your Max MSP patch using the [js] object.

3. Use the functions and modes defined in this library within your Max MSP patch.

**Mode Definitions**

The library includes a variety of musical modes defined as arrays of intervals

Pitch Class Manipulations
PitchClass Class
Defines a pitch class with methods for various musical manipulations.


**Constructor Parameters:**

**note:** The note value.

**octave:** The octave value.


**Methods:**

**pcToKeynum():** Converts pitch class to key number.

**scaleDegree(tonic, mode):** Calculates the scale degree.

**modalTransposition(steps, tonic, mode):** Transposes the pitch class modally.

**keynumToNote():** Converts key number to note.

**quantizeToModeKeynum(tonic, mode):** Quantizes pitch class to mode key number.

**quantizeToModePC(tonic, mode):** Quantizes pitch class to mode pitch class.

**stepsToPC(pc, tonic, mode):** Calculates steps to another pitch class.

**get_scale_degree(tonic, mode):** Gets the scale degree.

**Utility Functions**

**keynumToNote():** Converts key number to note.

**keynumToPitchClass():** Converts key number to pitch class.

**mode_notes_above_note_base():** Generates notes above a pitch base in a mode.

**get_notes_of_key():** Gets notes of a key.

**get_scale_degree():** Gets the scale degree.

**num_steps_from_scale_degree():** Calculates number of steps from a scale degree.

**quantizeKeynumToMode():** Quantizes key number to mode.

**findNearestElement():** Finds the nearest element in an array.

**findNearestElementIndex():** Finds the nearest element index in an array.

**getRandomInt():** Generates a random integer.

**getRandomIntArray():** Generates an array of random integers.

**generateVoicingArray():** Generates a voicing array.

**addOneToArrayElements():** Adds one to array elements.

**addNToArrayElements():** Adds N to array elements.

**addArpToArrayElements():** Adds arpeggio to array elements.

**arpArrayElements():** Creates arpeggio array elements.

**shuffleArray():** Shuffles an array.

**reverseArray():** Reverses an array.

**swapRandomAdjacentPair():** Swaps a random adjacent pair in an array.

**swapRandomAdjacentPairs2():** Swaps random adjacent pairs in an array.

**midiToFrequency():** Converts MIDI note to frequency.

**add12ToNRandomElements():** Adds 12 to N random elements in an array.

**addOctavesToNRandomElements():** Adds octaves to N random elements.

**fillArrayWithRandomElements()**: Fills an array with random elements.

**getIndexFromDiffSizeArr():** Gets index from different size arrays.

**createVelocityArray():** Creates a velocity array.
