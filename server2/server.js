const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const os = require('os');
const fs = require('fs');

//database
const mongodb = require('mongodb');
const dbconfig = require('./db');
const client = mongodb.MongoClient;

client.connect(dbconfig.DB,function(err,db){
	if(err){
		console.log('db is not connected')
	}else{
		console.log('db connected success');
	}
})
var users_id = [];

app.get('/',(req,res)=>{ res.send("Hello World We From: "+os.hostname()); });
// app.get('/requesting',(req,res)=>{
// 	res.sendFile(__dirname + '/client/index.html')
// });

io.on('connection',function(socket){
	console.log('a user client connected')

	socket.on('setSocketID',function(data){
		console.log(data);
		var id = data.userId;
		users_id.push(id);
		console.log(users_id);
		//send updated socketids list to all client
		io.emit('nodesList',users_id);

	})
	socket.on('disconnect',function(){
		users_id.pop(socket.id)
		console.log("user disconnected:"+socket.id)
	})

	socket.on('request',(payload)=>{
		console.log(payload)
		socket.broadcast.emit('request',payload);
	})
	socket.on('reply',(payload)=>{
		console.log(payload.reqId)
		// socket.broadcast.emit('reply',payload);
		io.to(payload.reqId).emit('reqReply',payload)
	})

	//do something to critical section
	socket.on('access_cs',(payload)=>{
		console.log('Accessing CS')
		client.connect(dbconfig.DB,(err,client)=>{
			var db = client.db('testswarm');
			db.collection('testcs').updateOne({id:1},{ $set: {users_id:payload.id,
				value:payload.msg}
				
			},{ upsert: true },(err)=>{
				if(err){
					throw err;
				}
				else{
					console.log('Insert success!');
				}
			});
		})
	});

	socket.on('csvalue',()=>{
		console.log('getting value')
		client.connect(dbconfig.DB,(err,client)=>{
			if(err){
				throw err;
			}
			var db = client.db('testswarm');
			var cursor = db.collection('testcs').findOne({id:1});
			cursor.then((data)=>{
				console.log('value:',data);
				io.emit('valuecs',data);
			}).catch((err)=>{ 
				console.log(err);
			})
			
			
		})
		// io.emit('valuecs','testing'
	});

});

http.listen(5000,()=> {console.log("App is listening on port 5000.")});
