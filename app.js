const categoryData = {
    offensive_signs: "(Offense)",
    defensive_pitching_signs: "(Defense, Pitching)",
    bunt_defense: "(Defense, Bunts)",
    shortstop_coverage: "(Defense, Shortstop)",
    hot_plays: "(Defense, First and Third Hot)",
    cold_plays: "(Defense, First and Third Cold)",
    player_audibles: "(Defense, Audibles)"
}; 
// Baseball signs data
const baseballData = {
  offensive_signs: [
    {indicator: "Bill of the hat", action: "Indicator"},
    {indicator: "Touch or swipe the leg", action: "Steal"},
    {indicator: "Touch the leg twice (back-to-back)", action: "Steal on a 2 count"},
    {indicator: "Touch the leg three times consecutively", action: "Steal on a 3 count"},
    {indicator: "Steal sign, back to the bill of the hat with a number", action: "Steal after x looks"},
    {indicator: "Touch or swipe the belt", action: "Bunt"},
    {indicator: "Swipe down the arms", action: "Hit and Run"},
    {indicator: "Touch the back of my hat/head (no indicator required)", action: "Take a pitch"},
    {indicator: "Swipe the belt + down the leg", action: "Squeeze play"},
    {indicator: "Touch the nose", action: "Fake Bunt"}
  ],
  defensive_pitching_signs: [
    {indicator: "Forehead", action: "Fastball"},
    {indicator: "Chin", action: "Change-up"},
    //{indicator: "Wrist = outside corner, elbow = middle, shoulder = inside", action: "Location"},
    {indicator: "Wrist", action: "Location: Outside Corner"},
    {indicator: "Elbow", action: "Location: Middle"},
    {indicator: "Shoulder", action: "Location: Inside"},
    {indicator: "Top of the hat", action: "Location: Letter high or above"},
    {indicator: "Double tap my wrist", action: "Location: we are missing off the plate (4-6 inches), outside"},
    {indicator: "Tap the nose", action: "Pick to lead base"},
    {indicator: "Tap the ear (1x = first, 2x = second, 3x = third)", action: "Timing picks"}
  ],
  shortstop_coverage: [
    {indicator: "Top of the hat", action: "Quick pitch, zero looks"},
    {indicator: "Chest", action: "1 look"},
    {indicator: "Jersey", action: "2 looks"},
    {indicator: "Belt", action: "3 looks"}
  ],
  player_audibles: [
    {indicator: "Here we go (Jersey number), let's just play catch", action: "Pick play"},
    {indicator: "Just play catch (Jersey number)", action: "Pick play"}
  ],
  hot_plays: [
    {indicator: "Hot (number ending in 1)", action: "Return to the pitcher, pitcher checks the runner at 3rd"},
    {indicator: "Hot (number ending in 2)", action: "Catcher will throw and look for play at third"},
    {indicator: "Hot (number ending in 4)", action: "2nd baseman cuts the ball off and checks the 3rd base runner"},
    {indicator: "Hot (number ending in 5)", action: "Immediate back pick to 3rd base"},
    {indicator: "Hot (number ending in 6)", action: "SS cuts the ball off and checks the 3rd base runner"}
  ],
  cold_plays: [
      {indicator: "Cold (number ending in 4)", action: "SS fake cuts the ball off, throw goes through to 2nd baseman covering"},
      {indicator: "Cold (number ending in 6)", action: "2nd base fake cuts the ball, throw goes through to 2nd base (SS is covering)"}
  ],
  bunt_defense: [
    {indicator: "15 or 51", action: "3rd base and pitcher covering, 1st base stays, 2nd covers 2nd, SS covers 3rd"},
    {indicator: "13 or 31", action: "1st base and pitcher covering, 3rd stays home, 2nd covers 1st, SS covers 2nd"},
    {indicator: "135", action: "Play is at home, all three are crashing, this is a do or die situation"}
  ]
};

// App state
let currentScreen = 'main-menu';
let currentCategory = 'all';
let currentCardIndex = 0;
let currentCards = [];
let isCardFlipped = false;
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let wrongAnswers = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  updateCategoryCounts();
  setupTouchEvents();
});

// Screen navigation
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  currentScreen = screenId;
}

function showMainMenu() {
  showScreen('main-menu');
  resetCardState();
}

function showCategories() {
  showScreen('categories-screen');
}

function showStudyMode() {
  currentCards = getAllCards();
  currentCardIndex = 0;
  startStudyMode('all');
}

function showQuizMode() {
  startQuiz();
}

// Study mode functions
function startStudyMode(category) {
  currentCategory = category;
  
  if (category === 'all') {
    currentCards = getAllCards();
  } else {
    currentCards = baseballData[category] || [];
  }
  
  if (currentCards.length === 0) {
    alert('No cards available for this category');
    return;
  }
  
  currentCardIndex = 0;
  showScreen('study-screen');
  updateCard();
  resetCardState();
}

function getAllCards() {
  let allCards = [];
  Object.keys(baseballData).forEach(category => {
    baseballData[category].forEach(card => {
        const newCard = {...card};
        const cat = categoryData[category];
        newCard.indicator = cat + " " + newCard.indicator;
        newCard.action = cat + " " + newCard.action;
	newCard.category = cat;
        allCards = allCards.concat(newCard);
   });
  });
  return allCards;
}

function updateCard() {
  if (currentCards.length === 0) return;
  
  const card = currentCards[currentCardIndex];
  const frontText = card.indicator || card.play || card.situation || card.numbers || card.call || card.strategy;
  const backText = card.action || card.description || card.coverage || card.meaning;
  
  document.getElementById('card-front-text').textContent = frontText;
  document.getElementById('card-back-text').textContent = backText;
  
  // Update counter and progress
  document.getElementById('card-counter').textContent = `${currentCardIndex + 1} / ${currentCards.length}`;
  updateProgress('study-progress', currentCardIndex + 1, currentCards.length);
  
  // Update navigation buttons
  document.getElementById('prev-btn').disabled = currentCardIndex === 0;
  document.getElementById('next-btn').disabled = currentCardIndex === currentCards.length - 1;
}

function flipCard() {
  const flashcard = document.getElementById('flashcard');
  const flipText = document.getElementById('flip-text');
  
  isCardFlipped = !isCardFlipped;
  
  if (isCardFlipped) {
    flashcard.classList.add('flipped');
    flipText.textContent = 'Show Sign';
  } else {
    flashcard.classList.remove('flipped');
    flipText.textContent = 'Flip Card';
  }
}

function nextCard() {
  if (currentCardIndex < currentCards.length - 1) {
    currentCardIndex++;
    updateCard();
    resetCardState();
  }
}

function previousCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateCard();
    resetCardState();
  }
}

function resetCardState() {
  isCardFlipped = false;
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.remove('flipped');
  document.getElementById('flip-text').textContent = 'Flip Card';
}

// Quiz mode functions
function startQuiz() {
  quizQuestions = generateQuizQuestions();
  currentQuestionIndex = 0;
  quizScore = 0;
  wrongAnswers = [];
  
  showScreen('quiz-screen');
  showQuestion();
}

function generateQuizQuestions() {
  const allCards = getAllCards();
  const shuffled = shuffleArray([...allCards]);
  return shuffled.slice(0, Math.min(10, shuffled.length)).map((card, index) => {
    const question = card.indicator || card.play || card.situation || card.numbers || card.call || card.strategy;
    const correctAnswer = card.action || card.description || card.coverage || card.meaning;
    
    // Generate wrong answers from other cards
    const otherCards = allCards.filter(c => (c !== card) && (c.category == card.category));
    const wrongOptions = shuffleArray(otherCards)
      .slice(0, 3)
      .map(c => c.action || c.description || c.coverage || c.meaning);
    
    const options = shuffleArray([correctAnswer, ...wrongOptions]);
    
    return {
      id: index,
      question,
      options,
      correctAnswer,
      selectedAnswer: null
    };
  });
}

function showQuestion() {
  if (currentQuestionIndex >= quizQuestions.length) {
    showQuizResults();
    return;
  }
  
  const question = quizQuestions[currentQuestionIndex];
  
  document.getElementById('quiz-counter').textContent = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
  document.getElementById('quiz-score').textContent = `Score: ${quizScore}`;
  document.getElementById('question-sign').textContent = question.question;
  
  updateProgress('quiz-progress', currentQuestionIndex + 1, quizQuestions.length);
  
  // Create answer options
  const optionsContainer = document.getElementById('answer-options');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    button.textContent = option;
    button.onclick = () => selectAnswer(option, button);
    optionsContainer.appendChild(button);
  });
  
  document.getElementById('quiz-next-btn').classList.add('hidden');
}

function selectAnswer(answer, buttonElement) {
  const question = quizQuestions[currentQuestionIndex];
  question.selectedAnswer = answer;
  
  // Remove previous selections
  document.querySelectorAll('.answer-option').forEach(btn => {
    btn.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // Mark all buttons to show correct/incorrect
  document.querySelectorAll('.answer-option').forEach(btn => {
    btn.style.pointerEvents = 'none';
    
    if (btn.textContent === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (btn === buttonElement) {
      btn.classList.add('incorrect');
    }
  });
  
  // Update score
  if (answer === question.correctAnswer) {
    quizScore++;
  } else {
    wrongAnswers.push({
      question: question.question,
      correctAnswer: question.correctAnswer,
      selectedAnswer: answer
    });
  }
  
  // Show next button
  document.getElementById('quiz-next-btn').classList.remove('hidden');
}

function nextQuestion() {
  currentQuestionIndex++;
  
  // Re-enable option buttons
  document.querySelectorAll('.answer-option').forEach(btn => {
    btn.style.pointerEvents = 'auto';
  });
  
  showQuestion();
}

function showQuizResults() {
  const percentage = Math.round((quizScore / quizQuestions.length) * 100);
  
  document.getElementById('final-score').textContent = `${quizScore}/${quizQuestions.length}`;
  document.getElementById('score-percentage').textContent = `${percentage}%`;
  
  // Show wrong answers if any
  const wrongAnswersSection = document.getElementById('wrong-answers-section');
  const wrongAnswersList = document.getElementById('wrong-answers-list');
  
  if (wrongAnswers.length > 0) {
    wrongAnswersSection.style.display = 'block';
    wrongAnswersList.innerHTML = '';
    
    wrongAnswers.forEach(wrong => {
      const item = document.createElement('div');
      item.className = 'wrong-answer-item';
      item.innerHTML = `
        <div class="wrong-question">${wrong.question}</div>
        <div class="correct-answer">Correct answer: ${wrong.correctAnswer}</div>
      `;
      wrongAnswersList.appendChild(item);
    });
  } else {
    wrongAnswersSection.style.display = 'none';
  }
  
  showScreen('quiz-results');
}

// Utility functions
function updateProgress(elementId, current, total) {
  const percentage = (current / total) * 100;
  document.getElementById(elementId).style.width = `${percentage}%`;
}

function updateCategoryCounts() {
  document.getElementById('offensive-count').textContent = `${baseballData.offensive_signs.length} cards`;
  document.getElementById('defensive-count').textContent = `${baseballData.defensive_pitching_signs.length} cards`;
  document.getElementById('bunt-count').textContent = `${baseballData.bunt_defense.length} cards`;
  document.getElementById('shortstop-count').textContent = `${baseballData.shortstop_coverage.length} cards`;
  document.getElementById('hot-plays-count').textContent = `${baseballData.hot_plays.length} cards`;
  document.getElementById('cold-plays-count').textContent = `${baseballData.cold_plays.length} cards`;
  document.getElementById('audibles-count').textContent = `${baseballData.player_audibles.length} cards`;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Touch and swipe functionality
function setupTouchEvents() {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  
  const flashcardContainer = document.querySelector('.flashcard-container');
  const flashcard = document.getElementById('flashcard');
  
  if (flashcardContainer && flashcard) {
    // Touch events for flashcard
    flashcard.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    });
    
    flashcard.addEventListener('touchend', (e) => {
      if (!e.changedTouches[0]) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const diffX = Math.abs(endX - startX);
      const diffY = Math.abs(endY - startY);
      const diffTime = endTime - startTime;
      
      // If it's a quick tap (not a swipe)
      if (diffTime < 300 && diffX < 50 && diffY < 50) {
        flipCard();
        return;
      }
      
      // Swipe detection for navigation
      if (diffTime < 500 && diffY < 100) {
        if (diffX > 50) {
          if (endX > startX) {
            // Swipe right - previous card
            previousCard();
          } else {
            // Swipe left - next card
            nextCard();
          }
        }
      }
    });
    
    // Prevent default touch behavior
    flashcard.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
  
  // Add click event for non-touch devices
  if (flashcard) {
    flashcard.addEventListener('click', (e) => {
      // Only trigger on direct clicks, not swipes
      if (!e.type.includes('touch')) {
        flipCard();
      }
    });
  }
}