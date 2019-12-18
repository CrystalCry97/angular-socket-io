import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-socket-io';
  state = 'RELEASED';
  nodes = [];
  waitQue = [];
  reqPayload : any = {};
  voteCounter = 0;
  numberOfNodes = 0;
  valToUpdate = 0;
  csValue = 0;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.webSocketService.listen('connect').subscribe(() => {
      console.log(this.webSocketService.socket.id)
      var data = {userId:this.webSocketService.socket.id}
      this.webSocketService.emit('setSocketID', data);
    });
    this.webSocketService.listen('nodesList').subscribe((message: any) => {
      console.log(message)
      this.nodes = message;
      this.numberOfNodes = this.nodes.length;
    });
    this.webSocketService.listen('request').subscribe((incomingPayload: any) => {
      console.log('request:'+incomingPayload.id);
      if (this.state == 'RELEASED'){

        var replyPayload = {
          id: this.webSocketService.socket.id,
          reqId: incomingPayload.id
        }
        console.log('Sending reply with Payload'+replyPayload)
        this.webSocketService.emit('reply',replyPayload)
      }
      else{
        //means we want to request to
        // check if their request is earlier than ours
        if(incomingPayload.ts < this.reqPayload.ts)
        {
          //send reply to them,
          replyPayload = {
            id: this.webSocketService.socket.id,
            reqId: incomingPayload.id
          } 
          this.webSocketService.socket.emit('reply',replyPayload)
        }else{
          //add their request in waiting list
          if(this.waitQue.length < 1 || this.waitQue == undefined){
            this.waitQue.push(incomingPayload);
          }else{
            // if(incomingPayload.ts < waitQue.ts){
            //   waitQue = incomingPayload; //the the earlier request
            // }
            this.waitQue.push(incomingPayload)
          }
          
        }
        console.log('waitList:' + this.waitQue.length);
      }
    });
    this.webSocketService.listen('reqReply').subscribe((repliedPayload: any) => {
      console.log('something')
      if(repliedPayload.reqId == this.webSocketService.socket.id){
        console.log('ourID:'+repliedPayload.reqId)
        this.voteCounter +=1;
        if (this.voteCounter == (this.nodes.length-1))
        {
          this.state = 'LOCKING';
          console.log('Accessing CS')
          this.voteCounter = 0;
          this.webSocketService.emit('access_cs',{
            id: this.webSocketService.socket.id,
            msg: this.valToUpdate
          })
        }
      }
    });
    this.webSocketService.listen('valuecs').subscribe((csvalue: any) => {
      console.log('Received CS Value',csvalue);
      this.csValue = csvalue.value;
    });
  }

  request() {
    this.state = 'WANT'

    //send req to all nodes
    this.reqPayload = {
      id: this.webSocketService.socket.id,
      ts: Date.now()
    }
    this.webSocketService.socket.emit('request',this.reqPayload);
  }

  release() {
    this.state = 'RELEASED'

    if(this.waitQue.length > 0){
      for(var i = 0; i < this.waitQue.length;i++)
      {
        var replyPayload = {
          id: this.webSocketService.socket.id,
          reqId: this.waitQue[i].id
        }
        console.log('reply to id:',replyPayload.reqId)
        this.webSocketService.socket.emit('reply',replyPayload);
      }
    }
  }

  valuecs() {
    console.log('getting value')
    this.webSocketService.socket.emit('csvalue');
  }
}
