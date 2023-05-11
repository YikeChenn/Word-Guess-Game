// set url
const Api = (() => {
    const url = "https://random-word-api.herokuapp.com/word"
    const getWord = () => {
        return fetch(url).then((res) => res.json()).catch()
    }
    return{
        getWord
    }
})()

const View = (() => {
    let domSelector = {
        time: '#flexbox_time',
        guessCount: '#flexbox_guessCount_text',
        guessWord: '#flexbox_guessWord_text',
        input: '#flexbox_input_box',
        newGameButton: '#flexbox_newGame_button',
        guessedCharacter: '#flexbox_guessedArea_guessedCh'
    }
    

    // Change the element in HTML
    const render = (ele, temp) => {
        ele.innerHTML = temp
    }

    // Add text in element
    const addText = (ele, temp) => {
        ele.innerHTML += temp
    }

    // Clear users' input
    const emptyTextbox = () => {
        document.querySelector(domSelector.input).value = ''
    }

    return{
        domSelector,
        render,
        addText,
        emptyTextbox
    }
})()

const Model = ((api, view) => {
    const {domSelector, createWord, render, addText, emptyTextbox} = view
    const {getWord} = api

    // Class
    class GuessGame{
        constructor(){
            this.chanceCount = 0
            this.word = []
            this.displayWord = []
            this.guessSuccess = 0
            this.guessedCh = new Set()
            this.time = 0
            this.interval
        }

        // Bouns: Time limit part
        timeSet(){
            clearInterval(this.interval)
            this.time = 0
            render(document.querySelector(domSelector.time), 60)
            this.interval = setInterval(() => {
                if(this.time < 60){
                    this.time++
                    render(document.querySelector(domSelector.time), 60 - this.time)
                }
                else{
                    this.time = 0
                    clearInterval(this.interval)
                    alert('Time out! You have guessed ' + this.getSuccess + ' words! Press New Game to restart.')
                }
            }, 1000)
        }

        // Get success time
        get getSuccess(){
            return this.guessSuccess
        }

        // Create new word and return an array of each character
        createWord(str) {
            let word = str
            let array = word.split('')
            let _count = 0
            // Each character in the word has 50% probability set as '_', and the the number of '_' will be less than the half of the word length
            array.forEach((ele, index, Arr) => {
                if(_count < Math.floor(word.length * 0.5) && Math.random() - 0.5 > 0){
                    Arr[index] = '_'
                    _count++
                }
            })
            return array
        }

        // Set new word
        set setWord(newWord){
            this.word = newWord[0].split('')
            this.displayWord = this.createWord(newWord[0])
            let wordContainer = document.querySelector(domSelector.guessWord)
            let guessedCharacter = document.querySelector(domSelector.guessedCharacter)
            render(wordContainer, this.displayWord.join(' '))
            render(guessedCharacter, '')
            this.guessedCh.clear()
        }

        // Change guess word if guess right, return a bool if the guess is right or not
        guessWord(input){
            let changed = false
            if(this.guessedCh.has(input)) return true
            this.displayWord.forEach((ele, index, arr) => {
                if(ele == '_' && input == this.word[index]){
                    arr[index] = this.word[index]
                    changed = true
                }
            })
            let wordContainer = document.querySelector(domSelector.guessWord)
            render(wordContainer, this.displayWord.join(' '))
            return changed
        }

        // Change guess chance if guess right
        set setChance(changed){
            if(!changed){
                this.chanceCount++
                let chanceContainer = document.querySelector(domSelector.guessCount)
                render(chanceContainer, `${this.chanceCount} / 10`)
            }
        }
    }


    return{
        GuessGame,
        getWord
    }
})(Api, View)

const Controller = ((view, model) => {
    const {domSelector, createWord, render, addText, emptyTextbox} = view
    const {GuessGame, getWord} = model

    const newGame = new GuessGame()
    // Initialize: get new word, reset chance, clear users' input and reset time limit
    const init = () => {
        getWord().then((data) => {
            newGame.setWord = data
        })       
        newGame.chanceCount = 0
        render(document.querySelector(domSelector.guessCount), newGame.chanceCount + ' / 10')
        emptyTextbox()
        newGame.timeSet()
    }

    // Judge if the input is right and if there is chance to guess
    // Bonus: Add guessed character
    const answer_guess = () => {
        const userInput = document.querySelector(domSelector.input)
        const guessedCharacter = document.querySelector(domSelector.guessedCharacter)
        addEventListener('keydown', (event) => {
            if(event.key == "Enter"){
                let guessed = userInput.value
                let changed = newGame.guessWord(guessed)
                // Add guessed letter to the guessed area
                if(guessed != ''){
                    newGame.setChance = changed
                    if(!newGame.guessedCh.has(guessed)){
                        if(changed) addText(guessedCharacter, `<span class="flexbox_guessedArea_guessedCh_true">${guessed} </span>`)
                        else addText(guessedCharacter, `<span>${guessed} </span>`)
                        newGame.guessedCh.add(guessed)
                    }
                    else window.alert('You have guessed this charater! Please Try another one.')
                    emptyTextbox()
                }
                // If the all letters are right, change new word
                if(newGame.word.join('') == newGame.displayWord.join('')){
                    getWord().then((data) => {
                        newGame.setWord = data
                    })
                    newGame.guessSuccess++
                }
                // If there is not chance, alert and reset the game
                if(newGame.chanceCount >= 10){
                    window.alert('Game Over! You have guessed ' + newGame.getSuccess + ' words!')
                    init()
                }
            }
        })
    }

    // Set new game
    const renewGame = () => {
        const btn = document.querySelector(domSelector.newGameButton)
        btn.addEventListener('click', init)
    }



    const bootstrap = () => {
        init()
        answer_guess()
        renewGame()
    }

    return{
        bootstrap
    }

})(View, Model)

Controller.bootstrap()