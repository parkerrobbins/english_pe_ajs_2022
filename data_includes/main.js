PennController.ResetPrefix(null) // Shorten command names (keep this line here)

var showProgressBar = false;

DebugOff()   // Debugger is closed

const participantid = b64_md5((Date.now() + Math.random() + Math.random()).toString()) // Create par
const today = new Date()
const dateToday = String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0') + '/' + today.getFullYear()

Header(
  // Declare global variables to store the participant's ID and demographic information
  newVar('ID').global(),
  newVar('COUNTRY').global(),
  newVar('NATIVE').global(),
  newVar('AGE').global(),
  newVar('PROVINCE').global()

)
// Add the particimant info to all trials' results lines
  .log('id', getVar('ID'))
  .log('native', getVar('NATIVE'))
  .log('age', getVar('AGE'))
  .log('participantID', participantid)
  .log('date_today', dateToday)

// Sequence of events: consent to ethics statement required to start the experiment, participant information, instructions, exercise transition screen, main experiment, result logging, and end screen.
// Sequence("ethics", "setcounter", "participants", "instructions", randomize("exercise"), "start_experiment", rshuffle("experiment-filler", "experiment-item"), "demographics", SendResults(), "end")
// Sequence("ethics", "setcounter", "participants", "instructions", "start_experiment", "demographics", SendResults(), "end")
// Sequence("ethics", "setcounter", "participants", "demographics",
// Sequence("participants", "english", "get_country", "get_other_country", "get_canada_region", "get_us_region", "get_age", SendResults(), "end")
Sequence("ethics", "setcounter", "participants", "instructions", "exercise1", "exercise2", "exercise3",  rshuffle("experiment-filler", "experiment-nonfactorial", anyOf("experiment-A", "experiment-B", "experiment-C", "experiment-D", "experiment-E", "experiment-F", "experiment-G", "experiment-H")), "demographics", "english", "get_country", "get_other_country", "get_canada_region", "get_us_region", "get_age", SendResults(), "end", SendResults(), "end2")
// Sequence("participants")
// Sequence("ethics", SendResults(), "end")
//Sequence('end', 'end2')

// Ethics agreement: participants must agree before continuing
newTrial('ethics',
  newHtml('ethics_explanation', 'ethics1.html')
    .cssContainer({ margin: '1em' })
    .print()
  ,
  newHtml('form', '<div style="width: i600px; margin: 10px 50px 30px auto;"><input name=\'consent\' id=\'consent\' type=\'checkbox\' style="float: left; margin: 10px 40px; width: 20px; height: 20px;"><label for=\'consent\' style = "display: block; margin: -10px 10px;">I have understood what I read above and voluntarily consent to participate in this experiment.</label></div>')
    .cssContainer({ margin: '1em 0em' })
    .center()
    .print()
  ,
  newFunction(() => $('#consent').change(e => {
    if (e.target.checked) getButton('go_to_info').enable()._runPromises()
    else getButton('go_to_info').disable()._runPromises()
  })).call()
  ,
  newText('dateInstructions', "Please enter today's date in MM/DD/YYYY format.")
    .center()
    .print()
  ,
  newTextInput('date')
    .length(10)
    .cssContainer({ margin: '1em 2em' })
    .scaling('1.5')
    .center()
    .size(100, 25)
    .log()
    .print()
  ,
  // Clear error messages if the participant changes the input
  newKey('just for callback', '')
    .callback(getText('errorDate').remove())
  ,
  // Continue. Only validate a click when ID and age information is input properly
  defaultText.color('Crimson').print()
  ,
  newHtml('ethics_explanation', 'ethics2.html')
    .cssContainer({ margin: '0em 1em 1em 1em' })
    .print()
  ,
  newButton('go_to_info', 'Start the experiment')
    .disable()
    .cssContainer({ margin: '1em' })
    .print()
  //        .wait()
  // Check for participant ID and age input
    .wait(
      newFunction('dummy', () => true).test.is(true)
        .and(getTextInput('date').test.text(dateToday)
          .failure(newText('errorDate', "Please enter today's date in MM/DD/YYYY format.")))
    )
)

// Start the next list as soon as the participant agrees to the ethics statement
// This is different from PCIbex's normal behavior, which is to move to the next list once
// the experiment is completed. In my experiment, multiple participants are likely to start
// the experiment at the same time, leading to a disproportionate assignment of participants
// to lists.
SetCounter('setcounter')

newTrial('participants',
  defaultText
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  ,
  newText('participant_info_header', "<div class='fancy'><h2>Earning course credit for your participation</h2><p>Please enter your information accurately below to ensure that you receive course credit for your participation.</p><p><em>Note: This information will be discarded after it is reported to your instructor.</em></p></div>")
  ,
  // Participant ID (6-place)
  newText('firstName', '<b>First name</b><br>')
  ,
  newTextInput('first_name')
    .cssContainer({ margin: '1em 2em' })
    .scaling('1.5')
    .center()
    .log()
    .print()
  ,
  newText('lastName', '<b>Last name</b><br>')
  ,
  newTextInput('last_name')
    .cssContainer({ margin: '1em 2em' })
    .scaling('1.5')
    .center()
    .log()
    .print()
  ,
  // Participant ID (6-place)
  newText('participantID', '<b>Student number</b><br>This should be a 10-digit number.')
  ,
  newTextInput('input_ID')
    .length(10)
    .cssContainer({ margin: '1em 2em' })
    .scaling('1.5')
    .center()
    .log()
    .print()
  ,
  // Participant ID (6-place)
  newText('courseInstructions', '<b>Please select the course you are taking.</b><br>')
  ,
  newDropDown('course', '(course)')
    .add('LIN101', 'LIN102', 'JLP315', 'LIN369', 'LIN476')
    .log()
  //    .labelsPosition("right")
    .print()
    .wait()
  ,
  // Clear error messages if the participant changes the input
  newKey('just for callback', '')
    .callback(getText('errorID').remove(), getText('errorFirstName').remove(), getText('errorLastName').remove())
  ,
  // Continue. Only validate a click when ID and age information is input properly
  defaultText.color('Crimson').print()
  ,
  newButton('weiter', 'Continue')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  // Check for participant ID and age input
    .wait(
      newFunction('dummy', () => true).test.is(true)
      // ID
        .and(getTextInput('input_ID').testNot.text('')
          .failure(newText('errorID', 'Please enter your student number.')))
        .and(getTextInput('first_name').testNot.text('')
          .failure(newText('errorFirstName', 'Please enter your first name.')))
        .and(getTextInput('last_name').testNot.text('')
          .failure(newText('errorLastName', 'Please enter your last name.')))

    )

  // Continue. Only validate a click when ID and age information is input properly
  ,
  // Store the texts from inputs into the Var elements
  getVar('ID').set(getTextInput('input_ID'))
)

// Instructions
newTrial('instructions',
  newText('instructions_greeting', '<h2>Welcome to the experiment!</h2><p>In this study, you will be rating sentences on a scale of 1 to 5.</p><ul><li>Use <strong>5</strong> for sentences that seem <strong>fully normal and understandable</strong> to you.<br /><br /></li><li>Use <strong>1</strong> for sentences that seem <strong>very odd, awkward, or difficult to understand</strong>.<br /><br /></li><li>If your feelings about the sentence are somewhere between these extremes, use whichever one of the middle responses seems most appropriate.</li></ul><p>To practice, select <b>3</b> on the scale below.</p>')
    .left()
    .cssContainer({ margin: '1em' })
    .print()
  ,
  newText('left label', "<div class='fancy'><em>(Very odd, awkward, or difficult to understand)</em></div>")
    .settings.cssContainer({ width: '190px', 'text-align': 'center' })
  ,
  newText('right label', "<div class='fancy'><em>(Fully normal and understandable)</em></div>")
    .settings.cssContainer({ width: '150px', 'text-align': 'center' })
  ,
  newScale('judgment', 5)
    .settings.before(getText('left label'))
    .settings.after(getText('right label'))
    .settings.center()
    .labelsPosition('bottom')
    .color('LightCoral')
    .print()
    .wait()
    // 7-point scale
    // newScale(5)
    //     .before( newText("left", "<div class='fancy'><br>(<em>Very odd, awkward, or difficult to understand</em>)</div>") )
    //     .after( newText("right", "<div class='fancy'><br>(<em>Fully normal and understandable</em>)</div>") )
    //     .center()
    //     .keys()
    //     .labelsPosition("top")
    //     .color("LightCoral")
    //     .cssContainer({"margin":"1em"})
    //     .left()
    //     .print()
  ,
  newText('continue_to_practice', '<p>Now you will have the opportunity to rate some practice sentences!</p><p>When you are ready, select the button below to begin the practice.</p>')
    .print()
  ,
  newButton('go_to_exercise', 'Practice!')
    .cssContainer({ margin: '1em' })
    .print()
    .wait()
)

// Exercise
// Template("exercise.csv", row =>
newTrial('exercise1',
  newText('sentence', 'Luke took his dog for a walk.')
    .cssContainer({ 'margin-top': '2em', 'margin-bottom': '2em' })
    .center()
    .print()
  ,
  newScale(5)
    .keys()
    .log()
    .once()
    .labelsPosition('top')
    .color('LightCoral')
    .center()
    .print()
    .wait()
  ,
  // Wait briefly to display which option was selected
  newTimer('wait', 300)
    .start()
    .wait(),

  newText('continue_to_practice', '<p>You probably gave this sentence a high rating, perhaps a 4 or 5.</p>')
    .print()
  ,
  newButton('go_to_exercise', 'Next')
    .cssContainer({ margin: '1em' })
    .print()
    .wait()
)

newTrial('exercise2',
  newText('sentence', 'The doctor medicine the patient gave.')
    .cssContainer({ 'margin-top': '2em', 'margin-bottom': '2em' })
    .center()
    .print()
  ,
  newScale(5)
    .keys()
    .log()
    .once()
    .labelsPosition('top')
    .color('LightCoral')
    .center()
    .print()
    .wait()
  ,
  // Wait briefly to display which option was selected
  newTimer('wait', 300)
    .start()
    .wait()
  ,
  newText('continue_to_practice', '<p>You probably gave this sentence a low rating, perhaps a 1 or 2.</p>')
    .print()
  ,
  newButton('go_to_exercise', 'Next')
    .cssContainer({ margin: '1em' })
    .print()
    .wait()
)

newTrial('exercise3',
  newText('sentence', 'The teacher and her students went on a field trip to the museum downtown, where they looked at the dinosaur bones.')
    .cssContainer({ 'margin-top': '2em', 'margin-bottom': '2em' })
    .center()
    .print()
  ,
  newScale(5)
    .keys()
    .log()
    .once()
    .labelsPosition('top')
    .color('LightCoral')
    .center()
    .print()
    .wait()
  ,
  // Wait briefly to display which option was selected
  newTimer('wait', 300)
    .start()
    .wait()
  ,
    newText('continue_to_practice', '<p>You probably gave this sentence a high rating, perhaps a 4 or 5. Remember, a sentence can be long but still sound natural.</p>')
    .print()
  ,
    newText('continue_to_experiment', '<p>When you are ready, you can now start the experiment!</p>')
    .print()
  ,
  newButton('go_to_exercise', 'Start the experiment!')
    .cssContainer({ margin: '1em' })
    .print()
    .wait()
)

// Experimental trial
Template('experimental_stimuli_list.csv', row =>
  newTrial('experiment-' + row.CONDITION,
    newText('sentence', row.VALUE) // +'<br>'+row.ITEM+row.CONDITION+'<br>'+row.GROUP)
      .cssContainer({ 'margin-top': '2em', 'margin-bottom': '2em' })
      .center()
      .print()
    ,
    // 7-point scale
    newScale(5)
      .labelsPosition('bottom')
      .log()
      .once()
      .color('LightCoral')
      .center()
      .print()
      .wait()
    ,
    // Wait briefly to display which option was selected
    newTimer('wait', 300)
      .start()
      .wait()
  )
    // Record trial data
    .log('GROUP', row.GROUP)
    .log('ITEM', row.ITEM)
    .log('VALUE', row.VALUE)
    .log('CONDITION', row.CONDITION)
    // .log("CONDITION", row.CONDITION)
    // .log("ADJECTIVE", row.ADJECTIVE)
    // .log("ADVERB"   , row.ADVERB)
)

Template('experimental_stimuli_nolist.csv', row =>
  newTrial('experiment-' + row.ITEM_TYPE,
    newText('sentence', row.VALUE)// +'<br>'+row.ITEM+row.ITEM_TYPE+'<br>')
      .cssContainer({ 'margin-top': '2em', 'margin-bottom': '2em' })
      .center()
      .print()
    ,
    // 7-point scale
    newScale(5)
      .labelsPosition('bottom')
      .log()
      .once()
      .color('LightCoral')
      .center()
      .print()
      .wait()
    ,
    // Wait briefly to display which option was selected
    newTimer('wait', 300)
      .start()
      .wait()
  )
    // Record trial data
    .log('ITEM', row.ITEM)
    .log('VALUE', row.VALUE)
    .log('ITEM_TYPE', row.ITEM_TYPE)
    // .log("CONDITION", row.CONDITION)
    // .log("ADJECTIVE", row.ADJECTIVE)
    // .log("ADVERB"   , row.ADVERB)
)

// Demographic information: questions appear as soon as information is input
newTrial('demographics',
  defaultText
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  ,
  newText('participant_info_header', "<div class='fancy'><h2>Language, Country of Origin, and Age Questionnaire</h2><p>Please answer the following demographic questions about your language background, your country of origin, and your age.</p></div>")
  ,
  // Continue. Only validate a click when ID and age information is input properly
  newButton('weiter', 'Continue')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
    .wait()
)

newTrial('english',
  // Monolingual native English speaker
  newText('<b>Is English the <em>only</em> language you spoke at home growing up?</b>')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  ,
  newScale('native', '&emsp;Yes', '&emsp;No')
    .radio()
    .log()
    .vertical()
    .labelsPosition('right')
    .print()
    .wait()
  ,
  // Continue. Only validate a click when ID and age information is input properly
  newButton('weiter', 'Next')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
    .wait()
)

newTrial('get_country',
  newText('<b>Did you grow up in Canada, the United States, or somewhere else?</b>')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  ,
  newScale('country', '&emsp;Canada', '&emsp;United States', '&emsp;Somewhere else')
    .radio()
    .log()
    .vertical()
    .labelsPosition('right')
    .print()
    .wait()
  ,
  // Continue. Only validate a click when ID and age information is input properly
  newButton('weiter', 'Next')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
    .wait()
  ,
  getVar('COUNTRY').set(getScale('country'))

)

newTrial('get_canada_region',
  getVar('COUNTRY').test.is('&emsp;Canada')
    .success(
      newText('<b>What province or territory did you grow up in?</b>')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
      ,
      newDropDown('province', '(province)')
        .add('Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon')
        // newScale("country", "Newfoundland", "Not Newfoundland")
        //    .radio()
        .log()
        //    .labelsPosition("right")
        .print()
        .wait()
      ,
      // Continue. Only validate a click when ID and age information is input properly
      newButton('weiter', 'Next')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
        .wait()
    )
)

newTrial('get_us_region',
  getVar('COUNTRY').test.is('&emsp;United States')
    .success(
      newText('<b>What state (or US territory) did you grow up in?</b>')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
      ,
      newDropDown('state', '(state)')
        .add('Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Minor Outlying Islands', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'U.S. Virgin Islands', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming')
        // newScale("country", "Newfoundland", "Not Newfoundland")
        //    .radio()
        .log()
        //    .labelsPosition("right")
        .print()
        .wait()
      ,
      // Continue. Only validate a click when ID and age information is input properly
      newButton('weiter', 'Next')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
        .wait()
    )
)

newTrial('get_other_country',
  getVar('COUNTRY').test.is('&emsp;Somewhere else')
    .success(
      newText('<b>Where?</b>')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
      ,
      newTextInput('country_other')
        .cssContainer({ margin: '1em 2em' })
        .scaling('1.5')
        .center()
        .log()
        .print()
      ,
      newButton('weiter', 'Next')
        .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
        .print()
        .wait()
    )
)

newTrial('get_age',
  // Age
  newText('<b>How old are you?</b>')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
  ,
  newDropDown('age', '(age)')
    .add('18-24 years old', '25-34 years old', '35-44 years old', '45-54 years old', '55-64 years old', 'over 65 years old')
    .log()
    .print()
  ,
  // Continue. Only validate a click when ID and age information is input properly
  newButton('weiter', 'Finish study')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
    .wait()
)

//    // Store the texts from inputs into the Var elements
// getVar("GERMAN") .set( getScale("input_german") ),
// getVar("LAND")   .set( getDropDown("land") ),
//    getVar("NATIVE") .set( getScale("native") ),
//    getVar("COUNTRY") .set( getScale("country") ),
//    getVar("AGE")    .set( getDropDown("age") )
// getVar("GENDER") .set( getScale("input_gender") ),
// getVar("HAND")   .set( getScale("input_hand") )
// )

// Final screen: explanation of the goal
newTrial('end',
  newHtml('explain', 'end.html')
    .print()
  ,
  newTextInput('participant_email')
    .cssContainer({ margin: '1em 2em' })
    .scaling('1.5')
    .center()
    .log()
    .print()
  ,
  newButton('weiter', 'Continue')
    .cssContainer({ 'margin-top': '1em', 'margin-bottom': '1em' })
    .print()
    .wait()

)

newTrial('end2',
  newHtml('explain2', 'end2.html')
    .print()
  ,
  // Trick: stay on this trial forever (until tab is closed)
  newButton().wait()
)

//  .setOption('countsForProgressBar', true)
