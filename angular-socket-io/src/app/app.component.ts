import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-socket-io';

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.webSocketService.listen('test event').subscribe((data) => {
      console.log(data);
    });
  }

  deposit() {
    this.webSocketService.emit('deposit', 100);
  }

  withdraw() {
    this.webSocketService.emit('withdraw', 100);
  }

  balance() {
    this.webSocketService.emit('balance', null);
  }
}
