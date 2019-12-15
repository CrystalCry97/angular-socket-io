from flask import Flask
from flask_socketio import SocketIO, send
import multiprocessing
import time
import colorama
from colorama import Fore, init
init(autoreset=True)

balance = multiprocessing.Value('i', 200)
lock = multiprocessing.Lock()


app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app, cors_allowed_origins="*")

def deposit (balance, lock):
    for i in range(100):
        time.sleep(0.05)
        lock.acquire()
        temp = balance.value
        temp = temp + 1
        balance.value = temp
        lock.release()

def withdraw (balance, lock):
    for i in range(100):
        time.sleep(0.05)
        lock.acquire()
        temp = balance.value
        temp = temp - 1
        balance.value = temp
        lock.release()

@socketio.on('deposit')
def Deposit(value):
    print(Fore.GREEN + f'User deposit amount : {value} \n')
    d = multiprocessing.Process(target=deposit, args=(balance,lock))
    d.start()
    d.join()
    print (Fore.GREEN + 'Done \n')
    socketio.emit('reply', 'Done')

@socketio.on('withdraw')
def Withdraw(value):
    print(Fore.YELLOW + f'User withdraw amount : {value} \n')
    w = multiprocessing.Process(target=withdraw, args=(balance,lock))
    w.start()
    w.join()
    print (Fore.YELLOW + "Done \n")
    socketio.emit('reply', 'Done')

@socketio.on('balance')
def Balance(value):
    print(Fore.CYAN + f"Balance is {balance.value} \n")
    socketio.emit('reply', str(balance.value))

if __name__ == '__main__':
 socketio.run(app)