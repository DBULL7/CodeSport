import React, { Component } from 'react'
import socket from '../../websocket'
import '../../styles/battlemode.css'

class BattleMode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myPoints:0,
      opponentsPoints:0,
      text:"",
      currentQuestion: 0,
      description:["make a object constructor with the property name having a value of chris","make a method named shout that when run, will have the user shout his name followed by is shouting (ex:chris is shouting)","make a method named changeName that when run will allow the argument to be the object propety name's value to be reassigned","make it so that when a object is intinitated with this object constructor, it can have the first argument be assigned to the name's property's value"],
      questions : [
        function test1(arg){
          if(arg == "error"){
            console.log("sorry error in creating user Function")
            ///compoent should explain there was a issue creating the function
            return
          }
          const test = new arg()
          if(test.name==="chris"){
            return true
          }else{
            return false
          }
      },
      function test2(arg){
        if(arg == "error"){
          console.log("sorry error in creating user Function")
          return
        }
        const test = new arg()
        if(!test.shout) return "please make the shout method for the object constructor"
        if(test.shout()==="chris is shouting"){
          return true
        }else{
          return false
        }
      },
      function test3(arg,question,setState){
        if(arg == "error"){
          console.log("sorry error in creating user Function")
          return
        }
        const test = new arg()
        test.changeName("rob")
        if(test.name == "rob"){
          return true
        }else{
          return false
        }

      },
      function test4(arg){
        if(arg == "error"){
          console.log("sorry error in creating user Function")
          return
        }
        const test = new arg("j")
        if(test.name=="j"){
          return true
        }else{
          return false
        }
      }
      ]
    }

    socket.on('challenger point',() => {
      this.challengerPoint()
    })
  }

  getCode(e) {
    if(!e) return
    let text = e.target.innerText
    this.setState({text: text})
  }

  createFunction(arg){
   if(arg.slice(0,8)!=="function")return "error";
   const splitArg =  arg.split("")
   const args = splitArg.splice(splitArg.indexOf("(")+1,(splitArg.indexOf(")") - splitArg.indexOf("("))-1).join("")
   const body = splitArg.splice(splitArg.indexOf("{")+1,splitArg.length-1)
   const useBody = body.splice(0,body.length-2).join('')
   return new Function(args,useBody)
}


  make() {
    if (!this.state.text) return
    const userFunction = this.createFunction(this.state.text)
    const question = this.state.questions[this.state.currentQuestion]
    let outcome = question(userFunction)
      if(outcome){
        console.log("WINNER")
        socket.emit("point won",this.props.battle)
        const updateQuestion = this.state.currentQuestion+1
        const updateMyPoints = this.state.myPoints+1
        this.setState({currentQuestion:updateQuestion,myPoints:updateMyPoints})
      }
  }

 challengerPoint() {
   const updateChallegerPoints = this.state.opponentsPoints+1
   const updateQuestion = this.state.currentQuestion+1
    this.setState({currentQuestion:updateQuestion,opponentsPoints:updateChallegerPoints})
    }

  render() {
    return (
      <div className="app">
        <div id="left-side">
          <div id="terminal" onKeyUp={(e) => {this.getCode(e)}} contentEditable={true}></div>
          <div id="run-button-div">
            <button id="run-button" onClick={() => this.make()}>Run</button>
          </div>
         </div>
         <div id="right-side">
            <div id="repl"></div>
            <div id="scoreboard"></div>
         </div>
        <pre id="code"></pre>
      </div>
  )}
}

export default BattleMode
