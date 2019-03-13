var path = require("path");
var fs = require("fs");
var corpus = String(fs.readFileSync(path.join(__dirname, "./corpus")));
//console.log("\nInitializing spellchecker!\n");

/*
  Returns an object with each unique word in the input as a key,
  and the count of the number of occurances of that word as the value.
  (HINT: the code `text.toLowerCase().match(/[a-z]+/g)` will return an array
  of all lowercase words in the string.)
*/
function getWordCounts(text) {
  var corpusJson = path.join(__dirname, './wordCount.json');

  if (fs.existsSync(corpusJson)) {

    return JSON.parse(fs.readFileSync(corpusJson));

  } else {

    var wordsArray = text.toLowerCase().match(/[a-z]+/g);
    var resultObj = {};
    for (var i = 0; i < wordsArray.length; i++) {
      if (resultObj.hasOwnProperty(wordsArray[i])) {
        resultObj[wordsArray[i]]++;
      } else {
        resultObj[wordsArray[i]] = 1;
      }
    }

    fs.writeFileSync(corpusJson, JSON.stringify(resultObj));
    return resultObj;
  }
}

var WORD_COUNTS = getWordCounts(corpus);
// console.log(WORD_COUNTS)
var alphabet = "abcdefghijklmnopqrstuvwxyz";

/*
  Returns the set of all strings 1 edit distance away from the input word.
  This consists of all strings that can be created by:
    - Adding any one character (from the alphabet) anywhere in the word.
    - Removing any one character from the word.
    - Transposing (switching) the order of any two adjacent characters in a word.
    - Substituting any character in the word with another character.
*/
function editDistance1(word) {
  word = word.toLowerCase().split('');
  var results = [];

  //Adding any one character (from the alphabet) anywhere in the word.
  for (var i = 0; i <= word.length; i++) {
    for (var j = 0; j < alphabet.length; j++) {
      var newWord = word.slice();
      newWord.splice(i, 0, alphabet[j]);
      newWord = newWord.join('');
      if (newWord in WORD_COUNTS && results.indexOf(newWord) == -1) {
        results.push(newWord);
      }
    }
  }

  //Removing any one character from the word.
  if (word.length > 1) {
    for (var i = 0; i < word.length; i++) {
      var newWord = word.slice();
      newWord.splice(i, 1);
      newWord = newWord.join('');
      if (newWord in WORD_COUNTS && results.indexOf(newWord) == -1) {
        results.push(newWord);
      }
    }
  }

  //Transposing (switching) the order of any two adjacent characters in a word.
  if (word.length > 1) {
    for (var i = 0; i < word.length - 1; i++) {
      var newWord = word.slice();
      var r = newWord.splice(i, 1);
      newWord.splice(i + 1, 0, r[0]);
      newWord = newWord.join('');
      if (newWord in WORD_COUNTS && results.indexOf(newWord) == -1) {
        results.push(newWord);
      }
    }
  }

  //Substituting any character in the word with another character.
  for (var i = 0; i < word.length; i++) {
    for (var j = 0; j < alphabet.length; j++) {
      var newWord = word.slice();
      newWord[i] = alphabet[j];
      newWord = newWord.join('');
      if (newWord in WORD_COUNTS && results.indexOf(newWord) == -1) {
        results.push(newWord);
      }
    }
  }


  return results;
}




/* Given a word, attempts to correct the spelling of that word.
  - First, if the word is a known word, return the word.
  - Second, if the word has any known words edit-distance 1 away, return the one with
    the highest frequency, as recorded in NWORDS.
  - Third, if the word has any known words edit-distance 2 away, return the one with
    the highest frequency, as recorded in NWORDS. (HINT: what does applying
    "editDistance1" *again* to each word of its own output do?)
  - Finally, if no good replacements are found, return the word.
*/
function correct(word) {
  if (word in WORD_COUNTS) {
    return true;
  }

  var maxCount = 0;
  var correctWord = word;
  var editDistance1Words = editDistance1(word);
  var editDistance2Words = [];

  for (var i = 0; i < editDistance1Words.length; i++) {
    editDistance2Words = editDistance2Words.concat(editDistance1(editDistance1Words[i]));
  }



  for (var i = 0; i < editDistance1Words.length; i++) {
    // console.log(editDistance1Words[i])
    if (editDistance1Words[i] in WORD_COUNTS) {
      //console.log(editDistance1Words[i], WORD_COUNTS[editDistance1Words[i]])
      if (WORD_COUNTS[editDistance1Words[i]] > maxCount) {
        maxCount = WORD_COUNTS[editDistance1Words[i]];
        correctWord = editDistance1Words[i];
      }
    }
  }
  //console.log('========================================================================')
  var maxCount2 = 0;
  var correctWord2 = correctWord;

  for (var i = 0; i < editDistance2Words.length; i++) {
    if (editDistance2Words[i] in WORD_COUNTS) {
      //console.log(editDistance2Words[i], WORD_COUNTS[editDistance2Words[i]])
      if (WORD_COUNTS[editDistance2Words[i]] > maxCount2) {
        maxCount2 = WORD_COUNTS[editDistance2Words[i]];
        correctWord2 = editDistance2Words[i];
      }
    }
  }

  if (word.length < 6) {
    if (maxCount2 > 100 * maxCount) {
      return correctWord2
    }
    return correctWord;
  } else {
    if (maxCount2 > 4 * maxCount) {
      return correctWord2
    }
    return correctWord;
  };
}

var utilites = {
  'getLongestWord': function () {
    var longestWord = '';
    var maxLen = 0;

    for (var word in WORD_COUNTS) {
      if (word.length >= maxLen) {
        longestWord = word;
        maxLen = word.length;
      }
    }

    return longestWord;
  },

  'getAllLongestWords': function () {
    var longestWordLength = this.getLongestWord().length;
    var listOfLongestWords = [];

    for (var word in WORD_COUNTS) {
      if (word.length == longestWordLength) {
        listOfLongestWords.push(word);
      }
    }

    return listOfLongestWords;
  },

  'createMistake': function (word, mistakeType) {
    var newWord;

    switch (mistakeType) {
      case 'addNewCharacter':
        var loc = this.getRandomInt(word.length);
        var newAlpha = alphabet[this.getRandomInt(alphabet.length)];

        newWord = word.slice(0, loc) + newAlpha + word.slice(loc, );
        break;

      case 'removeCharacter':
        var loc = this.getRandomInt(word.length);

        newWord = word.slice(0, loc) + word.slice(loc + 1, )
        break;

      case 'exchangeTwoCharacters':
        var loc1 = this.getRandomInt(word.length);
        var loc2 = this.getRandomInt(word.length);
        var newWord = word.split('');
        var temp = newWord[loc1];

        newWord[loc1] = newWord[loc2];
        newWord[loc2] = temp;
        newWord = newWord.join('');
        break;

      case 'substituteAnyCharacter':
        var loc = this.getRandomInt(word.length);
        var newWord = word.split('');
        var newAlpha = alphabet[this.getRandomInt(alphabet.length)];

        newWord[loc] = newAlpha;
        newWord = newWord.join('');
    }

    return newWord;
  },

  'createSpellingMistakesInAWord': function (word, numberOfMistakes) {
    var operations = [
      'addNewCharacter',
      'removeCharacter',
      'exchangeTwoCharacters',
      'substituteAnyCharacter'
    ];
    var index;
    var operationsCount = operations.length;
    var SerialNumber;

    for (index = 0; index < numberOfMistakes; index++) {
      SerialNumber = this.getRandomInt(operationsCount);
      word = this.createMistake(word, operations[SerialNumber]);
    }

    return word;
  },

  'getRandomInt': function (maxNumber) {
    return Math.floor(Math.random() * Math.floor(maxNumber));
  }
};

function correctInput(input) {
  /*
    This script runs your spellchecker on every input you provide.
  */
  var correctWord;
  var correction = correct(input);
  if (correction === true) {
    correctWord = true;
  } else if (typeof correction === "undefined" || correction == input) {
    correctWord = false;
  } else {
    correctWord = correction;
  }

  return correctWord;
  //console.log("\nFinished!");
}

function takeInputFromUser() {
  var userInput = "how to add btton in html";
  var correctedInput = [];
  var index;

  userInput = userInput.split(' ');
  for (index = 0; index < userInput.length; index++) {
    var correctedWord = correctInput(userInput[index]);

    if (correctedWord == false) {
      console.log("THERE IS NOTHING LIKE: " + userInput.join(' '));
      return;
    } else if (correctedWord == true) {
      correctedWord = userInput[index].toLowerCase();
    } else {
      correctedWord = correctedWord.toUpperCase();
    }
    correctedInput.push(correctedWord);
  }

  correctedInput = correctedInput.join(' ');
  if (correctedInput === userInput.join(' ')) {
    console.log("Nothing to correct");
  } else {
    console.log("did you mean: " + correctedInput);
  }
}

takeInputFromUser();