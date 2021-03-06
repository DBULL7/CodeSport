import React, { Component } from 'react'

class RandomBattle extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startGame: this.props.battleRequest || false,
      lineNumber: 1,
      opponentsPoints: 0,
      text: "",
      challengerLeft: false,
      testsStatus: [],
      currentQuestion: 0,
      gameover: false,
      showCode: false,
      challengerCode: "",
      description: [],
      questions: []
    }
    socket.on('connected random 1v1', (msg) => {
      const message = msg[0]
      this.setState({ startGame: true, description: message.descriptions, questions: message.tests })
    })

    socket.on('challenger left', () => {
      this.setState({ gameover: true, challengerLeft: true })
    })

    socket.on('challenger question', (msg) => {
      this.setState({ opponentsPoints: msg })
      console.log(msg, "ppont")
      console.log(this.state.questions.length, "leng")
      if (msg == this.state.questions.length) {
        this.setState({ gameover: true })
        this.handleApiCall("+ 0")
        socket.emit('send code', {
          code: this.state.text,
          challenger: this.props.battle
        })
      }
    })

    socket.on('challenger code', (msg) => {
      this.setState({ challengerCode: msg })
    })
  }

  componentWillMount() {
    setTimeout(() => {
      this.setState({
        description: this.props.getChallenge[0].descriptions || [],
        questions: this.props.getChallenge[0].tests || []
      })
    }, 5000)
  }

  getCode(e) {
    console.log(e.target.innerText)
    if (e.key === 'Enter') {
      if (this.state.lineNumber == 27) return //NOTE WHY DO WE NEED THIS? COULDNT WE OVERFLOW SCROLL ANY EXTRA LENGTH?
      let addLine = this.state.lineNumber + 1
      this.setState({ lineNumber: addLine })
    }
    //
    if (!e) return
    let text = e.target.innerText
    this.setState({ text: text })
  }

  make() {
    if (this.state.gameover || !this.state.text) return
    if (!this.props.battle || !this.state.startGame) return

    let results = []
    let runTill = this.state.currentQuestion
    runTill += 1
    for (let i = 0; i < runTill; i++) {
      let tester = (new Function(`${this.state.text} ; ${this.state.questions[i]}`))()
      results.push(tester)
    }
    let outcome = results.every(i => i)
    if (!outcome) {
      let failedTest = []
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) {
          this.setState({ currentQuestion: i })
          socket.emit("current question", { question: i, challenger: this.props.battle })
          break;
        }
      }
    } else {
      let updateQuestion = this.state.currentQuestion + 1
      this.setState({ currentQuestion: updateQuestion })
      socket.emit("current question", { question: updateQuestion, challenger: this.props.battle })
      if (updateQuestion == this.state.questions.length) {
        this.setState({ gameover: true })
        this.handleApiCall("+ 1")
        socket.emit('send code', ({ code: this.state.text, challenger: this.props.battle }))
      }
    }
  }

  addLine() {
    let test = []
    for (let i = 1; i <= this.state.lineNumber; i++) {
      let newLine = document.createElement('p')
      newLine.innerText += i
      test.push(newLine)
    }
    let test2 = test.map((line, id) => {
      return <p key={id}>{line.innerHTML}</p>
    })
    return test2
  }

  handleRoute(e) {
    this.props.handleClearOpponent()
    e.preventDefault()
    this.props.history.history.replace('/warroom')
  }

  handleApiCall(win) {
    const d = new Date()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const year = d.getFullYear()
    const score = this.state.currentQuestion == 0 ?
      0 : this.state.currentQuestion + 1

    fetch('/api/v1/score', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `${this.props.user.username}`,
        score: score,
        win: win,
        date: month + " " + day + " " + year
      })
    })
  }

  gameover() {
    if (this.state.gameover) {
      return (
        <div className="gameover-message">
          GAMEOVER
        {this.state.challengerLeft ?
            <div>challenger has fled the battle</div>
            :
            <button onClick={() => { this.handleCodeShow(true) }}>I want to see that other code!</button>
          }
          <button onClick={(e) => { this.handleRoute(e) }}>back to war</button>
        </div>
      )
    }
  }

  handleCodeShow(input) {
    this.setState({ showCode: input })
  }

  showCode() {
    return this.state.showCode ?
      <div className="challenger-code">
        <div>{this.state.challengerCode}</div>
        <button onClick={() => { this.handleCodeShow(false) }}>close</button>
      </div>
      :
      null
  }

  render() {
    return (
      <div className="app">
        <div id="left-side">
          {!this.state.startGame ? null :
            <div id="terminal">
              <div className="line-wrapper">
                <div><div className="line-num">{this.addLine()}</div></div>
                <p id="test" className="line" onKeyDown={(e) => {
                  if (e.keyCode === 9) {
                    e.preventDefault();
                    document.execCommand('indent', true, null);
                  }
                }}
                  onKeyUp={(e) => { this.getCode(e) }} contentEditable={true}></p>
              </div>
            </div>}
          {!this.state.startGame ? null :
            <div id="run-button-div">
              <button id="run-button" onClick={() => this.make()}>Run</button>
            </div>}
        </div>
        {this.state.startGame ? null : <div className="waiting-msg">waiting on challenger</div>}
        <div id="right-side">
          <div id="scoreboard">
            <h4 className="scoreboard-title">Scoreboard</h4>
            <div className="scores">
              <p>Your Score: {this.state.currentQuestion}</p>
              <p>Opponents Score: {this.state.opponentsPoints}</p>
            </div>
            {!this.state.startGame ? null : <p className="test-number">Test {this.state.currentQuestion + 1}</p>}
            {!this.state.startGame ? null :
              <p className="current-question">{this.state.description[this.state.currentQuestion]}</p>}
          </div>
          <div id="repl">
            <button onClick={(e) => { this.handleRoute(e) }}>Exit to War Room</button>
            <p className={this.state.currentQuestion > 0 ? 'green' : 'red'}>Test 1</p>
            <p className={this.state.currentQuestion > 1 ? 'green' : 'red'}>Test 2</p>
            <p className={this.state.currentQuestion > 2 ? 'green' : 'red'}>Test 3</p>
            <p className={this.state.currentQuestion > 3 ? 'green' : 'red'}>Test 4</p>
            <p className={this.state.challengerLeft !== true && this.state.gameover ? 'green' : 'red'}>Test 5</p>
          </div>
        </div>
        {this.gameover()}
        {this.showCode()}
      </div>
    )
  }
}

export default RandomBattle